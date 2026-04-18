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
  Query,
} from '@nestjs/common';
import { ParroquiasService } from './parroquias.service';
import { CreateParroquiaDto } from './dto/create-parroquia.dto';
import { UpdateParroquiaDto } from './dto/update-parroquia.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { Parroquia } from './entities/parroquia.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

@ApiTags('parroquias')
@Controller('parroquias')
export class ParroquiasController {
  constructor(private readonly service: ParroquiasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['parroquias.create', 'parroquias.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear una nueva parroquia' })
  @ApiResponse({
    status: 201,
    description: 'Parroquia creada correctamente',
    type: Parroquia,
  })
  create(@Body() dto: CreateParroquiaDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['parroquias.read', 'parroquias.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todas las parroquias' })
  @ApiResponse({
    status: 200,
    description: 'Lista de parroquias',
    type: [Parroquia],
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('per_page') per_page: number = 10,
    @Query('nombre') nombre?: string,
  ) {
    return this.service.findAll(page, per_page, { nombre });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['parroquias.read', 'parroquias.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener una parroquia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la parroquia' })
  @ApiResponse({
    status: 200,
    description: 'Parroquia encontrada',
    type: Parroquia,
  })
  @ApiResponse({ status: 404, description: 'Parroquia no encontrada' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['parroquias.update', 'parroquias.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar una parroquia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la parroquia' })
  @ApiResponse({
    status: 200,
    description: 'Parroquia actualizada correctamente',
    type: Parroquia,
  })
  @ApiResponse({ status: 404, description: 'Parroquia no encontrada' })
  update(@Param('id') id: number, @Body() dto: UpdateParroquiaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['parroquias.delete', 'parroquias.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar una parroquia por ID' })
  @ApiParam({ name: 'id', description: 'ID de la parroquia' })
  @ApiResponse({
    status: 200,
    description: 'Parroquia eliminada correctamente',
  })
  @ApiResponse({ status: 404, description: 'Parroquia no encontrada' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
