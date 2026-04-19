import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Libro } from './entities/libro.entity';
import { LibroMovimiento, TipoMovimientoInventario, MotivoMovimientoInventario } from './entities/libro-movimiento.entity';
import { LibroAsignacion, TipoAsignacionLibro, EstadoAsignacionLibro } from './entities/libro-asignacion.entity';
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
export class LibrosInventarioService {
  constructor(
    @InjectRepository(Libro)
    private libroRepo: Repository<Libro>,
    @InjectRepository(LibroMovimiento)
    private movimientoRepo: Repository<LibroMovimiento>,
    @InjectRepository(LibroAsignacion)
    private asignacionRepo: Repository<LibroAsignacion>,
    private dataSource: DataSource,
  ) {}

  /**
   * Registra un movimiento manual de inventario (Compra, Donación, Pérdida, etc.)
   */
  async registrarMovimiento(dto: any): Promise<ApiResponse<LibroMovimiento> | ApiErrorResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const libro = await this.libroRepo.findOne({ where: { id: dto.libro_id } });
      if (!libro) throw new Error('Libro no encontrado');

      // Actualizar stock
      const cantidad = Number(dto.cantidad);
      if (dto.tipo === TipoMovimientoInventario.INGRESO) {
        libro.stock_actual += cantidad;
      } else {
        if (libro.stock_actual < cantidad) throw new Error('Stock insuficiente para realizar este egreso');
        libro.stock_actual -= cantidad;
      }

      await queryRunner.manager.save(libro);

      // Crear registro de movimiento
      const movimiento = this.movimientoRepo.create({
        ...dto,
        cantidad: cantidad,
        fecha: dto.fecha || new Date().toISOString().split('T')[0],
        movimiento_id: libro.movimiento_id // Seguir el movimiento del libro
      });

      const saved:any = await queryRunner.manager.save(LibroMovimiento, movimiento);
      await queryRunner.commitTransaction();

      return buildSuccessResponse(saved, '/libros/inventario/movimientos');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/libros/inventario/movimientos');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Asigna un libro a una persona (Venta o Préstamo)
   */
  async asignarLibro(dto: any): Promise<ApiResponse<LibroAsignacion> | ApiErrorResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const libro = await this.libroRepo.findOne({ where: { id: dto.libro_id } });
      if (!libro) throw new Error('Libro no encontrado');

      if (libro.stock_actual < 1) throw new Error('No hay stock disponible para asignar este libro');

      // 1. Descontar del stock general
      libro.stock_actual -= 1;
      await queryRunner.manager.save(libro);

      // 2. Crear movimiento de inventario (Egreso por entrega)
      const movimiento = this.movimientoRepo.create({
        libro_id: dto.libro_id,
        tipo: TipoMovimientoInventario.EGRESO,
        motivo: MotivoMovimientoInventario.ENTREGA_PERSONA,
        cantidad: 1,
        fecha: dto.fecha_entrega || new Date().toISOString().split('T')[0],
        persona_id: dto.persona_id,
        movimiento_id: libro.movimiento_id,
        observaciones: `Asignación por ${dto.tipo}`
      });
      await queryRunner.manager.save(LibroMovimiento, movimiento);

      // 3. Crear registro de asignación
      const asignacion = this.asignacionRepo.create({
        ...dto,
        estado: EstadoAsignacionLibro.ENTREGADO,
        movimiento_id: libro.movimiento_id
      });
      const saved:any = await queryRunner.manager.save(LibroAsignacion, asignacion);

      await queryRunner.commitTransaction();
      return buildSuccessResponse(saved, '/libros/inventario/asignaciones');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/libros/inventario/asignaciones');
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Registra la devolución de un libro prestado
   */
  async devolverLibro(asignacionId: number, dto: any): Promise<ApiResponse<LibroAsignacion> | ApiErrorResponse> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const asignacion = await this.asignacionRepo.findOne({ 
        where: { id: asignacionId },
        relations: ['libro']
      });
      if (!asignacion) throw new Error('Asignación no encontrada');
      if (asignacion.estado !== EstadoAsignacionLibro.ENTREGADO) throw new Error('Este libro ya fue devuelto o procesado');

      const libro = asignacion.libro;

      // 1. Actualizar estado de asignación
      asignacion.estado = dto.entrega_perdida ? EstadoAsignacionLibro.PERDIDO : EstadoAsignacionLibro.DEVUELTO;
      asignacion.fecha_devolucion_real = dto.fecha || new Date().toISOString().split('T')[0];
      asignacion.observaciones = dto.observaciones || asignacion.observaciones;
      if (asignacion.movimiento_id) asignacion.movimiento_id = asignacion.movimiento_id; // Mantener movimiento
      await queryRunner.manager.save(asignacion);

      // 2. Si se devuelve (no perdido), devolver al stock
      if (asignacion.estado === EstadoAsignacionLibro.DEVUELTO) {
        libro.stock_actual += 1;
        await queryRunner.manager.save(libro);

        // Registro de movimiento de ingreso
        const movimiento = this.movimientoRepo.create({
          libro_id: libro.id,
          tipo: TipoMovimientoInventario.INGRESO,
          motivo: MotivoMovimientoInventario.DEVOLUCION_PRESTAMO,
          cantidad: 1,
          fecha: asignacion.fecha_devolucion_real,
          persona_id: asignacion.persona_id,
          movimiento_id: asignacion.movimiento_id,
          observaciones: 'Devolución de préstamo'
        });
        await queryRunner.manager.save(LibroMovimiento, movimiento);
      } else {
          // Si es perdido, ya descontamos el stock al asignar, pero registramos la baja definitiva en movimientos
          const movimiento = this.movimientoRepo.create({
            libro_id: libro.id,
            tipo: TipoMovimientoInventario.EGRESO,
            motivo: MotivoMovimientoInventario.BAJA_PERDIDA,
            cantidad: 0, // Ya se descontó al salir, esto es solo historial informativo de por qué no volvió
            fecha: asignacion.fecha_devolucion_real,
            persona_id: asignacion.persona_id,
            movimiento_id: asignacion.movimiento_id,
            observaciones: 'Confirmado como perdido tras préstamo'
          });
          await queryRunner.manager.save(LibroMovimiento, movimiento);
      }

      await queryRunner.commitTransaction();
      return buildSuccessResponse(asignacion, '/libros/inventario/asignaciones');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/libros/inventario/asignaciones');
    } finally {
      await queryRunner.release();
    }
  }

  async findHistory(page = 1, per_page = 10, filters: any = {}): Promise<ApiListResponse<LibroMovimiento> | ApiErrorResponse> {
    try {
      const where: any = {};
      if (filters.libro_id) where.libro_id = filters.libro_id;
      if (filters.tipo) where.tipo = filters.tipo;
      if (filters.movimiento_id) where.movimiento_id = filters.movimiento_id;

      const [data, total] = await this.movimientoRepo.findAndCount({
        where,
        order: { fecha: 'DESC', createdAt: 'DESC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: ['libro', 'persona'],
      });

      return buildListResponse(data, total, page, per_page, filters, '/libros/inventario/movimientos');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/libros/inventario/movimientos');
    }
  }

  async findAsignaciones(page = 1, per_page = 10, filters: any = {}): Promise<ApiListResponse<LibroAsignacion> | ApiErrorResponse> {
    try {
      const where: any = {};
      if (filters.persona_id) where.persona_id = filters.persona_id;
      if (filters.estado) where.estado = filters.estado;
      if (filters.movimiento_id) where.movimiento_id = filters.movimiento_id;

      const [data, total] = await this.asignacionRepo.findAndCount({
        where,
        order: { createdAt: 'DESC' },
        skip: (page - 1) * per_page,
        take: per_page,
        relations: ['libro', 'persona'],
      });

      return buildListResponse(data, total, page, per_page, filters, '/libros/inventario/asignaciones');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/libros/inventario/asignaciones');
    }
  }
}
