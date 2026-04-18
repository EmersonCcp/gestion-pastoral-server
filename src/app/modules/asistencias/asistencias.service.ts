import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { AsistenciaPersona, EstadoAsistencia } from './entities/asistencia-persona.entity';
import { CreateAsistenciaDto, UpdateAsistenciaDto } from './dto/asistencias.dto';
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
export class AsistenciasService {
  constructor(
    @InjectRepository(Asistencia)
    private repo: Repository<Asistencia>,
    @InjectRepository(AsistenciaPersona)
    private personaAsistenciaRepo: Repository<AsistenciaPersona>,
  ) {}

  async create(
    dto: CreateAsistenciaDto,
  ): Promise<ApiResponse<Asistencia> | ApiErrorResponse> {
    try {
      const asistencia = new Asistencia();
      asistencia.fecha = dto.fecha;
      asistencia.observacion = dto.observacion ?? null;
      asistencia.grupo_id = dto.grupo_id;
      asistencia.periodo_id = dto.periodo_id;
      asistencia.movimiento_id = dto.movimiento_id;

      const saved = await this.repo.save(asistencia);

      if (dto.persona_estados?.length) {
        const personas = dto.persona_estados.map((p) => {
          const ap = new AsistenciaPersona();
          ap.asistencia_id = saved.id;
          ap.persona_id = p.persona_id;
          ap.estado = p.estado;
          ap.observacion = p.observacion ?? null;
          return ap;
        });
        await this.personaAsistenciaRepo.save(personas);
      }

      const complete = await this.findOne(saved.id);
      return complete;
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando asistencia',
        '/asistencias',
      );
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
    user?: any,
  ): Promise<ApiListResponse<Asistencia> | ApiErrorResponse> {
    try {
      const where: any = {};
      if (filters.grupo_id) where.grupo_id = filters.grupo_id;
      if (filters.periodo_id) where.periodo_id = filters.periodo_id;

      if (!user?.isSuperAdmin) {
        if (filters.movimiento_id) where.movimiento_id = filters.movimiento_id;
      }

      const [data, total] = await this.repo.findAndCount({
        where,
        order: { fecha: 'DESC', created_at: 'DESC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: ['grupo', 'periodo', 'personas'],
      });

      const dataWithSummary = data.map(item => ({
        ...item,
        total_presente: item.personas?.filter(p => p.estado === EstadoAsistencia.PRESENTE).length || 0,
        total_ausente: item.personas?.filter(p => p.estado === EstadoAsistencia.AUSENTE).length || 0,
        total_justificado: item.personas?.filter(p => p.estado === EstadoAsistencia.JUSTIFICADO).length || 0,
        total_miembros: item.personas?.length || 0
      }));

      return buildListResponse(dataWithSummary, total, page, per_page, filters, '/asistencias');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Error obteniendo asistencias',
        '/asistencias',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<Asistencia> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({
        where: { id },
        relations: ['grupo', 'periodo', 'personas', 'personas.persona', 'personas.persona.tipoPersona'],
      });

      if (!data) {
        return buildErrorResponse('NOT_FOUND', `Asistencia ${id} no encontrada`, `/asistencias/${id}`);
      }

      return buildSuccessResponse(data, `/asistencias/${id}`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/asistencias/${id}`);
    }
  }

  async update(
    id: number,
    dto: UpdateAsistenciaDto,
  ): Promise<ApiResponse<Asistencia> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });
      if (!existing) {
        return buildErrorResponse('NOT_FOUND', 'Asistencia no encontrada', `/asistencias/${id}`);
      }

      if (dto.fecha !== undefined) existing.fecha = dto.fecha;
      if (dto.observacion !== undefined) existing.observacion = dto.observacion;

      await this.repo.save(existing);

      if (dto.persona_estados !== undefined) {
        // Simple approach: delete and recreate pivot entries
        await this.personaAsistenciaRepo.delete({ asistencia_id: id });
        
        if (dto.persona_estados.length) {
          const personas = dto.persona_estados.map((p) => {
            const ap = new AsistenciaPersona();
            ap.asistencia_id = id;
            ap.persona_id = p.persona_id;
            ap.estado = p.estado;
            ap.observacion = p.observacion ?? null;
            return ap;
          });
          await this.personaAsistenciaRepo.save(personas);
        }
      }

      return this.findOne(id);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/asistencias/${id}`);
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });
      if (!existing) {
        return buildErrorResponse('NOT_FOUND', 'Asistencia no encontrada', `/asistencias/${id}`);
      }
      await this.repo.remove(existing);
      return buildSuccessResponse(null, `/asistencias/${id}`, 'Asistencia eliminada');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/asistencias/${id}`);
    }
  }

  async getPersonaSummary(personaId: number): Promise<ApiResponse<any> | ApiErrorResponse> {
    try {
      const history = await this.personaAsistenciaRepo.find({
        where: { persona_id: personaId },
        relations: ['asistencia', 'asistencia.grupo', 'asistencia.periodo'],
      });

      const groupsMap = new Map<string, any>();

      history.forEach((entry) => {
        const groupName = entry.asistencia.grupo?.nombre || 'Sin Grupo';
        const groupId = entry.asistencia.grupo_id;
        const key = `${groupId}_${entry.asistencia.periodo_id}`;

        if (!groupsMap.has(key)) {
          groupsMap.set(key, {
            grupo: groupName,
            periodo: entry.asistencia.periodo?.nombre || 'Sin Periodo',
            total: 0,
            presente: 0,
            ausente: 0,
            justificado: 0,
          });
        }

        const stats = groupsMap.get(key);
        stats.total++;
        if (entry.estado === EstadoAsistencia.PRESENTE) stats.presente++;
        else if (entry.estado === EstadoAsistencia.AUSENTE) stats.ausente++;
        else if (entry.estado === EstadoAsistencia.JUSTIFICADO) stats.justificado++;
      });

      const summary = Array.from(groupsMap.values()).map((s) => ({
        ...s,
        porcentajeAsistencia: s.total > 0 ? Math.round((s.presente / s.total) * 100) : 0,
      }));

      return buildSuccessResponse(summary, `/asistencias/summary/${personaId}`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/asistencias/summary/${personaId}`);
    }
  }
}
