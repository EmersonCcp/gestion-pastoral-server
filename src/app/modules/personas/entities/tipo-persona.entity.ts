import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Persona } from './persona.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('tipos_personas')
@Index(['nombre', 'movimiento'], { unique: true })
export class TipoPersona {
  @ApiProperty({
    description: 'ID único del tipo de persona',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre del tipo (ej: ALUMNO, CATEQUISTA)',
    example: 'ALUMNO',
  })
  @Column()
  nombre: string;

  @ApiProperty({
    description: 'Descripción del tipo',
    example: 'Persona que recibe formación',
  })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ManyToMany(() => Persona, (p) => p.tiposPersonas)
  personas: Persona[];

  @ApiProperty({
    description: 'Movimiento al que pertenece el tipo de persona',
    type: () => Movimiento,
  })
  @ManyToOne(() => Movimiento, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;

  @Column({ name: 'movimiento_id' })
  movimiento_id: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-08-15T12:34:56.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-08-15T12:34:56.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
