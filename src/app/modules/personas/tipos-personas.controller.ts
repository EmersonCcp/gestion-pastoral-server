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
import { TiposPersonasService } from './tipos-personas.service';
import { CreateTipoPersonaDto } from './dto/create-tipo-persona.dto';
import { UpdateTipoPersonaDto } from './dto/update-tipo-persona.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { TipoPersona } from './entities/tipo-persona.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

@ApiTags('tipos-personas')
@Controller('tipos-personas')
export class TiposPersonasController {
  constructor(private readonly service: TiposPersonasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.create', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear un nuevo tipo de persona' })
  @ApiResponse({
    status: 201,
    description: 'Tipo de persona creado correctamente',
    type: TipoPersona,
  })
  create(@Body() dto: CreateTipoPersonaDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.read', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todos los tipos de personas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de personas',
    type: [TipoPersona],
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('per_page') per_page: number = 10,
    @Query('nombre') nombre?: string,
    @Query('movimiento_id') movimiento_id?: number,
    @User() user?: any,
  ) {
    return this.service.findAll(page, per_page, { nombre, movimiento_id }, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.read', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un tipo por ID' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.update', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un tipo por ID' })
  update(@Param('id') id: number, @Body() dto: UpdateTipoPersonaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.delete', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un tipo por ID' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
