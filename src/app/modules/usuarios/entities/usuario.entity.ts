import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { UsuarioRol } from '../../usuarios_roles/entities/usuarios_role.entity';
import { UsuarioSesion } from '../../usuarios_sesiones/entities/usuarios_sesione.entity';
import { UsuarioMovimiento } from '../../usuarios_movimientos/entities/usuario_movimiento.entity';
import { Parroquia } from '../../parroquias/entities/parroquia.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password_encrypted: string;

  @Column()
  nombre_completo: string;



  @Column({ type: 'boolean', default: true })
  is_super_user: boolean;

  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @OneToMany(() => UsuarioRol, (ur) => ur.usuario)
  usuarioRoles: UsuarioRol[];

  @OneToMany(() => UsuarioMovimiento, (um) => um.usuario)
  usuarioMovimientos: UsuarioMovimiento[];

  @ManyToOne(() => Parroquia, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parroquia_id' })
  parroquia: Parroquia;

  @Column({ name: 'parroquia_id', nullable: true })
  parroquia_id: number;

  @OneToMany(() => UsuarioSesion, (sesion) => sesion.usuario)
  sesiones: UsuarioSesion[];
}
