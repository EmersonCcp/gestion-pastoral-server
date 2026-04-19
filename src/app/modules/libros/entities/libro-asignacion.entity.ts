import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Libro } from './libro.entity';
import { Persona } from '../../personas/entities/persona.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

export enum TipoAsignacionLibro {
  VENTA = 'VENTA',
  PRESTAMO = 'PRESTAMO',
}

export enum EstadoAsignacionLibro {
  ENTREGADO = 'ENTREGADO',
  DEVUELTO = 'DEVUELTO',
  PERDIDO = 'PERDIDO',
}

@Entity('libros_asignaciones')
export class LibroAsignacion {
  @ApiProperty({ description: 'ID único de la asignación' })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Libro, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'libro_id' })
  libro: Libro;

  @Column({ name: 'libro_id' })
  libro_id: number;

  @ManyToOne(() => Persona, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @Column({ name: 'persona_id' })
  persona_id: number;

  @ApiProperty({ enum: TipoAsignacionLibro, description: 'Tipo de asignación' })
  @Column({
    type: 'enum',
    enum: TipoAsignacionLibro,
  })
  tipo: TipoAsignacionLibro;

  @ApiProperty({ enum: EstadoAsignacionLibro, description: 'Estado de la asignación' })
  @Column({
    type: 'enum',
    enum: EstadoAsignacionLibro,
    default: EstadoAsignacionLibro.ENTREGADO
  })
  estado: EstadoAsignacionLibro;

  @ApiProperty({ description: 'Fecha de entrega' })
  @Column({ type: 'date' })
  fecha_entrega: string;

  @ApiProperty({ description: 'Fecha de devolución esperada (solo para préstamos)' })
  @Column({ type: 'date', nullable: true })
  fecha_devolucion_esperada: string;

  @ApiProperty({ description: 'Fecha de devolución real' })
  @Column({ type: 'date', nullable: true })
  fecha_devolucion_real: string;

  @ApiProperty({ description: 'Observaciones' })
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Movimiento, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;

  @Column({ name: 'movimiento_id', nullable: true })
  movimiento_id: number;
}
