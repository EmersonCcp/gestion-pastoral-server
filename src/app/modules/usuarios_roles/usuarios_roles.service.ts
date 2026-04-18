import { Injectable } from '@nestjs/common';
import { CreateUsuariosRoleDto } from './dto/create-usuarios_role.dto';
import { UpdateUsuariosRoleDto } from './dto/update-usuarios_role.dto';

@Injectable()
export class UsuariosRolesService {
  create(createUsuariosRoleDto: CreateUsuariosRoleDto) {
    return 'This action adds a new usuariosRole';
  }

  findAll() {
    return `This action returns all usuariosRoles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuariosRole`;
  }

  update(id: number, updateUsuariosRoleDto: UpdateUsuariosRoleDto) {
    return `This action updates a #${id} usuariosRole`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuariosRole`;
  }
}
