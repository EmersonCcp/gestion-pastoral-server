import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuariosSesionesService } from './usuarios_sesiones.service';
import { CreateUsuariosSesioneDto } from './dto/create-usuarios_sesione.dto';
import { UpdateUsuariosSesioneDto } from './dto/update-usuarios_sesione.dto';

@Controller('usuarios-sesiones')
export class UsuariosSesionesController {
  constructor(private readonly usuariosSesionesService: UsuariosSesionesService) {}

  @Post()
  create(@Body() createUsuariosSesioneDto: CreateUsuariosSesioneDto) {
    return this.usuariosSesionesService.create(createUsuariosSesioneDto);
  }

  @Get()
  findAll() {
    return this.usuariosSesionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosSesionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuariosSesioneDto: UpdateUsuariosSesioneDto) {
    return this.usuariosSesionesService.update(+id, updateUsuariosSesioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosSesionesService.remove(+id);
  }
}
