import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Libro } from './libro.entity';
import { Persona } from '../../personas/entities/persona.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

export enum TipoMovimientoInventario {
  INGRESO = 'INGRESO',
  EGRESO = 'EGRESO',
}

export enum MotivoMovimientoInventario {
  COMPRA = 'COMPRA',
  DONACION = 'DONACION',
  DEVOLUCION_PRESTAMO = 'DEVOLUCION_PRESTAMO',
  BAJA_PERDIDA = 'BAJA_PERDIDA',
  BAJA_DANIADO = 'BAJA_DANIADO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  ENTREGA_PERSONA = 'ENTREGA_PERSONA',
  AJUSTE_MANUAL = 'AJUSTE_MANUAL'
}

@Entity('libros_movimientos')
export class LibroMovimiento {
  @ApiProperty({ description: 'ID único del movimiento' })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Libro, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'libro_id' })
  libro: Libro;

  @Column({ name: 'libro_id' })
  libro_id: number;

  @ApiProperty({ enum: TipoMovimientoInventario, description: 'Tipo de movimiento' })
  @Column({
    type: 'enum',
    enum: TipoMovimientoInventario,
  })
  tipo: TipoMovimientoInventario;

  @ApiProperty({ enum: MotivoMovimientoInventario, description: 'Motivo del movimiento' })
  @Column({
    type: 'enum',
    enum: MotivoMovimientoInventario,
  })
  motivo: MotivoMovimientoInventario;

  @ApiProperty({ description: 'Cantidad de libros' })
  @Column({ type: 'int' })
  cantidad: number;

  @ApiProperty({ description: 'Fecha del movimiento' })
  @Column({ type: 'date' })
  fecha: string;

  @ApiProperty({ description: 'Observaciones' })
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Persona, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @Column({ name: 'persona_id', nullable: true })
  persona_id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Movimiento, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;

  @Column({ name: 'movimiento_id', nullable: true })
  movimiento_id: number;
}
