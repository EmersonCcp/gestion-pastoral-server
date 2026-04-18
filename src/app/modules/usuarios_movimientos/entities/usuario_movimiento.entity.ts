import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('usuario_movimientos')
@Index(['usuario', 'movimiento'], { unique: true })
export class UsuarioMovimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Usuario asignado (FK)', type: () => Usuario })
  @ManyToOne(() => Usuario, (usuario) => usuario.usuarioMovimientos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ApiProperty({ description: 'Movimiento asignado (FK)', type: () => Movimiento })
  @ManyToOne(() => Movimiento, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movimiento_id' })
  movimiento: Movimiento;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
