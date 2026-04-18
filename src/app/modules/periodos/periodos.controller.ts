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
import { PeriodosService } from './periodos.service';
import { CreatePeriodoDto } from './dto/create-periodo.dto';
import { UpdatePeriodoDto } from './dto/update-periodo.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { Periodo } from './entities/periodo.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

@ApiTags('periodos')
@Controller('periodos')
export class PeriodosController {
  constructor(private readonly service: PeriodosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['periodos.create', 'periodos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo periodo' })
  @ApiResponse({
    status: 201,
    description: 'Periodo creado correctamente',
    type: Periodo,
  })
  create(@Body() dto: CreatePeriodoDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['periodos.read', 'periodos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los periodos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de periodos',
    type: [Periodo],
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('per_page') per_page: number = 10,
    @Query('nombre') nombre?: string,
    @Query('activo') activo?: boolean,
    @Query('movimiento_id') movimiento_id?: number,
    @User() user?: any,
  ) {
    return this.service.findAll(page, per_page, { nombre, activo, movimiento_id }, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['periodos.read', 'periodos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un periodo por ID' })
  @ApiParam({ name: 'id', description: 'ID del periodo' })
  @ApiResponse({
    status: 200,
    description: 'Periodo encontrado',
    type: Periodo,
  })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['periodos.update', 'periodos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un periodo por ID' })
  @ApiParam({ name: 'id', description: 'ID del periodo' })
  @ApiResponse({
    status: 200,
    description: 'Periodo actualizado correctamente',
    type: Periodo,
  })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  update(@Param('id') id: number, @Body() dto: UpdatePeriodoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['periodos.delete', 'periodos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un periodo por ID' })
  @ApiParam({ name: 'id', description: 'ID del periodo' })
  @ApiResponse({
    status: 200,
    description: 'Periodo eliminado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
