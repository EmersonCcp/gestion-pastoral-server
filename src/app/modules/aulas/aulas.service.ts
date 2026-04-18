import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Aula } from './entities/aula.entity';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
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
export class AulasService {
  constructor(
    @InjectRepository(Aula)
    private repo: Repository<Aula>,
  ) {}

  async create(
    dto: CreateAulaDto,
  ): Promise<ApiResponse<Aula> | ApiErrorResponse> {
    try {
      const data = this.repo.create(dto);
      const saved = await this.repo.save(data);
      return buildSuccessResponse(saved, '/aulas');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando aula',
        '/aulas',
      );
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
    user?: any,
  ): Promise<ApiListResponse<Aula> | ApiErrorResponse> {
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
      
      if (filters.parroquia_id) {
        query.parroquia_id = filters.parroquia_id;
      }

      if (filters.movimiento_id) {
        query.movimiento_id = filters.movimiento_id;
      }

      const [data, total] = await this.repo.findAndCount({
        where: query,
        order: { nombre: 'ASC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: ['parroquia'],
      });

      return buildListResponse(
        data,
        total,
        page,
        per_page,
        filters,
        '/aulas',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Ocurrió un error obteniendo aulas',
        '/aulas',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<Aula> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({
        where: { id },
        relations: ['parroquia'],
      });

      if (!data) {
        return buildErrorResponse(
          'NOT_FOUND',
          `Aula con ID ${id} no encontrada`,
          `/aulas/${id}`,
        );
      }

      return buildSuccessResponse(data, `/aulas/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/aulas/${id}`,
      );
    }
  }

  async update(
    id: number,
    dto: UpdateAulaDto,
  ): Promise<ApiResponse<Aula> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Aula no encontrada',
          `/aulas/${id}`,
        );
      }

      Object.assign(existing, dto);
      const updated = await this.repo.save(existing);

      return buildSuccessResponse(updated, `/aulas/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al actualizar aula',
        `/aulas/${id}`,
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Aula no encontrada',
          `/aulas/${id}`,
        );
      }

      await this.repo.remove(existing);

      return buildSuccessResponse(
        null,
        `/aulas/${id}`,
        'Aula eliminada correctamente',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/aulas/${id}`,
      );
    }
  }
}
