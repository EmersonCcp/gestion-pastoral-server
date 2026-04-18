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
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('periodos')
export class Periodo {
  @ApiProperty({
    description: 'ID único del periodo',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre del periodo',
    example: 'Ciclo 2024',
  })
  @Column()
  nombre: string;

  @ApiProperty({
    description: 'Fecha de inicio del periodo',
    example: '2024-01-01',
  })
  @Column({ type: 'date' })
  fecha_inicio: Date;

  @ApiProperty({
    description: 'Fecha de fin del periodo',
    example: '2024-12-31',
  })
  @Column({ type: 'date' })
  fecha_fin: Date;

  @ApiProperty({
    description: 'Estado activo del periodo',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @ApiProperty({
    description: 'Movimiento al que pertenece el periodo',
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
