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

@Entity('temas')
export class Tema {
  @ApiProperty({ description: 'ID único del tema' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Orden o número del tema' })
  @Column()
  numero_tema: number;

  @ApiProperty({ description: 'Título del tema' })
  @Column()
  titulo: string;

  @ApiProperty({ description: 'Descripción o resumen del tema' })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ManyToOne(() => Libro, (l) => l.temas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'libro_id' })
  libro: Libro;

  @Column({ name: 'libro_id' })
  libro_id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
