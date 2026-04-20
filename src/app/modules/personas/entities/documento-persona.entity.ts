import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Persona } from './persona.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('persona_documentos')
export class DocumentoPersona {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Certificado de Bautismo' })
  @Column()
  nombre: string;

  @ApiProperty({ example: 'https://storage.googleapis.com/.../file.pdf' })
  @Column({ type: 'text' })
  url: string;

  @ApiProperty({ example: 'movimiento_1/personas/14/documentos/file.pdf' })
  @Column({ type: 'text' })
  path: string;

  @ApiProperty({ example: 'application/pdf' })
  @Column({ nullable: true })
  tipo: string;

  @ApiProperty({ example: 14 })
  @Column()
  persona_id: number;

  @ManyToOne(() => Persona, (persona) => persona.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @ApiProperty({ example: 1 })
  @Column()
  movimiento_id: number;

  @ManyToOne(() => Movimiento, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
