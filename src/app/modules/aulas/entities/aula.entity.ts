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
import { Parroquia } from '../../parroquias/entities/parroquia.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('aulas')
export class Aula {
  @ApiProperty({
    description: 'ID único del aula',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre del aula (ej: Aula 101, Salón San José)',
    example: 'Salón San José',
  })
  @Column()
  nombre: string;

  @ApiProperty({
    description: 'Capacidad máxima de personas',
    example: 30,
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  capacidad: number;

  @ApiProperty({
    description: 'Ubicación física (ej: Planta Alta, Sector B)',
    example: 'Planta Alta',
    required: false,
  })
  @Column({ nullable: true })
  ubicacion: string;

  @ApiProperty({
    description: 'Parroquia a la que pertenece (FK)',
    type: () => Parroquia,
  })
  @ManyToOne(() => Parroquia, (p) => p.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parroquia_id' })
  parroquia: Parroquia;

  @Column({ name: 'parroquia_id' })
  parroquia_id: number;

  @ApiProperty({
    description: 'Movimiento al que pertenece el aula',
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
