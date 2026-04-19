import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, In } from 'typeorm';
import { Grupo } from './entities/grupo.entity';
import { Libro } from '../libros/entities/libro.entity';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
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
export class GruposService {
  constructor(
    @InjectRepository(Grupo)
    private repo: Repository<Grupo>,
    @InjectRepository(Libro)
    private libroRepo: Repository<Libro>,
  ) {}

  async create(
    dto: CreateGrupoDto,
  ): Promise<ApiResponse<Grupo> | ApiErrorResponse> {
    try {
      const { libro_ids, ...grupoData } = dto;
      const data = this.repo.create(grupoData);
      
      if (libro_ids && libro_ids.length > 0) {
        data.libros = await this.libroRepo.find({ where: { id: In(libro_ids) } });
      }

      const saved = await this.repo.save(data);
      return buildSuccessResponse(saved, '/grupos');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando grupo',
        '/grupos',
      );
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
    user?: any,
  ): Promise<ApiListResponse<Grupo> | ApiErrorResponse> {
    try {
      const query: any = {};

      if (!user?.isSuperAdmin) {
        if (filters.movimiento_id) {
          query.movimiento_id = filters.movimiento_id;
        }
      }

      if (filters.nombre) {
        query.nombre = ILike(`%${filters.nombre}%`);
      }
      
      if (filters.movimiento_id) {
        query.movimiento_id = filters.movimiento_id;
      }
      
      if (filters.parent_id) {
        query.parent_id = filters.parent_id;
      }

      const [data, total] = await this.repo.findAndCount({
        where: query,
        order: { nombre: 'ASC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: ['movimiento', 'parent', 'libros'],
      });

      return buildListResponse(
        data,
        total,
        page,
        per_page,
        filters,
        '/grupos',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Ocurrió un error obteniendo grupos',
        '/grupos',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<Grupo> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({
        where: { id },
        relations: ['movimiento', 'parent', 'subgrupos', 'libros'],
      });

      if (!data) {
        return buildErrorResponse(
          'NOT_FOUND',
          `Grupo con ID ${id} no encontrado`,
          `/grupos/${id}`,
        );
      }

      return buildSuccessResponse(data, `/grupos/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/grupos/${id}`,
      );
    }
  }

  async update(
    id: number,
    dto: UpdateGrupoDto,
  ): Promise<ApiResponse<Grupo> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Grupo no encontrado',
          `/grupos/${id}`,
        );
      }

      const { libro_ids, ...grupoData } = dto;
      Object.assign(existing, grupoData);

      if (libro_ids) {
        existing.libros = await this.libroRepo.find({ where: { id: In(libro_ids) } });
      } else if (libro_ids === null) {
        existing.libros = [];
      }

      const updated = await this.repo.save(existing);

      return buildSuccessResponse(updated, `/grupos/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al actualizar grupo',
        `/grupos/${id}`,
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Grupo no encontrado',
          `/grupos/${id}`,
        );
      }

      await this.repo.remove(existing);

      return buildSuccessResponse(
        null,
        `/grupos/${id}`,
        'Grupo eliminado correctamente',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/grupos/${id}`,
      );
    }
  }
}
