import { Module } from '@nestjs/common';
import { RolesPermisosService } from './roles_permisos.service';
import { RolesPermisosController } from './roles_permisos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rol } from '../roles/entities/role.entity';
import { Permiso } from '../permisos/entities/permiso.entity';
import { RolPermiso } from './entities/roles_permiso.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Rol,Permiso,RolPermiso])],
  controllers: [RolesPermisosController],
  providers: [RolesPermisosService],
})
export class RolesPermisosModule {}
