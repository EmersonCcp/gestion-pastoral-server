import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { TipoPersona } from './entities/tipo-persona.entity';
import { CreateTipoPersonaDto } from './dto/create-tipo-persona.dto';
import { UpdateTipoPersonaDto } from './dto/update-tipo-persona.dto';
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
export class TiposPersonasService {
  constructor(
    @InjectRepository(TipoPersona)
    private repo: Repository<TipoPersona>,
  ) {}

  async create(
    dto: CreateTipoPersonaDto,
  ): Promise<ApiResponse<TipoPersona> | ApiErrorResponse> {
    try {
      const data = this.repo.create(dto);
      const saved = await this.repo.save(data);
      return buildSuccessResponse(saved, '/tipos-personas');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando tipo de persona',
        '/tipos-personas',
      );
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
    user?: any,
  ): Promise<ApiListResponse<TipoPersona> | ApiErrorResponse> {
    try {
      const query: any = {};

      if (filters.movimiento_id) {
        query.movimiento_id = filters.movimiento_id;
      }

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
        '/tipos-personas',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Ocurrió un error obteniendo tipos de personas',
        '/tipos-personas',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<TipoPersona> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({ where: { id } });

      if (!data) {
        return buildErrorResponse(
          'NOT_FOUND',
          `Tipo de persona con ID ${id} no encontrado`,
          `/tipos-personas/${id}`,
        );
      }

      return buildSuccessResponse(data, `/tipos-personas/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/tipos-personas/${id}`,
      );
    }
  }

  async update(
    id: number,
    dto: UpdateTipoPersonaDto,
  ): Promise<ApiResponse<TipoPersona> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Tipo de persona no encontrado',
          `/tipos-personas/${id}`,
        );
      }

      Object.assign(existing, dto);
      const updated = await this.repo.save(existing);

      return buildSuccessResponse(updated, `/tipos-personas/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al actualizar tipo de persona',
        `/tipos-personas/${id}`,
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Tipo de persona no encontrado',
          `/tipos-personas/${id}`,
        );
      }

      await this.repo.remove(existing);

      return buildSuccessResponse(
        null,
        `/tipos-personas/${id}`,
        'Tipo de persona eliminado correctamente',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/tipos-personas/${id}`,
      );
    }
  }
}
