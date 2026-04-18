import { Injectable } from '@nestjs/common';
import { CreateRolesPermisoDto } from './dto/create-roles_permiso.dto';
import { UpdateRolesPermisoDto } from './dto/update-roles_permiso.dto';

@Injectable()
export class RolesPermisosService {
  create(createRolesPermisoDto: CreateRolesPermisoDto) {
    return 'This action adds a new rolesPermiso';
  }

  findAll() {
    return `This action returns all rolesPermisos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rolesPermiso`;
  }

  update(id: number, updateRolesPermisoDto: UpdateRolesPermisoDto) {
    return `This action updates a #${id} rolesPermiso`;
  }

  remove(id: number) {
    return `This action removes a #${id} rolesPermiso`;
  }
}
