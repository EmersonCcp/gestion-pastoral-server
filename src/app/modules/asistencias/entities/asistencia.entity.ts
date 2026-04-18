import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Grupo } from '../../grupos/entities/grupo.entity';
import { Periodo } from '../../periodos/entities/periodo.entity';
import { AsistenciaPersona } from './asistencia-persona.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('asistencias')
export class Asistencia {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '2026-03-28' })
  @Column({ type: 'date' })
  fecha: string;

  @ApiProperty({ example: 'Reunión ordinaria de catequesis', nullable: true })
  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @ApiProperty({ example: 1 })
  @Column()
  grupo_id: number;

  @ApiProperty({ example: 1 })
  @Column()
  periodo_id: number;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @ManyToOne(() => Periodo)
  @JoinColumn({ name: 'periodo_id' })
  periodo: Periodo;

  @OneToMany(() => AsistenciaPersona, (persona) => persona.asistencia, { cascade: true })
  personas: AsistenciaPersona[];

  @ApiProperty({ description: 'Movimiento al que pertenece la asistencia', type: () => Movimiento })
  @ManyToOne(() => Movimiento, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;

  @Column({ name: 'movimiento_id' })
  movimiento_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
