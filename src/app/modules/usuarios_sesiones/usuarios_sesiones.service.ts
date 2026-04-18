import { Injectable } from '@nestjs/common';
import { CreateUsuariosSesioneDto } from './dto/create-usuarios_sesione.dto';
import { UpdateUsuariosSesioneDto } from './dto/update-usuarios_sesione.dto';

@Injectable()
export class UsuariosSesionesService {
  create(createUsuariosSesioneDto: CreateUsuariosSesioneDto) {
    return 'This action adds a new usuariosSesione';
  }

  findAll() {
    return `This action returns all usuariosSesiones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuariosSesione`;
  }

  update(id: number, updateUsuariosSesioneDto: UpdateUsuariosSesioneDto) {
    return `This action updates a #${id} usuariosSesione`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuariosSesione`;
  }
}
