import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { ILike, Repository, DataSource } from 'typeorm';
import { UsuarioRol } from '../usuarios_roles/entities/usuarios_role.entity';
import { UsuarioMovimiento } from '../usuarios_movimientos/entities/usuario_movimiento.entity';
import {
  ApiErrorResponse,
  ApiListResponse,
  ApiResponse,
} from 'src/shared/types/response.types';
import {
  buildErrorResponse,
  buildListResponse,
  buildSuccessResponse,
} from 'src/shared/http/api-response.util';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private repo: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) { }

  async create(
    dto: CreateUsuarioDto,
  ): Promise<ApiResponse<Usuario> | ApiErrorResponse> {
    if (dto.password_encrypted) {
      dto.password_encrypted = await bcrypt.hash(dto.password_encrypted, 10);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { movimiento_ids, ...usuarioData } = dto as any;

      const data = queryRunner.manager.create(Usuario, { ...usuarioData });
      const savedUsuario = await queryRunner.manager.save(data);

      // Asignar rol inicial
      const usuarioRol = queryRunner.manager.create(UsuarioRol, {
        usuario: savedUsuario,
        rol: { id: dto.rol_id },
      });
      await queryRunner.manager.save(usuarioRol);

      // Asignar movimientos
      if (movimiento_ids && movimiento_ids.length > 0) {
        for (const movimiento_id of movimiento_ids) {
          const um = queryRunner.manager.create(UsuarioMovimiento, {
            usuario: savedUsuario,
            movimiento: { id: Number(movimiento_id) },
          });
          await queryRunner.manager.save(um);
        }
      }

      await queryRunner.commitTransaction();
      return buildSuccessResponse(savedUsuario, '/usuarios');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando usuario',
        '/usuarios',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
  ): Promise<ApiListResponse<Usuario> | ApiErrorResponse> {
    try {
      const query: any = {};

      if (filters.nombre) {
        query.nombre = ILike(`%${filters.nombre}%`);
      }

      const [data, total] = await this.repo.findAndCount({
        where: query,
        order: { nombre_completo: 'ASC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: [
          'usuarioRoles',
          'usuarioRoles.rol',
          'usuarioMovimientos',
          'usuarioMovimientos.movimiento',
        ],
      });

      return buildListResponse(data, total, page, per_page, filters, '/usuarios');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Ocurrió un error obteniendo usuarios',
        '/usuarios',
      );
    }
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.repo.findOne({
      where: { email },
      relations: [
        'usuarioMovimientos',
        'usuarioMovimientos.movimiento',
        'parroquia',
      ],
    });
  }

  async findOne(id: number): Promise<ApiResponse<Usuario> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({
        where: { id },
        relations: [
          'usuarioRoles',
          'usuarioRoles.rol',
          'usuarioMovimientos',
          'usuarioMovimientos.movimiento',
        ],
      });

      if (!data) {
        return buildErrorResponse(
          'NOT_FOUND',
          `Usuario con ID ${id} no encontrado`,
          `/usuarios/${id}`,
        );
      }

      return buildSuccessResponse(data, `/usuarios/${id}`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/usuarios/${id}`);
    }
  }

  async update(
    id: number,
    dto: UpdateUsuarioDto,
  ): Promise<ApiResponse<Usuario> | ApiErrorResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await queryRunner.manager.findOne(Usuario, { where: { id } });

      if (!existing) {
        return buildErrorResponse('NOT_FOUND', 'Usuario no encontrado', `/usuarios/${id}`);
      }

      const { rol_id, movimiento_ids, ...usuarioData } = dto as any;

      Object.assign(existing, usuarioData);
      const updated = await queryRunner.manager.save(Usuario, existing);

      // Actualizar rol si viene
      if (rol_id) {
        await queryRunner.manager.delete(UsuarioRol, { usuario: { id: updated.id } });
        const usuarioRol = queryRunner.manager.create(UsuarioRol, {
          usuario: updated,
          rol: { id: rol_id },
        });
        await queryRunner.manager.save(UsuarioRol, usuarioRol);
      }

      // Actualizar movimientos si vienen
      if (movimiento_ids !== undefined) {
        await queryRunner.manager.delete(UsuarioMovimiento, { usuario: { id: updated.id } });

        if (movimiento_ids.length > 0) {
          for (const movimiento_id of movimiento_ids) {
            const um = queryRunner.manager.create(UsuarioMovimiento, {
              usuario: updated,
              movimiento: { id: Number(movimiento_id) },
            });
            await queryRunner.manager.save(UsuarioMovimiento, um);
          }
        }
      }

      await queryRunner.commitTransaction();
      return buildSuccessResponse(updated, `/usuarios/${id}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al actualizar usuario',
        `/usuarios/${id}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse('NOT_FOUND', 'usuario no encontrado', `/usuarios/${id}`);
      }

      await this.repo.remove(existing);

      return buildSuccessResponse(null, `/usuarios/${id}`, 'usuario eliminado correctamente');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/usuario/${id}`);
    }
  }
}
