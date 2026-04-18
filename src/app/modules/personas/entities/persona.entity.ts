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
import { TipoPersona } from './tipo-persona.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('personas')
export class Persona {
  @ApiProperty({
    description: 'ID único de la persona',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre de la persona',
    example: 'Juan',
  })
  @Column()
  nombre: string;

  @ApiProperty({
    description: 'Apellido de la persona',
    example: 'Pérez',
  })
  @Column()
  apellido: string;

  @ApiProperty({
    description: 'Documento de identidad (DNI, Cédula)',
    example: '12345678',
  })
  @Column({ nullable: true, unique: false })
  documento: string;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'juan.perez@example.com',
  })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: '+123456789',
  })
  @Column({ nullable: true })
  telefono: string;

  @ApiProperty({
    description: 'Dirección física',
    example: 'Calle Falsa 123',
  })
  @Column({ nullable: true })
  direccion: string;

  @ApiProperty({
    description: 'Género de la persona',
    example: 'MASCULINO',
  })
  @Column({ nullable: true })
  genero: string;

  @ApiProperty({
    description: 'Fecha de nacimiento',
    example: '1990-05-15',
  })
  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @ApiProperty({
    description: 'Tipo de persona (FK)',
    type: () => TipoPersona,
  })
  @ManyToOne(() => TipoPersona, (t) => t.personas, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tipo_persona_id' })
  tipoPersona: TipoPersona;

  @Column({ name: 'tipo_persona_id' })
  tipo_persona_id: number;

  @ApiProperty({
    description: 'Movimiento al que pertenece la persona',
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
