import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Column,
  UpdateDateColumn,
  RelationId,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Rol } from '../../roles/entities/role.entity';
import { Permiso } from '../../permisos/entities/permiso.entity';

@Entity('roles_permisos')
@Unique(['rol', 'permiso'])
export class RolPermiso {
  @ApiProperty({ description: 'Identificador único ' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Rol asociado' })
  @ManyToOne(() => Rol, (rol) => rol.rolPermisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rol_id' })
  rol: Rol;

  @ApiProperty({ description: 'Permiso asociado' })
  @ManyToOne(() => Permiso, (permiso) => permiso.rolPermisos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permiso_id' })
  permiso: Permiso;

  @ApiProperty({ description: 'Fecha de creación' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}