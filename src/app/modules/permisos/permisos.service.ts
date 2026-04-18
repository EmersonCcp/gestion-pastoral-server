import { Injectable } from '@nestjs/common';
import { CreatePermisoDto } from './dto/create-permiso.dto';
import { UpdatePermisoDto } from './dto/update-permiso.dto';
import { Permiso } from './entities/permiso.entity';
import { DataSource, ILike, Like, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/shared/services/base-service.service';
import { ApiErrorResponse, ApiListResponse, ApiResponse } from 'src/shared/types/response.types';

@Injectable()
export class PermisosService extends BaseService<Permiso> {
  constructor(
    @InjectRepository(Permiso)
    public repo: Repository<Permiso>,
    @InjectDataSource() dataSource: DataSource,
  ) {
    super(repo, dataSource);
  }

  async findAllData(
      page = 1,
      per_page = 10,
      sort_by = 'sujeto',
      sort_dir :any = 'ASC',
      filters: Record<string, any> = {},
    ): Promise<ApiListResponse<Permiso> | ApiErrorResponse> {
      try {
        const query: any = {};
  
        if (filters.sujeto) {
          query.sujeto = Like(`%${filters.sujeto}%`);
        }

        // if (filters.accion) {
        //   query.accion = Like(`%${filters.accion}%`);
        // }
  
        const [data, total] = await this.repo.findAndCount({
          where: query,
          order: { sujeto: sort_dir },
          skip: (page - 1) * per_page,
          take: per_page,
          // relations: ['periodos']
        });
  
        return this.buildListResponse(
          data,
          total,
          page,
          per_page,
          filters,
          '/permisos',
        );
      } catch (error) {
        return this.buildErrorResponse(
          'INTERNAL_ERROR',
          'Ocurrió un error obteniendo permisos',
          '/permisos',
        );
      }
    }

  async findActionsByUsuario(usu_codigo: number): Promise<string[]> {
    try {
      const rows = await this.repo
        .createQueryBuilder('permiso')
        .select([
          'permiso.perm_sujeto AS sujeto',
          'permiso.perm_accion AS accion',
        ])
        .innerJoin(
          'roles_permisos',
          'rp',
          'rp.fk_permiso = permiso.perm_codigo',
        )
        .innerJoin('roles', 'rol', 'rol.rol_codigo = rp.fk_rol')
        .innerJoin('usuarios_roles', 'ur', 'ur.fk_rol = rol.rol_codigo')
        .innerJoin('usuarios', 'usu', 'usu.usu_codigo = ur.fk_usuario')
        .where('usu.usu_codigo = :usu_codigo', { usu_codigo })
        .getRawMany();

      return rows.map((r) => `${r.sujeto}.${r.accion}`);
    } catch (error) {
      console.error(
        '[PermisosService] Error obteniendo permisos del usuario',
        error,
      );
      throw new Error('No se pudieron obtener los permisos del usuario');
    }
  }

  async removeData(
      id: number,
      path: string = '/permisos/:id',
      version = 'v1',
    ): Promise<ApiResponse<any> | ApiErrorResponse> {
      try {
        return await this.dataSource.transaction(async (manager) => {
          const rol = await manager.findOne(Permiso, {
            where: { id },
            relations: { rolPermisos: true },
          });
  
          if (!rol) {
            throw new Error('Permiso not found');
          }
  
          // 🚫 Validación clave
          if (rol.rolPermisos.length > 0) {
            throw new Error(
              'No se puede eliminar el permiso porque tiene roles asociados',
            );
          }
  
          await manager.delete(Permiso, id);
  
          return this.buildSuccessResponse(null, path, version);
        });
      } catch (error) {
        return this.buildErrorResponse(
          'DELETE_PERMISO_FAILED',
          error.message,
          path,
          version,
        );
      }
    }
}
