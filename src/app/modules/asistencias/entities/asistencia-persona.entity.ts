import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Asistencia } from './asistencia.entity';
import { Persona } from '../../personas/entities/persona.entity';

export enum EstadoAsistencia {
  PRESENTE = 'PRESENTE',
  AUSENTE = 'AUSENTE',
  JUSTIFICADO = 'JUSTIFICADO',
}

@Entity('asistencia_personas')
export class AsistenciaPersona {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column()
  asistencia_id: number;

  @ApiProperty({ example: 1 })
  @Column()
  persona_id: number;

  @ApiProperty({ enum: EstadoAsistencia, example: EstadoAsistencia.PRESENTE })
  @Column({ type: 'enum', enum: EstadoAsistencia, default: EstadoAsistencia.PRESENTE })
  estado: EstadoAsistencia;

  @ApiProperty({ example: 'Se le justificó por enfermedad', nullable: true })
  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @ManyToOne(() => Asistencia, (asistencia) => asistencia.personas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asistencia_id' })
  asistencia: Asistencia;

  @ManyToOne(() => Persona)
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;
}
