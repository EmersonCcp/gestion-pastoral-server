import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Rol } from '../../roles/entities/role.entity';

@Entity('usuarios_roles')
@Index(['usuario', 'rol'], { unique: true })
export class UsuarioRol {
  @ApiProperty({
    description: 'UUID único del registro',
    format: 'int',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Usuario asignado (FK)', type: () => Usuario })
  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioRoles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ApiProperty({ description: 'Rol asignado (FK)', type: () => Rol })
  @ManyToOne(() => Rol, (rol) => rol.usuarioRoles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ApiProperty({
    description: 'Fecha/hora de asignación',
    example: '2025-08-18T12:34:56Z',
  })
  @CreateDateColumn({
    name: 'assigned_at',
    
  })
  assignedAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha/hora de expiración (opcional)',
    example: '2025-12-31T23:59:59Z',
    nullable: true,
  })
  @Column({ name: 'expires_at', nullable: true })
  expiresAt?: Date ;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at'})
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}