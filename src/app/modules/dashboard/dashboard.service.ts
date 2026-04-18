import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { Persona } from '../personas/entities/persona.entity';
import { TipoPersona } from '../personas/entities/tipo-persona.entity';
import { Asignacion } from '../asignaciones/entities/asignacion.entity';
import { buildSuccessResponse, buildErrorResponse } from 'src/shared/http/api-response.util';

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

      // 2. Count for each type
      for (const t of tipos) {
        const wherePersona: any = { tipo_persona_id: t.id };
        if (movimientoId) {
          wherePersona.movimiento_id = movimientoId;
        }

        const total = await this.personaRepo.count({ where: wherePersona });
        const masculino = await this.personaRepo.count({ 
          where: { ...wherePersona, genero: Raw((alias) => `${alias} ILIKE 'MASCULINO'`) } 
        });
        const femenino = await this.personaRepo.count({ 
          where: { ...wherePersona, genero: Raw((alias) => `${alias} ILIKE 'FEMENINO'`) } 
        });

        results.push({
          id: t.id,
          label: t.nombre,
          total,
          masculino,
          femenino,
          // Icon mapping (optional helper)
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

  async getBirthdays(month: number, user?: any, selectedMovimientoId?: number | string) {
    try {
      const isSuperAdmin = user?.isSuperAdmin;
      const movimientoId = selectedMovimientoId || user?.movimiento_id;

      const where: any = {
        fecha_nacimiento: Raw((alias) => `EXTRACT(MONTH FROM ${alias}) = :month`, { month }),
      };

      if (movimientoId) {
        where.movimiento_id = movimientoId;
      }

      const personas = await this.personaRepo.find({
        where,
        order: {
          fecha_nacimiento: 'ASC',
        },
      });

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
          dia_cumple: birthDate.getUTCDate(), // Use UTC to avoid timezone issues on specific days
          mes_cumple: birthDate.getUTCMonth() + 1,
          edad_cumple: ageTurning,
          grupos: groupNames || 'Sin Grupo',
        });
      }

      return buildSuccessResponse(results, '/dashboard/birthdays');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/dashboard/birthdays');
    }
  }
}
