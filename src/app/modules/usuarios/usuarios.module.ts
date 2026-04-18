import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { UsuarioRol } from '../usuarios_roles/entities/usuarios_role.entity';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';
import { UsuarioMovimiento } from '../usuarios_movimientos/entities/usuario_movimiento.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, UsuarioRol, UsuarioSesion, UsuarioMovimiento, Movimiento])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule { }

