import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Parroquia } from './entities/parroquia.entity';
import { CreateParroquiaDto } from './dto/create-parroquia.dto';
import { UpdateParroquiaDto } from './dto/update-parroquia.dto';
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
export class ParroquiasService {
  constructor(
    @InjectRepository(Parroquia)
    private repo: Repository<Parroquia>,
  ) {}

  async create(
    dto: CreateParroquiaDto,
  ): Promise<ApiResponse<Parroquia> | ApiErrorResponse> {
    try {
      const data = this.repo.create(dto);
      const saved = await this.repo.save(data);
      return buildSuccessResponse(saved, '/parroquias');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando parroquia',
        '/parroquias',
      );
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
  ): Promise<ApiListResponse<Parroquia> | ApiErrorResponse> {
    try {
      const query: any = {};

      if (filters.nombre) {
        query.nombre = ILike(`%${filters.nombre}%`);
      }

      const [data, total] = await this.repo.findAndCount({
        where: query,
        order: { nombre: 'ASC' },
        skip: (page - 1) * per_page,
        take: per_page,
      });

      return buildListResponse(
        data,
        total,
        page,
        per_page,
        filters,
        '/parroquias',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Ocurrió un error obteniendo parroquias',
        '/parroquias',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<Parroquia> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({
        where: { id },
      });

      if (!data) {
        return buildErrorResponse(
          'NOT_FOUND',
          `Parroquia con ID ${id} no encontrada`,
          `/parroquias/${id}`,
        );
      }

      return buildSuccessResponse(data, `/parroquias/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/parroquias/${id}`,
      );
    }
  }

  async update(
    id: number,
    dto: UpdateParroquiaDto,
  ): Promise<ApiResponse<Parroquia> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Parroquia no encontrada',
          `/parroquias/${id}`,
        );
      }

      Object.assign(existing, dto);
      const updated = await this.repo.save(existing);

      return buildSuccessResponse(updated, `/parroquias/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al actualizar parroquia',
        `/parroquias/${id}`,
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Parroquia no encontrada',
          `/parroquias/${id}`,
        );
      }

      await this.repo.remove(existing);

      return buildSuccessResponse(
        null,
        `/parroquias/${id}`,
        'Parroquia eliminada correctamente',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/parroquias/${id}`,
      );
    }
  }
}
