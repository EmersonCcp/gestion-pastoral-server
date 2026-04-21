import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { Persona } from '../personas/entities/persona.entity';
import { TipoPersona } from '../personas/entities/tipo-persona.entity';
import { Asignacion } from '../asignaciones/entities/asignacion.entity';
import { buildSuccessResponse, buildErrorResponse, buildListResponse } from 'src/shared/http/api-response.util';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Persona)
    private readonly personaRepo: Repository<Persona>,
    @InjectRepository(TipoPersona)
    private readonly tipoPersonaRepo: Repository<TipoPersona>,
    @InjectRepository(Asignacion)
    private readonly asignacionRepo: Repository<Asignacion>,
  ) {}

  async getStats(user?: any, selectedMovimientoId?: number) {
    try {
      const isSuperAdmin = user?.isSuperAdmin;
      const movimientoId = selectedMovimientoId || user?.movimiento_id;

      // 1. Get all TipoPersona for the movement (or all if SuperAdmin)
      const whereTipo: any = {};
      if (movimientoId) {
        whereTipo.movimiento_id = movimientoId;
      }

      const tipos = await this.tipoPersonaRepo.find({
        where: whereTipo,
        order: { nombre: 'ASC' }
      });

      const results: any[] = [];

      // 2. Count for each type using QueryBuilder for ManyToMany relationship
      for (const t of tipos) {
        const query = this.personaRepo.createQueryBuilder('persona')
          .innerJoin('persona.tiposPersonas', 'tipo', 'tipo.id = :tipoId', { tipoId: t.id });

        if (movimientoId) {
          query.andWhere('persona.movimiento_id = :movId', { movId: movimientoId });
        }

        const total = await query.getCount();
        
        const masculino = await query.clone()
          .andWhere('persona.genero ILIKE :masc', { masc: 'MASCULINO' })
          .getCount();

        const femenino = await query.clone()
          .andWhere('persona.genero ILIKE :fem', { fem: 'FEMENINO' })
          .getCount();

        results.push({
          id: t.id,
          label: t.nombre,
          total,
          masculino,
          femenino,
          icon: this.getIconForType(t.nombre)
        });
      }

      return buildSuccessResponse(results, '/dashboard/stats');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/dashboard/stats');
    }
  }

  private getIconForType(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('alumno') || n.includes('estudiante') || n.includes('estudiante')) return 'school';
    if (n.includes('catequista') || n.includes('promotor')) return 'diversity_3';
    if (n.includes('padre') || n.includes('encargado')) return 'family_history';
    if (n.includes('coordinador')) return 'settings_accessibility';
    return 'person'; // Default
  }

  async getBirthdays(month: number, page = 1, per_page = 8, user?: any, selectedMovimientoId?: number | string) {
    try {
      const movimientoId = selectedMovimientoId || user?.movimiento_id;

      const queryBuilder = this.personaRepo.createQueryBuilder('persona')
        .addSelect('EXTRACT(DAY FROM persona.fecha_nacimiento)', 'dia_orden')
        .where('EXTRACT(MONTH FROM persona.fecha_nacimiento) = :month', { month });

      if (movimientoId) {
        queryBuilder.andWhere('persona.movimiento_id = :movId', { movId: movimientoId });
      }

      queryBuilder
        .orderBy('dia_orden', 'ASC')
        .addOrderBy('persona.nombre', 'ASC')
        .skip((page - 1) * per_page)
        .take(per_page);

      const [personas, total] = await queryBuilder.getManyAndCount();

      const results: any[] = [];

      for (const p of personas) {
        const currentYear = new Date().getFullYear();
        const birthDate = new Date(p.fecha_nacimiento);
        const ageTurning = currentYear - birthDate.getFullYear();

        const assignedGroups = await this.asignacionRepo
          .createQueryBuilder('asignacion')
          .leftJoin('asignacion.personas', 'persona')
          .leftJoinAndSelect('asignacion.grupo', 'grupo')
          .where('persona.id = :personaId', { personaId: p.id })
          .getMany();

        const groupNames = assignedGroups.map((a) => a.grupo?.nombre).filter(Boolean).join(', ');

        results.push({
          id: p.id,
          nombre: p.nombre,
          apellido: p.apellido,
          dia_cumple: birthDate.getUTCDate(), 
          mes_cumple: birthDate.getUTCMonth() + 1,
          edad_cumple: ageTurning,
          grupos: groupNames || 'Sin Grupo',
        });
      }

      return buildListResponse(
        results,
        total,
        page,
        per_page,
        { month, movimientoId },
        '/dashboard/birthdays'
      );
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/dashboard/birthdays');
    }
  }
}
