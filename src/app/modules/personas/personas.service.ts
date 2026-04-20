import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { CreatePersonaRelacionDto } from './dto/persona-relacion.dto';
import { PersonaRelacion } from './entities/persona-relacion.entity';
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
    @InjectRepository(PersonaRelacion)
    private relacionRepo: Repository<PersonaRelacion>,
  ) { }

  async create(
    dto: CreatePersonaDto,
  ): Promise<ApiResponse<Persona> | ApiErrorResponse> {
    try {
      const { tipos_personas_ids, ...rest } = dto;
      const data = this.repo.create(rest);

      if (tipos_personas_ids && tipos_personas_ids.length > 0) {
        data.tiposPersonas = tipos_personas_ids.map(id => ({ id } as any));
      }

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
      const queryBuilder = this.repo.createQueryBuilder('persona')
        .leftJoinAndSelect('persona.tiposPersonas', 'tipo')
        .skip((page - 1) * per_page)
        .take(per_page)
        .orderBy('persona.nombre', 'ASC')
        .addOrderBy('persona.apellido', 'ASC');

      if (filters.movimiento_id) {
        queryBuilder.andWhere('persona.movimiento_id = :movId', { movId: filters.movimiento_id });
      }

      if (filters.nombre) {
        queryBuilder.andWhere('persona.nombre ILIKE :nombre', { nombre: `%${filters.nombre}%` });
      }

      if (filters.apellido) {
        queryBuilder.andWhere('persona.apellido ILIKE :apellido', { apellido: `%${filters.apellido}%` });
      }

      if (filters.documento) {
        queryBuilder.andWhere('persona.documento ILIKE :doc', { doc: `%${filters.documento}%` });
      }

      if (filters.tipo_persona_id) {
        // Filtramos por personas que tengan el ID especificado en su lista de tipos
        queryBuilder.andWhere('tipo.id = :tipoId', { tipoId: filters.tipo_persona_id });
      }

      const [data, total] = await queryBuilder.getManyAndCount();

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
        relations: [
          'tiposPersonas', 
          'relaciones', 
          'relaciones.pariente', 
          'parienteDe', 
          'parienteDe.persona'
        ],
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
      const existing = await this.repo.findOne({ 
        where: { id },
        relations: ['tiposPersonas'] 
      });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Persona no encontrada',
          `/personas/${id}`,
        );
      }

      const { tipos_personas_ids, ...rest } = dto;
      Object.assign(existing, rest);

      if (tipos_personas_ids) {
        existing.tiposPersonas = tipos_personas_ids.map(id => ({ id } as any));
      }

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

  async addRelacion(
    dto: CreatePersonaRelacionDto,
  ): Promise<ApiResponse<PersonaRelacion> | ApiErrorResponse> {
    try {
      const relacion = this.relacionRepo.create(dto);
      const saved = await this.relacionRepo.save(relacion);
      return buildSuccessResponse(saved, '/personas/relaciones');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/personas/relaciones');
    }
  }

  async removeRelacion(
    id: number,
  ): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.relacionRepo.findOne({ where: { id } });
      if (!existing) {
        return buildErrorResponse('NOT_FOUND', 'Relación no encontrada', '/personas/relaciones');
      }
      await this.relacionRepo.remove(existing);
      return buildSuccessResponse(null, '/personas/relaciones', 'Relación eliminada');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/personas/relaciones');
    }
  }
}
