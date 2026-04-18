import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtPayloadGuard } from './jwt-payload.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';
import { UsuarioRol } from '../usuarios_roles/entities/usuarios_role.entity';
import { Rol } from '../roles/entities/role.entity';
import { RolPermiso } from '../roles_permisos/entities/roles_permiso.entity';
import { Movimiento } from '../movimientos/entities/movimiento.entity';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { JwtAuthGuard } from './guards/auth.guard';
import { SessionGuard } from './guards/session.guard';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, UsuarioSesion, UsuarioRol, Rol, RolPermiso, Movimiento]),
    UsuariosModule,
    PassportModule,
    JwtModule.register({
      secret: 'test', // cambiar en prod
      // signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsuariosService, EntitlementsService, JwtAuthGuard, SessionGuard],
  exports: [AuthService, JwtStrategy, JwtModule],
})
export class AuthModule { }
