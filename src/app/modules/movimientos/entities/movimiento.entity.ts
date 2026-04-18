import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Parroquia } from '../../parroquias/entities/parroquia.entity';
import { Grupo } from '../../grupos/entities/grupo.entity';

@Entity('movimientos')
export class Movimiento {
  @ApiProperty({
    description: 'ID único del movimiento',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre del movimiento',
    example: 'Catequesis',
  })
  @Column()
  nombre: string;

  @ApiProperty({
    description: 'Descripción del movimiento',
    example: 'Formación para sacramentos...',
  })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ApiProperty({
    description: 'Estado del movimiento (activo/inactivo)',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @ApiProperty({
    description: 'Parroquia a la que pertenece el movimiento (opcional)',
    type: () => Parroquia,
    nullable: true,
  })
  @ManyToOne(() => Parroquia, (p) => p.movimientos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parroquia_id' })
  parroquia: Parroquia;

  @Column({ name: 'parroquia_id', nullable: true })
  parroquia_id: number;

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

  @OneToMany(() => Grupo, (g) => g.movimiento)
  grupos: Grupo[];
}
