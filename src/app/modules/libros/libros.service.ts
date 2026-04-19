import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Libro } from './entities/libro.entity';
import { Tema } from './entities/tema.entity';
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
export class LibrosService {
  constructor(
    @InjectRepository(Libro)
    private libroRepo: Repository<Libro>,
    @InjectRepository(Tema)
    private temaRepo: Repository<Tema>,
  ) {}

  async create(dto: any): Promise<ApiResponse<Libro> | ApiErrorResponse> {
    try {
      const data: any = this.libroRepo.create(dto);
      if (dto.movimiento_id) data.movimiento_id = dto.movimiento_id;
      const saved = await this.libroRepo.save(data);
      return buildSuccessResponse(saved as any, '/libros');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/libros');
    }
  }

  async findAll(page = 1, per_page = 10, filters: any = {}): Promise<ApiListResponse<Libro> | ApiErrorResponse> {
    try {
      const where: any = {};
      if (filters.nombre) where.nombre = ILike(`%${filters.nombre}%`);
      if (filters.movimiento_id) where.movimiento_id = filters.movimiento_id;
      
      const [data, total] = await this.libroRepo.findAndCount({
        where,
        order: { nombre: 'ASC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: ['tipoPersona'],
      });
      return buildListResponse(data, total, page, per_page, filters, '/libros');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/libros');
    }
  }

  async findOne(id: number): Promise<ApiResponse<Libro> | ApiErrorResponse> {
    try {
      const data = await this.libroRepo.findOne({
        where: { id },
        relations: ['tipoPersona', 'temas'],
      });
      if (!data) return buildErrorResponse('NOT_FOUND', 'Libro no encontrado', `/libros/${id}`);
      return buildSuccessResponse(data, `/libros/${id}`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/libros/${id}`);
    }
  }

  async update(id: number, dto: any): Promise<ApiResponse<Libro> | ApiErrorResponse> {
    try {
      const existing = await this.libroRepo.findOne({ where: { id } });
      if (!existing) return buildErrorResponse('NOT_FOUND', 'Libro no encontrado', `/libros/${id}`);
      Object.assign(existing, dto);
      const updated = await this.libroRepo.save(existing);
      return buildSuccessResponse(updated as any, `/libros/${id}`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/libros/${id}`);
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.libroRepo.findOne({ where: { id } });
      if (!existing) return buildErrorResponse('NOT_FOUND', 'Libro no encontrado', `/libros/${id}`);
      await this.libroRepo.remove(existing);
      return buildSuccessResponse(null, `/libros/${id}`, 'Libro eliminado');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/libros/${id}`);
    }
  }

  // Temas logic
  async findAllTemas(filters: any = {}): Promise<ApiListResponse<Tema> | ApiErrorResponse> {
    try {
      const where: any = {};
      if (filters.libro_id) where.libro_id = filters.libro_id;
      const data = await this.temaRepo.find({ where, order: { numero_tema: 'ASC' } });
      return buildListResponse(data, data.length, 1, data.length, filters, '/temas');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/temas');
    }
  }

  async createTema(dto: any): Promise<ApiResponse<Tema> | ApiErrorResponse> {
    try {
      const data = this.temaRepo.create(dto);
      const saved = await this.temaRepo.save(data);
      return buildSuccessResponse(saved as any, '/temas');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/temas');
    }
  }

  async updateTema(id: number, dto: any): Promise<ApiResponse<Tema> | ApiErrorResponse> {
    try {
      const existing = await this.temaRepo.findOne({ where: { id } });
      if (!existing) return buildErrorResponse('NOT_FOUND', 'Tema no encontrado', `/temas/${id}`);
      Object.assign(existing, dto);
      const updated = await this.temaRepo.save(existing);
      return buildSuccessResponse(updated as any, `/temas/${id}`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/temas/${id}`);
    }
  }

  async removeTema(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const existing = await this.temaRepo.findOne({ where: { id } });
      if (!existing) return buildErrorResponse('NOT_FOUND', 'Tema no encontrado', `/temas/${id}`);
      await this.temaRepo.remove(existing);
      return buildSuccessResponse(null, `/temas/${id}`, 'Tema eliminado');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/temas/${id}`);
    }
  }
}
