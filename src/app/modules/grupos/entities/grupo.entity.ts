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
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('grupos')
export class Grupo {
  @ApiProperty({
    description: 'ID único del grupo',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre del grupo',
    example: 'Confirmación 1',
  })
  @Column()
  nombre: string;

  @ApiProperty({
    description: 'Descripción del grupo',
    example: 'Grupo de primer año de confirmación',
  })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ApiProperty({
    description: 'Estado del grupo (activo/inactivo)',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @ApiProperty({
    description: 'Movimiento al que pertenece el grupo',
    type: () => Movimiento,
  })
  @ManyToOne(() => Movimiento, (m) => m.grupos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;

  @Column({ name: 'movimiento_id' })
  movimiento_id: number;

  @ApiProperty({
    description: 'Grupo padre (para subgrupos)',
    type: () => Grupo,
    nullable: true,
  })
  @ManyToOne(() => Grupo, (g) => g.subgrupos, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent: Grupo;

  @Column({ name: 'parent_id', nullable: true })
  parent_id: number;

  @OneToMany(() => Grupo, (g) => g.parent)
  subgrupos: Grupo[];

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
