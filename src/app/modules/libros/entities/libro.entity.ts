import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TipoPersona } from '../../personas/entities/tipo-persona.entity';
import { Grupo } from '../../grupos/entities/grupo.entity';
import { Tema } from './tema.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('libros')
export class Libro {
  @ApiProperty({ description: 'ID único del libro' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Nombre del libro' })
  @Column()
  nombre: string;

  @ApiProperty({ description: 'Descripción del libro' })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ApiProperty({ description: 'Tipo de persona al que va dirigido' })
  @ManyToOne(() => TipoPersona, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tipo_persona_id' })
  tipoPersona: TipoPersona;

  @Column({ name: 'tipo_persona_id' })
  tipo_persona_id: number;

  @ApiProperty({ description: 'Estado del libro' })
  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @ApiProperty({ description: 'Stock actual disponible' })
  @Column({ type: 'int', default: 0 })
  stock_actual: number;

  @OneToMany(() => Tema, (t) => t.libro)
  temas: Tema[];

  @ManyToMany(() => Grupo, (g) => g.libros)
  grupos: Grupo[];

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
