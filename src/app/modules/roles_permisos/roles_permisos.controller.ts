import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RolesPermisosService } from './roles_permisos.service';
import { CreateRolesPermisoDto } from './dto/create-roles_permiso.dto';
import { UpdateRolesPermisoDto } from './dto/update-roles_permiso.dto';

@Controller('roles-permisos')
export class RolesPermisosController {
  constructor(private readonly rolesPermisosService: RolesPermisosService) {}

  @Post()
  create(@Body() createRolesPermisoDto: CreateRolesPermisoDto) {
    return this.rolesPermisosService.create(createRolesPermisoDto);
  }

  @Get()
  findAll() {
    return this.rolesPermisosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesPermisosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRolesPermisoDto: UpdateRolesPermisoDto) {
    return this.rolesPermisosService.update(+id, updateRolesPermisoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rolesPermisosService.remove(+id);
  }
}
