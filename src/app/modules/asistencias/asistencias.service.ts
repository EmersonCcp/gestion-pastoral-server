import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Between, DataSource } from 'typeorm';
import { Asignacion } from '../asignaciones/entities/asignacion.entity';
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
    private dataSource: DataSource,
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

      if (user && !user.isSuperAdmin) {
        where.grupo_id = In(user.grupoIds);
      }

      if (filters.grupo_id) where.grupo_id = filters.grupo_id;
      if (filters.periodo_id) where.periodo_id = filters.periodo_id;

      if (filters.movimiento_id) {
        where.movimiento_id = filters.movimiento_id;
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
        relations: ['grupo', 'periodo', 'personas', 'personas.persona', 'personas.persona.tiposPersonas'],
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

  async getPersonaHistory(
    personaId: number,
    page = 1,
    per_page = 10,
  ): Promise<ApiListResponse<AsistenciaPersona> | ApiErrorResponse> {
    try {
      const [data, total] = await this.personaAsistenciaRepo.findAndCount({
        where: { persona_id: personaId },
        relations: ['asistencia', 'asistencia.grupo', 'asistencia.periodo'],
        order: { asistencia: { fecha: 'DESC' } },
        skip: (page - 1) * per_page,
        take: per_page,
      });

      return buildListResponse(
        data,
        total,
        page,
        per_page,
        {},
        `/asistencias/historial-persona/${personaId}`,
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/asistencias/historial-persona/${personaId}`,
      );
    }
  }

  async getReportDetails(ids: number[]): Promise<ApiResponse<Asistencia[]> | ApiErrorResponse> {
    try {
      const data = await this.repo.find({
        where: { id: In(ids) },
        relations: ['grupo', 'periodo', 'personas', 'personas.persona'],
        order: { fecha: 'ASC' }
      });

      return buildSuccessResponse(data, '/asistencias/reporte');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/asistencias/reporte');
    }
  }

  async getReportePlanilla(query: {
    periodo_id: number;
    grupo_id: number;
    fecha_inicio: string;
    fecha_fin: string;
  }): Promise<ApiResponse<any> | ApiErrorResponse> {
    try {
      const { periodo_id, grupo_id, fecha_inicio, fecha_fin } = query;

      // 1. Obtener la asignación con todas sus relaciones
      const asignacion = await this.dataSource.getRepository(Asignacion).findOne({
        where: { periodo_id, grupo_id },
        relations: [
          'grupo',
          'periodo',
          'aula',
          'personas',
          'personas.tiposPersonas',
          'movimiento',
          'movimiento.parroquia',
        ],
      });

      if (!asignacion) {
        return buildErrorResponse(
          'NOT_FOUND',
          'No se encontró una asignación de grupo y período que sirva de plantilla.',
          '/asistencias/reporte-planilla',
        );
      }

      // 2. Clasificar personas: catequistas vs alumnos
      const personasAsignadas = asignacion.personas || [];
      const catequistas = personasAsignadas.filter(p =>
        p.tiposPersonas?.some(t => t.nombre.toUpperCase() === 'CATEQUISTA' || t.nombre.toUpperCase() === 'COORDINADOR')
      );
      const alumnos = [...personasAsignadas].sort((a, b) =>
        `${a.apellido || ''} ${a.nombre || ''}`.localeCompare(`${b.apellido || ''} ${b.nombre || ''}`)
      );

      const catequistasNombres = catequistas.map(c => `${c.nombre} ${c.apellido}`).join(' y ') || 'Sin catequistas';

      // 3. Buscar asistencias ya registradas en la DB en este rango
      const asistenciasExistentes = await this.repo.find({
        where: {
          periodo_id,
          grupo_id,
          fecha: Between(fecha_inicio, fecha_fin),
        },
        relations: ['personas'],
      });

      // 4. Calcular los días regulares de encuentro (ej. sábados) en el rango de fechas
      const fechasPlanilla = new Set<string>();
      const DAYS_MAP: Record<string, number> = {
        DOMINGO: 0,
        LUNES: 1,
        MARTES: 2,
        MIERCOLES: 3,
        JUEVES: 4,
        VIERNES: 5,
        SABADO: 6
      };
      
      const targetDay = asignacion.dia_reunion ? DAYS_MAP[asignacion.dia_reunion.toUpperCase()] ?? 6 : 6; // Por defecto sábado (6)

      const start = new Date(fecha_inicio + 'T00:00:00');
      const end = new Date(fecha_fin + 'T00:00:00');
      const current = new Date(start);

      while (current <= end) {
        if (current.getDay() === targetDay) {
          const yyyy = current.getFullYear();
          const mm = String(current.getMonth() + 1).padStart(2, '0');
          const dd = String(current.getDate()).padStart(2, '0');
          fechasPlanilla.add(`${yyyy}-${mm}-${dd}`);
        }
        current.setDate(current.getDate() + 1);
      }

      // También agregar las fechas que ya posean asistencias en la base de datos (por si hubo reuniones extraoficiales)
      for (const ast of asistenciasExistentes) {
        fechasPlanilla.add(ast.fecha.toString());
      }

      // Ordenar las fechas cronológicamente
      const fechasOrdenadas = Array.from(fechasPlanilla).sort();

      // 5. Mapear las asistencias para acceso rápido O(1)
      const asistenciaMap: Record<string, Record<number, string>> = {};
      for (const ast of asistenciasExistentes) {
        const fStr = ast.fecha.toString();
        asistenciaMap[fStr] = {};
        if (ast.personas) {
          for (const ap of ast.personas) {
            asistenciaMap[fStr][ap.persona_id] = ap.estado;
          }
        }
      }

      // 6. Formatear la lista final de alumnos con su grilla de asistencias
      const alumnosConAsistencia = alumnos.map(a => {
        const regAsistencias: Record<string, string> = {};
        for (const f of fechasOrdenadas) {
          regAsistencias[f] = asistenciaMap[f]?.[a.id] || ''; // Vacío si no se tomó asistencia
        }
        return {
          id: a.id,
          nombre: a.nombre,
          apellido: a.apellido,
          nro_documento: a.documento,
          asistencias: regAsistencias,
        };
      });

      // 7. Retornar los metadatos y la grilla final estructurada
      const data = {
        parroquia: asignacion.movimiento?.parroquia?.nombre || 'Parroquia Central',
        movimiento: asignacion.movimiento?.nombre || '',
        grupo: asignacion.grupo?.nombre || '',
        salon: asignacion.aula?.nombre || 'Sin salón',
        anio: (() => {
          const name = asignacion.periodo?.nombre || '';
          const year = asignacion.periodo?.fecha_inicio
            ? (asignacion.periodo.fecha_inicio instanceof Date
                ? asignacion.periodo.fecha_inicio.getFullYear().toString()
                : String(asignacion.periodo.fecha_inicio).split('-')[0])
            : '';
          return year ? `${name}-${year}` : name;
        })(),
        catequistas: catequistasNombres,
        fechas: fechasOrdenadas,
        alumnos: alumnosConAsistencia,
      };

      return buildSuccessResponse(data, '/asistencias/reporte-planilla');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al obtener la planilla de asistencia',
        '/asistencias/reporte-planilla',
      );
    }
  }
}
