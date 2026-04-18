import { Module } from '@nestjs/common';
import { UsuariosRolesService } from './usuarios_roles.service';
import { UsuariosRolesController } from './usuarios_roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from '../roles/entities/role.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuarioRol } from './entities/usuarios_role.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Rol,Usuario,UsuarioRol])],
  controllers: [UsuariosRolesController],
  providers: [UsuariosRolesService],
})
export class UsuariosRolesModule {}
