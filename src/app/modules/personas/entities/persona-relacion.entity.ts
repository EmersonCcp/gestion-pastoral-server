import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Persona } from './persona.entity';

export enum TipoParentesco {
  PADRE = 'PADRE',
  MADRE = 'MADRE',
  TUTOR = 'TUTOR',
  HERMANO = 'HERMANO',
  CONYUGE = 'CONYUGE',
  HIJO = 'HIJO',
  ABUELO = 'ABUELO',
  TIO = 'TIO',
  PRIMO = 'PRIMO',
  OTRO = 'OTRO',
}

@Entity('personas_relaciones')
export class PersonaRelacion {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Persona, (p) => p.relaciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'persona_id' })
  persona: Persona;

  @Column({ name: 'persona_id' })
  persona_id: number;

  @ManyToOne(() => Persona, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pariente_id' })
  pariente: Persona;

  @Column({ name: 'pariente_id' })
  pariente_id: number;

  @ApiProperty({ enum: TipoParentesco })
  @Column({
    type: 'enum',
    enum: TipoParentesco,
    default: TipoParentesco.OTRO,
  })
  parentesco: TipoParentesco;

  @Column({ default: false })
  es_contacto_emergencia: boolean;

  @Column({ default: false })
  es_responsable_legal: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
