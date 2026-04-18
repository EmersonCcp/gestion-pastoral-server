import { Module } from '@nestjs/common';
import { PermisosService } from './permisos.service';
import { PermisosController } from './permisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permiso } from './entities/permiso.entity';
import { RolPermiso } from '../roles_permisos/entities/roles_permiso.entity';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioRol } from '../usuarios_roles/entities/usuarios_role.entity';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Permiso,RolPermiso,UsuarioRol,UsuarioSesion])],
  controllers: [PermisosController],
  providers: [PermisosService,EntitlementsService],
})
export class PermisosModule {}
