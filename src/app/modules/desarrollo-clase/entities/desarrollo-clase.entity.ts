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
  OneToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Grupo } from '../../grupos/entities/grupo.entity';
import { Libro } from '../../libros/entities/libro.entity';
import { Tema } from '../../libros/entities/tema.entity';
import { Asistencia } from '../../asistencias/entities/asistencia.entity';

@Entity('desarrollo_clases')
export class DesarrolloClase {
  @ApiProperty({ description: 'ID único del registro de clase' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Fecha de la clase' })
  @Column({ type: 'date' })
  fecha: string;

  @ApiProperty({ description: 'Observaciones de la sesión' })
  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Grupo)
  @JoinColumn({ name: 'grupo_id' })
  grupo: Grupo;

  @Column({ name: 'grupo_id' })
  grupo_id: number;

  @ManyToOne(() => Libro)
  @JoinColumn({ name: 'libro_id' })
  libro: Libro;

  @Column({ name: 'libro_id' })
  libro_id: number;

  @ApiProperty({ description: 'Temas desarrollados en la sesión' })
  @ManyToMany(() => Tema)
  @JoinTable({
    name: 'desarrollo_clases_temas',
    joinColumn: { name: 'desarrollo_clase_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tema_id', referencedColumnName: 'id' },
  })
  temas: Tema[];

  @OneToOne(() => Asistencia, { cascade: true, nullable: true })
  @JoinColumn({ name: 'asistencia_id' })
  asistencia: Asistencia;

  @Column({ name: 'asistencia_id', nullable: true })
  asistencia_id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
