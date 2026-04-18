import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
} from '@nestjs/common';
import { GruposService } from './grupos.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { Grupo } from './entities/grupo.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

@ApiTags('grupos')
@Controller('grupos')
export class GruposController {
  constructor(private readonly service: GruposService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['grupos.create', 'grupos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo grupo' })
  @ApiResponse({
    status: 201,
    description: 'Grupo creado correctamente',
    type: Grupo,
  })
  create(@Body() dto: CreateGrupoDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['grupos.read', 'grupos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los grupos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de grupos',
    type: [Grupo],
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('per_page') per_page: number = 10,
    @Query('nombre') nombre?: string,
    @Query('movimiento_id') movimiento_id?: number,
    @Query('parent_id') parent_id?: number,
    @User() user?: any,
  ) {
    return this.service.findAll(page, per_page, { nombre, movimiento_id, parent_id }, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['grupos.read', 'grupos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un grupo por ID' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({
    status: 200,
    description: 'Grupo encontrado',
    type: Grupo,
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['grupos.update', 'grupos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un grupo por ID' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({
    status: 200,
    description: 'Grupo actualizado correctamente',
    type: Grupo,
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  update(@Param('id') id: number, @Body() dto: UpdateGrupoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['grupos.delete', 'grupos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un grupo por ID' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({
    status: 200,
    description: 'Grupo eliminado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
