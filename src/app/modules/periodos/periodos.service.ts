import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Periodo } from './entities/periodo.entity';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';
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
export class PeriodosService {
  constructor(
    @InjectRepository(Periodo)
    private repo: Repository<Periodo>,
  ) {}

  async create(
    dto: CreatePeriodoDto,
  ): Promise<ApiResponse<Periodo> | ApiErrorResponse> {
    try {
      const data = this.repo.create(dto);
      const saved = await this.repo.save(data);
      return buildSuccessResponse(saved, '/periodos');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando periodo',
        '/periodos',
      );
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
    user?: any,
  ): Promise<ApiListResponse<Periodo> | ApiErrorResponse> {
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
      
      if (filters.activo !== undefined) {
        query.activo = filters.activo;
      }

      if (filters.movimiento_id) {
        query.movimiento_id = filters.movimiento_id;
      }

      const [data, total] = await this.repo.findAndCount({
        where: query,
        order: { fecha_inicio: 'DESC' },
        skip: (page - 1) * per_page,
        take: per_page,
      });

      return buildListResponse(
        data,
        total,
        page,
        per_page,
        filters,
        '/periodos',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Ocurrió un error obteniendo periodos',
        '/periodos',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<Periodo> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({ where: { id } });

      if (!data) {
        return buildErrorResponse(
          'NOT_FOUND',
          `Periodo con ID ${id} no encontrado`,
          `/periodos/${id}`,
        );
      }

      return buildSuccessResponse(data, `/periodos/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/periodos/${id}`,
      );
    }
  }

  async update(
    id: number,
    dto: UpdatePeriodoDto,
  ): Promise<ApiResponse<Periodo> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Periodo no encontrado',
          `/periodos/${id}`,
        );
      }

      Object.assign(existing, dto);
      const updated = await this.repo.save(existing);

      return buildSuccessResponse(updated, `/periodos/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al actualizar periodo',
        `/periodos/${id}`,
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Periodo no encontrado',
          `/periodos/${id}`,
        );
      }

      await this.repo.remove(existing);

      return buildSuccessResponse(
        null,
        `/periodos/${id}`,
        'Periodo eliminado correctamente',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/periodos/${id}`,
      );
    }
  }
}
