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
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';

@ApiTags('asignaciones')
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly service: AsignacionesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['asignaciones.create', 'asignaciones.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear una nueva asignación' })
  create(@Body() dto: CreateAsignacionDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['asignaciones.read', 'asignaciones.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar asignaciones' })
  findAll(
    @Query('page') page: number = 1,
    @Query('per_page') per_page: number = 10,
    @Query('grupo_id') grupo_id?: number,
    @Query('periodo_id') periodo_id?: number,
    @Query('movimiento_id') movimiento_id?: number,
    @Query('persona_id') persona_id?: number,
    @User() user?: any,
  ) {
    return this.service.findAll(page, per_page, { grupo_id, periodo_id, movimiento_id, persona_id }, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['asignaciones.read', 'asignaciones.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['asignaciones.update', 'asignaciones.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar una asignación' })
  update(@Param('id') id: number, @Body() dto: UpdateAsignacionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['asignaciones.delete', 'asignaciones.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar una asignación' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
