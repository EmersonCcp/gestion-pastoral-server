import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Movimiento } from './entities/movimiento.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
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
export class MovimientosService {
  constructor(
    @InjectRepository(Movimiento)
    private repo: Repository<Movimiento>,
  ) {}

  async create(
    dto: CreateMovimientoDto,
  ): Promise<ApiResponse<Movimiento> | ApiErrorResponse> {
    try {
      const data = this.repo.create(dto);
      const saved = await this.repo.save(data);
      return buildSuccessResponse(saved, '/movimientos');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando movimiento',
        '/movimientos',
      );
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
  ): Promise<ApiListResponse<Movimiento> | ApiErrorResponse> {
    try {
      const query: any = {};

      if (filters.nombre) {
        query.nombre = ILike(`%${filters.nombre}%`);
      }
      
      if (filters.parroquia_id) {
        query.parroquia_id = filters.parroquia_id;
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
        '/movimientos',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Ocurrió un error obteniendo movimientos',
        '/movimientos',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<Movimiento> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({
        where: { id },
        relations: ['parroquia'],
      });

      if (!data) {
        return buildErrorResponse(
          'NOT_FOUND',
          `Movimiento con ID ${id} no encontrado`,
          `/movimientos/${id}`,
        );
      }

      return buildSuccessResponse(data, `/movimientos/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/movimientos/${id}`,
      );
    }
  }

  async update(
    id: number,
    dto: UpdateMovimientoDto,
  ): Promise<ApiResponse<Movimiento> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Movimiento no encontrado',
          `/movimientos/${id}`,
        );
      }

      Object.assign(existing, dto);
      const updated = await this.repo.save(existing);

      return buildSuccessResponse(updated, `/movimientos/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al actualizar movimiento',
        `/movimientos/${id}`,
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Movimiento no encontrado',
          `/movimientos/${id}`,
        );
      }

      await this.repo.remove(existing);

      return buildSuccessResponse(
        null,
        `/movimientos/${id}`,
        'Movimiento eliminado correctamente',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/movimientos/${id}`,
      );
    }
  }
}
