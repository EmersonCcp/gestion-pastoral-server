import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { RolPermiso } from '../../roles_permisos/entities/roles_permiso.entity';
// import { RolePermission } from '../roles_permissions/roles_permission.entity';

@Entity('permisos')
@Unique(['sujeto', 'accion'])
export class Permiso {
  @ApiProperty({ description: 'Identificador único' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Acción permitida' })
  @Column()
  accion: string;

  @ApiProperty({ description: 'Sujeto u objeto sobre el que se aplica la acción' })
  @Column()
  sujeto: string;

  // @ApiProperty({ description: 'Condiciones en formato JSON' })
  // @Column({ type: 'jsonb', nullable: true })
  // condiciones: Record<string, any>;

  @ApiProperty({ description: 'Descripción de la acción' })
  @Column({  nullable: true })
  descripcion: string;

  @ApiProperty({ description: 'Fecha de creación del permiso' })
  @CreateDateColumn({ name: 'created_at', })
  createdAt: Date;

  @OneToMany(() => RolPermiso, (rp) => rp.permiso)
  rolPermisos: RolPermiso[];
}