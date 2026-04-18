import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RolPermiso } from '../../roles_permisos/entities/roles_permiso.entity';
import { UsuarioRol } from '../../usuarios_roles/entities/usuarios_role.entity';

@Entity('roles')
export class Rol {
  @ApiProperty({
    description: 'id único del rol',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre único del rol',
    example: 'admin',
  })
  @Column({ unique: true })
  nombre: string;

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Rol con permisos administrativos completos',
  })
  @Column({ nullable: true })
  descripcion?: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el rol está activ0',
  })
  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @ApiProperty({
    description: 'Fecha de creación del rol',
    example: '2025-08-15T12:34:56.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => RolPermiso, (rp) => rp.rol)
  rolPermisos: RolPermiso[];

  @OneToMany(() => UsuarioRol, (usuarioRol) => usuarioRol.rol)
  usuarioRoles: UsuarioRol[];
}
