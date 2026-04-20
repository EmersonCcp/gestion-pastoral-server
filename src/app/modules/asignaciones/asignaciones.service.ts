import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Asignacion } from './entities/asignacion.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { Persona } from '../personas/entities/persona.entity';
import {
  buildErrorResponse,
  buildListResponse,
  buildSuccessResponse,
} from 'src/shared/http/api-response.util';
import {
  ApiErrorResponse,
  ApiListResponse,
  ApiResponse,
} from 'src/shared/types/response.types';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(Asignacion)
    private repo: Repository<Asignacion>,
    @InjectRepository(Persona)
    private personaRepo: Repository<Persona>,
  ) {}

  async create(
    dto: CreateAsignacionDto,
  ): Promise<ApiResponse<Asignacion> | ApiErrorResponse> {
    try {
      const asignacion = new Asignacion();
      asignacion.grupo_id = dto.grupo_id;
      asignacion.periodo_id = dto.periodo_id;
      asignacion.aula_id = dto.aula_id ?? null;
      asignacion.dia_reunion = dto.dia_reunion ?? null;
      asignacion.frecuencia = dto.frecuencia ?? null;
      asignacion.hora_inicio = dto.hora_inicio ?? null;
      asignacion.hora_fin = dto.hora_fin ?? null;
      asignacion.movimiento_id = dto.movimiento_id;

      if (dto.persona_ids?.length) {
        asignacion.personas = await this.personaRepo.findBy({
          id: In(dto.persona_ids),
        });
      } else {
        asignacion.personas = [];
      }

      const saved = await this.repo.save(asignacion);
      const withRelations = await this.repo.findOne({
        where: { id: saved.id },
        relations: ['grupo', 'periodo', 'aula', 'personas', 'personas.tiposPersonas'],
      });
      return buildSuccessResponse(withRelations!, '/asignaciones');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando asignación',
        '/asignaciones',
      );
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
    user?: any,
  ): Promise<ApiListResponse<Asignacion> | ApiErrorResponse> {
    try {
      const where: any = {};
      if (filters.grupo_id) where.grupo_id = filters.grupo_id;
      if (filters.periodo_id) where.periodo_id = filters.periodo_id;
      if (filters.persona_id) {
        where.personas = { id: filters.persona_id };
      }
      
      if (filters.movimiento_id) {
        where.movimiento_id = filters.movimiento_id;
      }

      const [data, total] = await this.repo.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: ['grupo', 'periodo', 'aula', 'personas', 'personas.tiposPersonas'],
      });

      return buildListResponse(data, total, page, per_page, filters, '/asignaciones');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Error obteniendo asignaciones',
        '/asignaciones',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<Asignacion> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({
        where: { id },
        relations: ['grupo', 'periodo', 'aula', 'personas', 'personas.tiposPersonas'],
      });

      if (!data) {
        return buildErrorResponse('NOT_FOUND', `Asignación ${id} no encontrada`, `/asignaciones/${id}`);
      }

      return buildSuccessResponse(data, `/asignaciones/${id}`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/asignaciones/${id}`);
    }
  }

  async update(
    id: number,
    dto: UpdateAsignacionDto,
  ): Promise<ApiResponse<Asignacion> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({
        where: { id },
        relations: ['personas'],
      });

      if (!existing) {
        return buildErrorResponse('NOT_FOUND', 'Asignación no encontrada', `/asignaciones/${id}`);
      }

      // Update scalar fields
      if (dto.grupo_id !== undefined) existing.grupo_id = dto.grupo_id;
      if (dto.periodo_id !== undefined) existing.periodo_id = dto.periodo_id;
      if (dto.aula_id !== undefined) existing.aula_id = dto.aula_id;
      if (dto.dia_reunion !== undefined) existing.dia_reunion = dto.dia_reunion;
      if (dto.frecuencia !== undefined) existing.frecuencia = dto.frecuencia;

      // Update personas relation if provided
      if (dto.persona_ids !== undefined) {
        existing.personas = dto.persona_ids.length
          ? await this.personaRepo.findBy({ id: In(dto.persona_ids) })
          : [];
      }

      const updated = await this.repo.save(existing);
      return buildSuccessResponse(updated, `/asignaciones/${id}`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/asignaciones/${id}`);
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });
      if (!existing) {
        return buildErrorResponse('NOT_FOUND', 'Asignación no encontrada', `/asignaciones/${id}`);
      }
      await this.repo.remove(existing);
      return buildSuccessResponse(null, `/asignaciones/${id}`, 'Asignación eliminada');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/asignaciones/${id}`);
    }
  }
}
