import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { Usuario } from './entities/usuario.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['usuarios.create', 'usuarios.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear una nueva usuario' })
  @ApiResponse({
    status: 201,
    description: 'usuario creada correctamente',
    type: Usuario,
  })
  // @UseGuards(JwtPayloadGuard)
  create(@Body() dto: CreateUsuarioDto, @Req() req) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['usuarios.read', 'usuarios.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos las usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: [Usuario],
  })
  // @UseGuards(JwtPayloadGuard)
  findAll(@Req() req) {
    return this.service.findAll(1, 20, {});
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['usuarios.read', 'usuarios.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener una usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID de la usuario' })
  @ApiResponse({
    status: 200,
    description: 'usuario encontrado',
    type: Usuario,
  })
  @ApiResponse({ status: 404, description: 'usuario no encontrado' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['usuarios.update', 'usuarios.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar una usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID de la usuario' })
  @ApiResponse({
    status: 200,
    description: 'usuario actualizado correctamente',
    type: Usuario,
  })
  @ApiResponse({ status: 404, description: 'usuario no encontrado' })
  update(@Param('id') id: number, @Body() dto: UpdateUsuarioDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['usuarios.delete', 'usuarios.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar una usuario por ID' })
  @ApiParam({ name: 'id', description: 'ID de la usuario' })
  @ApiResponse({
    status: 200,
    description: 'usuario eliminado correctamente',
    type: Usuario,
  })
  @ApiResponse({ status: 404, description: 'usuario no encontrado' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
