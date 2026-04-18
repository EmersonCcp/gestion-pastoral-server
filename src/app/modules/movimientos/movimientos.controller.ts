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
import { MovimientosService } from './movimientos.service';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { Movimiento } from './entities/movimiento.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

@ApiTags('movimientos')
@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly service: MovimientosService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['movimientos.create', 'movimientos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo movimiento' })
  @ApiResponse({
    status: 201,
    description: 'Movimiento creado correctamente',
    type: Movimiento,
  })
  create(@Body() dto: CreateMovimientoDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['movimientos.read', 'movimientos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los movimientos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de movimientos',
    type: [Movimiento],
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('per_page') per_page: number = 10,
    @Query('nombre') nombre?: string,
    @Query('parroquia_id') parroquia_id?: number,
  ) {
    return this.service.findAll(page, per_page, { nombre, parroquia_id });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['movimientos.read', 'movimientos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un movimiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento encontrado',
    type: Movimiento,
  })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['movimientos.update', 'movimientos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un movimiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento actualizado correctamente',
    type: Movimiento,
  })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  update(@Param('id') id: number, @Body() dto: UpdateMovimientoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['movimientos.delete', 'movimientos.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un movimiento por ID' })
  @ApiParam({ name: 'id', description: 'ID del movimiento' })
  @ApiResponse({
    status: 200,
    description: 'Movimiento eliminado correctamente',
  })
  @ApiResponse({ status: 404, description: 'Movimiento no encontrado' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
