import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, In, IsNull, DataSource } from 'typeorm';
import { Grupo } from './entities/grupo.entity';
import { Libro } from '../libros/entities/libro.entity';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { Asignacion } from '../asignaciones/entities/asignacion.entity';
import { Asistencia } from '../asistencias/entities/asistencia.entity';
import { DesarrolloClase } from '../desarrollo-clase/entities/desarrollo-clase.entity';
import { Tema } from '../libros/entities/tema.entity';
import { Persona } from '../personas/entities/persona.entity';
import { EstadoAsistencia } from '../asistencias/entities/asistencia-persona.entity';
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
export class GruposService {
  constructor(
    @InjectRepository(Grupo)
    private repo: Repository<Grupo>,
    @InjectRepository(Libro)
    private libroRepo: Repository<Libro>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    dto: CreateGrupoDto,
  ): Promise<ApiResponse<Grupo> | ApiErrorResponse> {
    try {
      const { libro_ids, ...grupoData } = dto;
      const data = this.repo.create(grupoData);
      
      if (libro_ids && libro_ids.length > 0) {
        data.libros = await this.libroRepo.find({ where: { id: In(libro_ids) } });
      }

      const saved = await this.repo.save(data);
      return buildSuccessResponse(saved, '/grupos');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error creando grupo',
        '/grupos',
      );
    }
  }

  async findAll(
    page = 1,
    per_page = 10,
    filters: Record<string, any> = {},
    user?: any,
  ): Promise<ApiListResponse<Grupo> | ApiErrorResponse> {
    try {
      const query: any = {};

      if (user && !user.isSuperAdmin) {
        query.id = In(user.grupoIds);
      }

      if (filters.nombre) {
        query.nombre = ILike(`%${filters.nombre}%`);
      }
      
      if (filters.movimiento_id) {
        query.movimiento_id = filters.movimiento_id;
      }
      
      if (filters.parent_id === 'null' || filters.parent_id === null) {
        query.parent = IsNull();
      } else if (filters.parent_id) {
        query.parent_id = filters.parent_id;
      }

      const [data, total] = await this.repo.findAndCount({
        where: query,
        order: { nombre: 'ASC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: ['movimiento', 'parent', 'libros'],
      });

      return buildListResponse(
        data,
        total,
        page,
        per_page,
        filters,
        '/grupos',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        'Ocurrió un error obteniendo grupos',
        '/grupos',
      );
    }
  }

  async findOne(id: number): Promise<ApiResponse<Grupo> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({
        where: { id },
        relations: ['movimiento', 'parent', 'subgrupos', 'libros'],
      });

      if (!data) {
        return buildErrorResponse(
          'NOT_FOUND',
          `Grupo con ID ${id} no encontrado`,
          `/grupos/${id}`,
        );
      }

      return buildSuccessResponse(data, `/grupos/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/grupos/${id}`,
      );
    }
  }

  async update(
    id: number,
    dto: UpdateGrupoDto,
  ): Promise<ApiResponse<Grupo> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Grupo no encontrado',
          `/grupos/${id}`,
        );
      }

      const { libro_ids, ...grupoData } = dto;
      Object.assign(existing, grupoData);

      if (libro_ids) {
        existing.libros = await this.libroRepo.find({ where: { id: In(libro_ids) } });
      } else if (libro_ids === null) {
        existing.libros = [];
      }

      const updated = await this.repo.save(existing);

      return buildSuccessResponse(updated, `/grupos/${id}`);
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al actualizar grupo',
        `/grupos/${id}`,
      );
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });

      if (!existing) {
        return buildErrorResponse(
          'NOT_FOUND',
          'Grupo no encontrado',
          `/grupos/${id}`,
        );
      }

      await this.repo.remove(existing);

      return buildSuccessResponse(
        null,
        `/grupos/${id}`,
        'Grupo eliminado correctamente',
      );
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message,
        `/grupos/${id}`,
      );
    }
  }

  async getEstadisticas(id: number): Promise<ApiResponse<any> | ApiErrorResponse> {
    try {
      const grupo = await this.repo.findOne({
        where: { id },
        relations: ['movimiento', 'libros'],
      });

      if (!grupo) {
        return buildErrorResponse('NOT_FOUND', `Grupo con ID ${id} no encontrado`, `/grupos/${id}/estadisticas`);
      }

      // 1. Alumnos del grupo (a través de las asignaciones)
      const asignaciones = await this.dataSource.getRepository(Asignacion).find({
        where: { grupo_id: id },
        relations: ['personas', 'personas.tiposPersonas'],
      });

      const personasMap = new Map<number, Persona>();
      for (const asignacion of asignaciones) {
        for (const persona of asignacion.personas) {
          personasMap.set(persona.id, persona);
        }
      }
      const alumnos = Array.from(personasMap.values());

      // 2. Asistencias del grupo
      const asistencias = await this.dataSource.getRepository(Asistencia).find({
        where: { grupo_id: id },
        relations: ['personas'],
        order: { fecha: 'ASC' },
      });

      // 3. Calcular porcentajes de asistencia por clase y el promedio del grupo
      const totalAlumnos = alumnos.length;
      let sumaPorcentajesAsistencia = 0;
      const asistenciasGrafico: any[] = [];

      for (const asistencia of asistencias) {
        const totalPresentes = asistencia.personas.filter(p => p.estado === EstadoAsistencia.PRESENTE).length;
        const totalAusentes = asistencia.personas.filter(p => p.estado === EstadoAsistencia.AUSENTE).length;
        const totalJustificados = asistencia.personas.filter(p => p.estado === EstadoAsistencia.JUSTIFICADO).length;
        const totalRegistrados = totalPresentes + totalAusentes + totalJustificados;

        const pct = totalRegistrados > 0 ? (totalPresentes / totalRegistrados) * 100 : 0;
        sumaPorcentajesAsistencia += pct;

        asistenciasGrafico.push({
          fecha: asistencia.fecha,
          presentes: totalPresentes,
          ausentes: totalAusentes,
          justificados: totalJustificados,
          porcentaje_asistencia: Math.round(pct),
        });
      }

      const asistenciaPromedio = asistencias.length > 0 ? Math.round(sumaPorcentajesAsistencia / asistencias.length) : 0;

      // 4. Calcular métricas individuales de alumnos
      const alumnosTabla: any[] = [];
      let alumnosRiesgoCount = 0;

      for (const alumno of alumnos) {
        let clasesAsistidas = 0;
        let clasesTotalesConRegistro = 0;

        for (const asistencia of asistencias) {
          const registro = asistencia.personas.find(p => p.persona_id === alumno.id);
          if (registro) {
            clasesTotalesConRegistro++;
            if (registro.estado === EstadoAsistencia.PRESENTE) {
              clasesAsistidas++;
            }
          }
        }

        const pctAlumno = clasesTotalesConRegistro > 0 ? Math.round((clasesAsistidas / clasesTotalesConRegistro) * 100) : 100;

        let alerta: 'verde' | 'amarillo' | 'rojo' = 'verde';
        if (pctAlumno < 60) {
          alerta = 'rojo';
          alumnosRiesgoCount++;
        } else if (pctAlumno < 80) {
          alerta = 'amarillo';
        }

        alumnosTabla.push({
          id: alumno.id,
          nombre_completo: `${alumno.nombre} ${alumno.apellido}`,
          asistencia_porcentaje: pctAlumno,
          bautismo: alumno.bautismo,
          primera_comunion: alumno.primera_comunion,
          confirmacion: alumno.confirmacion,
          genero: alumno.genero,
          alerta,
        });
      }

      // 5. Sacramentos y Demografía
      const sacramentosGrafico = {
        bautismo: { si: 0, no: 0 },
        primera_comunion: { si: 0, no: 0 },
        confirmacion: { si: 0, no: 0 },
      };
      const generoGrafico = { masculino: 0, femenino: 0 };

      for (const alumno of alumnos) {
        if (alumno.bautismo) sacramentosGrafico.bautismo.si++;
        else sacramentosGrafico.bautismo.no++;

        if (alumno.primera_comunion) sacramentosGrafico.primera_comunion.si++;
        else sacramentosGrafico.primera_comunion.no++;

        if (alumno.confirmacion) sacramentosGrafico.confirmacion.si++;
        else sacramentosGrafico.confirmacion.no++;

        const gen = alumno.genero?.toUpperCase() || 'MASCULINO';
        if (gen === 'FEMENINO' || gen === 'F') {
          generoGrafico.femenino++;
        } else {
          generoGrafico.masculino++;
        }
      }

      // 6. Avance del Temario (Libros y Temas)
      let temasAvancePorcentaje = 0;
      let temasDictadosCount = 0;
      let totalTemasLibro = 0;

      const libroId = grupo.libros?.length > 0 ? grupo.libros[0].id : null;
      if (libroId) {
        totalTemasLibro = await this.dataSource.getRepository(Tema).count({ where: { libro_id: libroId } });

        const clasesConTemas = await this.dataSource.getRepository(DesarrolloClase).find({
          where: { grupo_id: id },
          relations: ['temas'],
        });

        const temasDictadosSet = new Set<number>();
        for (const clase of clasesConTemas) {
          if (clase.temas) {
            for (const tema of clase.temas) {
              temasDictadosSet.add(tema.id);
            }
          }
        }
        temasDictadosCount = temasDictadosSet.size;
        temasAvancePorcentaje = totalTemasLibro > 0 ? Math.round((temasDictadosCount / totalTemasLibro) * 100) : 0;
      }

      const result = {
        grupo: {
          id: grupo.id,
          nombre: grupo.nombre,
          movimiento: grupo.movimiento?.nombre || 'Sin Movimiento',
        },
        kpis: {
          asistencia_promedio: asistenciaPromedio,
          total_alumnos: totalAlumnos,
          temas_avance_porcentaje: temasAvancePorcentaje,
          alumnos_riesgo_count: alumnosRiesgoCount,
          temas_dictados: temasDictadosCount,
          temas_totales: totalTemasLibro,
        },
        asistencias_grafico: asistenciasGrafico,
        sacramentos_grafico: sacramentosGrafico,
        genero_grafico: generoGrafico,
        alumnos_tabla: alumnosTabla.sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo)),
      };

      return buildSuccessResponse(result, `/grupos/${id}/estadisticas`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message || 'Error calculando estadísticas', `/grupos/${id}/estadisticas`);
    }
  }
}
