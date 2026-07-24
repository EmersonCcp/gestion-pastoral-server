import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Persona } from './entities/persona.entity';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { CrearPersonasLoteDto } from './dto/crear-personas-lote.dto';
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
import csv from 'csv-parser';
import { Readable } from 'stream';
import { TipoPersona } from './entities/tipo-persona.entity';
import { PersonasScannerService } from './personas-scanner.service';

const removeAccents = (str: string): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N');
};

@Injectable()
export class PersonasService {
  constructor(
    @InjectRepository(Persona)
    private repo: Repository<Persona>,
    @InjectRepository(PersonaRelacion)
    private relacionRepo: Repository<PersonaRelacion>,
    @InjectRepository(TipoPersona)
    private tipoRepo: Repository<TipoPersona>,
    private scannerService: PersonasScannerService,
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

      if (user && !user.isSuperAdmin) {
        // Si no tiene grupos asignados, forzar a que no devuelva nada
        if (!user.grupoIds || user.grupoIds.length === 0) {
          queryBuilder.andWhere('1 = 0');
        } else {
          queryBuilder.andWhere((qb) => {
            const subQuery = qb.subQuery()
              .select('ap.persona_id')
              .from('asignacion_personas', 'ap')
              .innerJoin('asignaciones', 'a', 'a.id = ap.asignacion_id')
              .where('a.grupo_id IN (:...grupoIds)')
              .getQuery();
            return 'persona.id IN ' + subQuery;
          }, { grupoIds: user.grupoIds });
        }
      }

      if (filters.movimiento_id) {
        queryBuilder.andWhere('persona.movimiento_id = :movId', { movId: filters.movimiento_id });
      }

      if (filters.nombre) {
        const cleanNombre = removeAccents(filters.nombre);
        queryBuilder.andWhere(
          `(TRANSLATE(persona.nombre, 'áéíóúÁÉÍÓÚüÜñÑ', 'aeiouAEIOUuUnN') ILIKE :nombreClean 
            OR TRANSLATE(persona.apellido, 'áéíóúÁÉÍÓÚüÜñÑ', 'aeiouAEIOUuUnN') ILIKE :nombreClean 
            OR persona.documento ILIKE :nombreRaw 
            OR persona.email ILIKE :nombreRaw 
            OR persona.telefono ILIKE :nombreRaw)`,
          { 
            nombreClean: `%${cleanNombre}%`,
            nombreRaw: `%${filters.nombre}%`
          }
        );
      }

      if (filters.documento) {
        queryBuilder.andWhere('persona.documento ILIKE :doc', { doc: `%${filters.documento}%` });
      }

      if (filters.tipo_persona_id) {
        queryBuilder.andWhere((qb) => {
          const subQuery = qb.subQuery()
            .select('pta.persona_id')
            .from('personas_tipos_asignados', 'pta')
            .where('pta.tipo_persona_id = :tipoId')
            .getQuery();
          return 'persona.id IN ' + subQuery;
        }, { tipoId: filters.tipo_persona_id });
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

  async escanearLista(
    fileBuffer: Buffer,
    mimeType: string,
    movimiento_id?: number,
  ): Promise<ApiResponse<any> | ApiErrorResponse> {
    try {
      const scanResult = await this.scannerService.scanLista(fileBuffer, mimeType);
      const nombres = scanResult?.nombres_detectados || [];

      const resultados = await Promise.all(
        nombres.map(async (n: { nombre_completo: string; nombre: string; apellido: string }) => {
          const match = await this.buscarPersonaPorNombreDetectado(
            n.nombre || '',
            n.apellido || '',
            n.nombre_completo || '',
            movimiento_id,
          );

          return {
            nombre_detectado: n.nombre_completo,
            nombre: n.nombre,
            apellido: n.apellido,
            existe: !!match.persona,
            persona: match.persona
              ? {
                  id: match.persona.id,
                  nombre: match.persona.nombre,
                  apellido: match.persona.apellido,
                  documento: match.persona.documento,
                  tiposPersonas: match.persona.tiposPersonas,
                }
              : null,
            coincidencia: match.coincidencia,
          };
        }),
      );

      return buildSuccessResponse(resultados, '/personas/escanear-lista');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al escanear lista de personas',
        '/personas/escanear-lista',
      );
    }
  }

  private async buscarPersonaPorNombreDetectado(
    nombre: string,
    apellido: string,
    nombreCompleto: string,
    movimiento_id?: number,
  ): Promise<{ persona: Persona | null; coincidencia: 'EXACTA' | 'PARCIAL' | 'SIN_COINCIDENCIA' }> {
    const normalize = (s: string) => removeAccents(s || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const detectedFull = normalize(nombreCompleto || `${nombre} ${apellido}`);
    const detectedNombre = normalize(nombre);
    const detectedApellido = normalize(apellido);

    // Search by first token of name (more permissive), then score candidates in memory
    const searchTerm = detectedNombre.split(' ')[0] || detectedFull.split(' ')[0];
    if (!searchTerm || searchTerm.length < 2) {
      return { persona: null, coincidencia: 'SIN_COINCIDENCIA' };
    }

    const qb = this.repo
      .createQueryBuilder('persona')
      .leftJoinAndSelect('persona.tiposPersonas', 'tipo')
      .where(
        `(TRANSLATE(persona.nombre, 'áéíóúÁÉÍÓÚüÜñÑ', 'aeiouAEIOUuUnN') ILIKE :term
          OR TRANSLATE(persona.apellido, 'áéíóúÁÉÍÓÚüÜñÑ', 'aeiouAEIOUuUnN') ILIKE :term
          OR TRANSLATE(CONCAT(persona.nombre, ' ', persona.apellido), 'áéíóúÁÉÍÓÚüÜñÑ', 'aeiouAEIOUuUnN') ILIKE :full)`,
        { term: `%${searchTerm}%`, full: `%${detectedFull}%` },
      )
      .take(20);

    if (movimiento_id) {
      qb.andWhere('persona.movimiento_id = :movId', { movId: movimiento_id });
    }

    const candidates = await qb.getMany();
    if (!candidates.length) {
      return { persona: null, coincidencia: 'SIN_COINCIDENCIA' };
    }

    // Exact: nombre + apellido match (accent-insensitive)
    const exact = candidates.find((p) => {
      const pNombre = normalize(p.nombre);
      const pApellido = normalize(p.apellido);
      const pFull = `${pNombre} ${pApellido}`.trim();
      return (
        pFull === detectedFull ||
        (pNombre === detectedNombre &&
          (!detectedApellido || pApellido === detectedApellido || pApellido.includes(detectedApellido) || detectedApellido.includes(pApellido)))
      );
    });

    if (exact) {
      return { persona: exact, coincidencia: 'EXACTA' };
    }

    // Partial: full name contains detected or vice versa
    const partial = candidates.find((p) => {
      const pFull = normalize(`${p.nombre} ${p.apellido}`);
      return pFull.includes(detectedFull) || detectedFull.includes(pFull);
    });

    if (partial) {
      return { persona: partial, coincidencia: 'PARCIAL' };
    }

    // Fallback: same first name + shared last-name token
    const byTokens = candidates.find((p) => {
      const pNombre = normalize(p.nombre);
      const pApellido = normalize(p.apellido);
      if (pNombre !== detectedNombre && !pNombre.includes(detectedNombre) && !detectedNombre.includes(pNombre)) {
        return false;
      }
      if (!detectedApellido) return true;
      const detTokens = detectedApellido.split(' ').filter(Boolean);
      const pTokens = pApellido.split(' ').filter(Boolean);
      return detTokens.some((t) => pTokens.includes(t));
    });

    if (byTokens) {
      return { persona: byTokens, coincidencia: 'PARCIAL' };
    }

    return { persona: null, coincidencia: 'SIN_COINCIDENCIA' };
  }

  async bulkUpload(file: Express.Multer.File): Promise<ApiResponse<any> | ApiErrorResponse> {
    const results: any[] = [];
    const stream = Readable.from(file.buffer);

    return new Promise((resolve) => {
      stream
        .pipe(csv({
          separator: ';',
          mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ''),
          mapValues: ({ value }) => value?.trim()
        }))
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            const result = await this.processCSV(results);
            resolve(buildSuccessResponse(result, '/personas/bulk', 'Importación completada'));
          } catch (error) {
            resolve(buildErrorResponse('INTERNAL_ERROR', error.message, '/personas/bulk'));
          }
        });
    });
  }

  private async processCSV(rows: any[]): Promise<{ imported: number; failed: number; errors: any[] }> {
    let imported = 0;
    let failed = 0;
    const errors: any[] = [];

    // Obtener tipos básicos
    const tipoCatequizando = await this.tipoRepo.findOneBy({ nombre: 'Catequizando' });
    const tipoPariente = await this.tipoRepo.findOneBy({ nombre: 'Pariente' });

    for (const row of rows) {
      try {
        // 1. Crear Catequizando
        const catequizando = await this.repo.save(this.repo.create({
          nombre: row.nombre,
          apellido: row.apellido,
          fecha_nacimiento: this.parseDate(row.fecha_nacimiento),
          direccion: row.direccion,
          movimiento_id: 1, // Fijo por requerimiento
          bautismo: row.bautismo?.toUpperCase() === 'SI',
          primera_comunion: row.primera_comunion?.toUpperCase() === 'SI',
          tiposPersonas: tipoCatequizando ? [tipoCatequizando] : [],
        }));

        // 2. Procesar Parientes
        for (let i = 1; i <= 3; i++) {
          const pNombre = row[`pariente${i}_nombre`]?.trim();
          const pParentesco = row[`pariente${i}_parentesco`]?.trim();
          const pTelefono = row[`pariente${i}_telefono`]?.trim();

          if (pNombre) {
            // Separar nombre y apellido si es posible (asumimos que el primer espacio divide)
            const [nombre, ...apellidos] = pNombre.split(' ');
            const apellido = apellidos.join(' ') || 'S/A';

            const pariente = await this.repo.save(this.repo.create({
              nombre,
              apellido,
              telefono: pTelefono,
              movimiento_id: 1,
              tiposPersonas: tipoPariente ? [tipoPariente] : [],
            }));

            await this.relacionRepo.save(this.relacionRepo.create({
              persona_id: catequizando.id,
              pariente_id: pariente.id,
              parentesco: this.mapParentesco(pParentesco),
            }));
          }
        }
        imported++;
      } catch (err) {
        failed++;
        errors.push({
          fila: rows.indexOf(row) + 2,
          nombre: row.nombre || 'Desconocido',
          error: err.message
        });
        console.error('Error procesando fila:', row, err);
      }
    }
    return { imported, failed, errors };
  }

  private parseDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // DD/MM/YYYY
      return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    }
    return undefined;
  }

  private mapParentesco(str: string): any {
    const s = str?.toLowerCase();
    if (s?.includes('papa') || s?.includes('padre')) return 'PADRE';
    if (s?.includes('mama') || s?.includes('madre')) return 'MADRE';
    if (s?.includes('tutor')) return 'TUTOR';
    if (s?.includes('hermano')) return 'HERMANO';
    return 'OTRO';
  }

  async crearLote(dto: CrearPersonasLoteDto): Promise<ApiResponse<Persona[]> | ApiErrorResponse> {
    try {
      const { movimiento_id, personas } = dto;

      // Buscar tipo de persona 'Catequizando' para este movimiento
      let tipoPersona = await this.tipoRepo.findOne({
        where: { nombre: 'Catequizando', movimiento_id },
      });

      // Si no existe, buscamos cualquier tipo de persona para el movimiento como fallback
      if (!tipoPersona) {
        tipoPersona = await this.tipoRepo.findOne({
          where: { movimiento_id },
        });
      }

      if (!tipoPersona) {
        return buildErrorResponse(
          'NOT_FOUND',
          'No se encontró ningún tipo de persona configurado para este movimiento.',
          '/personas/crear-lote',
        );
      }

      const creadas: Persona[] = [];

      await this.repo.manager.transaction(async (manager) => {
        const personaRepo = manager.getRepository(Persona);

        for (const item of personas) {
          const persona = personaRepo.create({
            nombre: item.nombre,
            apellido: item.apellido,
            movimiento_id,
            tiposPersonas: [tipoPersona],
          });
          const guardada = await personaRepo.save(persona);
          creadas.push(guardada);
        }
      });

      return buildSuccessResponse(creadas, '/personas/crear-lote');
    } catch (error) {
      return buildErrorResponse(
        'INTERNAL_ERROR',
        error.message || 'Error al crear personas en lote',
        '/personas/crear-lote',
      );
    }
  }
}
