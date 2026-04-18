import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Grupo } from '../../grupos/entities/grupo.entity';
import { Periodo } from '../../periodos/entities/periodo.entity';
import { Aula } from '../../aulas/entities/aula.entity';
import { Persona } from '../../personas/entities/persona.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

export enum DiaReunion {
  LUNES = 'LUNES',
  MARTES = 'MARTES',
  MIERCOLES = 'MIERCOLES',
  JUEVES = 'JUEVES',
  VIERNES = 'VIERNES',
  SABADO = 'SABADO',
  DOMINGO = 'DOMINGO',
}

export enum Frecuencia {
  SEMANAL = 'SEMANAL',
  QUINCENAL = 'QUINCENAL',
  MENSUAL = 'MENSUAL',
}

@Entity('asignaciones')
export class Asignacion {
  @ApiProperty({ description: 'ID único de la asignación', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Día de reunión', example: 'SABADO' })
  @Column({ type: 'varchar', nullable: true })
  dia_reunion: string | null;

  @ApiProperty({ description: 'Frecuencia de la reunión', example: 'QUINCENAL' })
  @Column({ type: 'varchar', nullable: true })
  frecuencia: string | null;

  @ApiProperty({ description: 'Hora de inicio', example: '09:00' })
  @Column({ type: 'varchar', nullable: true })
  hora_inicio: string | null;

  @ApiProperty({ description: 'Hora de fin', example: '11:00' })
  @Column({ type: 'varchar', nullable: true })
  hora_fin: string | null;

  // --- Relaciones ---

  @ApiProperty({ type: () => Grupo })
  @ManyToOne(() => Grupo, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @Column({ name: 'grupo_id' })
  grupo_id: number;

  @ApiProperty({ type: () => Periodo })
  @ManyToOne(() => Periodo, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'periodo_id' })
  periodo: Periodo;

  @Column({ name: 'periodo_id' })
  periodo_id: number;

  @ApiProperty({ type: () => Aula, nullable: true })
  @ManyToOne(() => Aula, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'aula_id' })
  aula: Aula;

  @Column({ name: 'aula_id', nullable: true })
  aula_id: number | null;

  @ApiProperty({ type: () => [Persona] })
  @ManyToMany(() => Persona, { cascade: false })
  @JoinTable({
    name: 'asignacion_personas',
    joinColumn: { name: 'asignacion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'persona_id', referencedColumnName: 'id' },
  })
  personas: Persona[];

  @ApiProperty({ description: 'Movimiento al que pertenece la asignación', type: () => Movimiento })
  @ManyToOne(() => Movimiento, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;

  @Column({ name: 'movimiento_id' })
  movimiento_id: number;

  @ApiProperty({ example: '2025-08-15T12:34:56.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2025-08-15T12:34:56.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
