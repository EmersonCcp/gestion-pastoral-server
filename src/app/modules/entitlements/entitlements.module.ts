import { Module } from '@nestjs/common';
import { EntitlementsService } from './entitlements.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioRol } from '../usuarios_roles/entities/usuarios_role.entity';
import { RolPermiso } from '../roles_permisos/entities/roles_permiso.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, UsuarioRol, RolPermiso]), CacheModule.register()],
  providers: [EntitlementsService],
  exports: [EntitlementsService],
})
export class EntitlementsModule {}
