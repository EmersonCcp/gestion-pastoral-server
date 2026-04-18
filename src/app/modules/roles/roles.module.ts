import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from './entities/role.entity';
import { RolPermiso } from '../roles_permisos/entities/roles_permiso.entity';
import { UsuarioRol } from '../usuarios_roles/entities/usuarios_role.entity';
import { AuthModule } from '../auth/auth.module';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';
import { EntitlementsModule } from '../entitlements/entitlements.module';

@Module({
  imports:[TypeOrmModule.forFeature([Rol,RolPermiso,UsuarioRol,UsuarioSesion]),AuthModule, EntitlementsModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
