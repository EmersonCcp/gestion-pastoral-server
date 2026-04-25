import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { DesarrolloClase } from './entities/desarrollo-clase.entity';
import { Tema } from '../libros/entities/tema.entity';
import { Grupo } from '../grupos/entities/grupo.entity';
import { AsistenciasService } from '../asistencias/asistencias.service';
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
export class DesarrolloClaseService {
  constructor(
    @InjectRepository(DesarrolloClase)
    private repo: Repository<DesarrolloClase>,
    @InjectRepository(Grupo)
    private grupoRepo: Repository<Grupo>,
    @InjectRepository(Tema)
    private temaRepo: Repository<Tema>,
    private asistenciasService: AsistenciasService,
    private dataSource: DataSource,
  ) {}

  async create(dto: any): Promise<ApiResponse<DesarrolloClase> | ApiErrorResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get Group to find Movimiento ID
      const grupo = await this.grupoRepo.findOne({ where: { id: dto.grupo_id } });
      if (!grupo) throw new Error('Grupo no encontrado');

      // 2. Create Asistencia first
      const asistenciaDto = {
        ...dto.asistencia,
        movimiento_id: grupo.movimiento_id,
      };
      
      const asistenciaRes = await this.asistenciasService.create(asistenciaDto);
      if (!asistenciaRes.ok) throw new Error('Error al crear asistencia');
      const asistencia = (asistenciaRes as ApiResponse<any>).data;

      // 3. Create DesarrolloClase
      const temasIds = Array.isArray(dto.temas_ids) ? dto.temas_ids : [];
      const temas = temasIds.length > 0 ? await this.temaRepo.findByIds(temasIds) : [];
      
      const session = this.repo.create({
        fecha: dto.fecha,
        observaciones: dto.observaciones,
        grupo_id: dto.grupo_id,
        libro_id: (dto.libro_id === 'null' || dto.libro_id === null) ? null : Number(dto.libro_id),
        asistencia_id: asistencia.id,
        temas: temas
      });

      const saved = await queryRunner.manager.save(session);
      await queryRunner.commitTransaction();

      return buildSuccessResponse(saved as DesarrolloClase, '/desarrollo-clases');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/desarrollo-clases');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page = 1, per_page = 10, filters: any = {}): Promise<ApiListResponse<DesarrolloClase> | ApiErrorResponse> {
    try {
      const where: any = {};
      if (filters.grupo_id) where.grupo_id = filters.grupo_id;
      if (filters.movimiento_id) where.grupo = { movimiento_id: filters.movimiento_id };
      
      const [data, total] = await this.repo.findAndCount({
        where,
        order: { fecha: 'DESC', createdAt: 'DESC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: ['grupo', 'libro', 'temas', 'asistencia', 'asistencia.personas'],
      });

      const dataWithSummary = data.map(item => {
        if (item.asistencia) {
          (item.asistencia as any).total_presente = item.asistencia.personas?.filter(p => p.estado === EstadoAsistencia.PRESENTE).length || 0;
          (item.asistencia as any).total_ausente = item.asistencia.personas?.filter(p => p.estado === EstadoAsistencia.AUSENTE).length || 0;
          (item.asistencia as any).total_justificado = item.asistencia.personas?.filter(p => p.estado === EstadoAsistencia.JUSTIFICADO).length || 0;
        }
        return item;
      });

      return buildListResponse(dataWithSummary, total, page, per_page, filters, '/desarrollo-clases');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/desarrollo-clases');
    }
  }

  async findOne(id: number): Promise<ApiResponse<DesarrolloClase> | ApiErrorResponse> {
    try {
      const data = await this.repo.findOne({
        where: { id },
        relations: ['grupo', 'libro', 'temas', 'asistencia', 'asistencia.personas', 'asistencia.personas.persona'],
      });
      if (!data) return buildErrorResponse('NOT_FOUND', 'Registro no encontrado', `/desarrollo-clases/${id}`);
      return buildSuccessResponse(data, `/desarrollo-clases/${id}`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/desarrollo-clases/${id}`);
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.repo.findOne({ where: { id } });
      if (!existing) return buildErrorResponse('NOT_FOUND', 'Registro no encontrado', `/desarrollo-clases/${id}`);
      
      const asistenciaId = existing.asistencia_id;
      
      // We delete the class first. Since it has a FK to Asistencia (nullable),
      // this should be fine.
      await this.repo.remove(existing);
      
      // Cleanup associated attendance
      if (asistenciaId) {
        await this.asistenciasService.remove(asistenciaId);
      }
      
      return buildSuccessResponse(null, `/desarrollo-clases/${id}`, 'Registro eliminado');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/desarrollo-clases/${id}`);
    }
  }

  async update(id: number, dto: any): Promise<ApiResponse<DesarrolloClase> | ApiErrorResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existing = await this.repo.findOne({ 
        where: { id },
        relations: ['asistencia']
      });
      if (!existing) throw new Error('Registro no encontrado');

      // 1. Update Asistencia if provided
      if (dto.asistencia && existing.asistencia_id) {
        const asistenciaRes = await this.asistenciasService.update(existing.asistencia_id, dto.asistencia);
        if (!asistenciaRes.ok) throw new Error('Error al actualizar asistencia');
      }

      // 2. Update Basic Fields
      if (dto.fecha) existing.fecha = dto.fecha;
      if (dto.observaciones !== undefined) existing.observaciones = dto.observaciones;
      
      // Update Libro ID (handle potential 'null' string or null value)
      if (dto.libro_id !== undefined) {
        existing.libro_id = (dto.libro_id === 'null' || dto.libro_id === null) ? null : Number(dto.libro_id);
      }
      
      // 3. Update Temas if provided
      if (dto.temas_ids) {
        existing.temas = await this.temaRepo.findByIds(dto.temas_ids);
      }

      const saved = await queryRunner.manager.save(existing);
      await queryRunner.commitTransaction();

      return buildSuccessResponse(saved as any, `/desarrollo-clases/${id}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/desarrollo-clases/${id}`);
    } finally {
      await queryRunner.release();
    }
  }
}
