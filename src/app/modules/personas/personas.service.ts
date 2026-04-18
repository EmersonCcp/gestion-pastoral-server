import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
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
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private repo: Repository<Persona>,
  ) { }

  async create(
    dto: CreatePersonaDto,
  ): Promise<ApiResponse<Persona> | ApiErrorResponse> {
    try {
      const data = this.repo.create(dto);
      const saved = await this.repo.save(data);
      return buildSuccessResponse(saved, '/personas');
    } catch (error) {
      if (error.code === '23505') {
        return buildErrorResponse(
          'CONFLICT',
          'Ya existe una persona con ese documento',
          '/personas',
        );
      }
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando persona',
        '/personas',
      );
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
    user?: any,
  ): Promise<ApiListResponse<Persona> | ApiErrorResponse> {
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

      if (filters.apellido) {
        query.apellido = ILike(`%${filters.apellido}%`);
      }

      if (filters.documento) {
        query.documento = ILike(`%${filters.documento}%`);
      }

      if (filters.tipo_persona_id) {
        query.tipo_persona_id = filters.tipo_persona_id;
      }

      if (filters.movimiento_id) {
        query.movimiento_id = filters.movimiento_id;
      }

      const [data, total] = await this.repo.findAndCount({
        where: query,
        order: { apellido: 'ASC', nombre: 'ASC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: ['tipoPersona'],
      });

      return buildListResponse(
        data,
        total,
        page,
        per_page,
        filters,
        '/personas',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Ocurrió un error obteniendo personas',
        '/personas',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<Persona> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({
        where: { id },
        relations: ['tipoPersona'],
      });

      if (!data) {
        return buildErrorResponse(
          'NOT_FOUND',
          `Persona con ID ${id} no encontrada`,
          `/personas/${id}`,
        );
      }

      return buildSuccessResponse(data, `/personas/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/personas/${id}`,
      );
    }
  }

  async update(
    id: number,
    dto: UpdatePersonaDto,
  ): Promise<ApiResponse<Persona> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Persona no encontrada',
          `/personas/${id}`,
        );
      }

      Object.assign(existing, dto);
      const updated = await this.repo.save(existing);

      return buildSuccessResponse(updated, `/personas/${id}`);
    } catch (error) {
      if (error.code === '23505') {
        return buildErrorResponse(
          'CONFLICT',
          'Ese documento ya está registrado por otra persona',
          `/personas/${id}`,
        );
      }
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al actualizar persona',
        `/personas/${id}`,
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Persona no encontrada',
          `/personas/${id}`,
        );
      }

      await this.repo.remove(existing);

      return buildSuccessResponse(
        null,
        `/personas/${id}`,
        'Persona eliminada correctamente',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/personas/${id}`,
      );
    }
  }
}
