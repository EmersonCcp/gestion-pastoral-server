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
import { PersonasService } from './personas.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { CreatePersonaRelacionDto } from './dto/persona-relacion.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { Persona } from './entities/persona.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

@ApiTags('personas')
@Controller('personas')
export class PersonasController {
  constructor(private readonly service: PersonasService) { }

  @Post()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.create', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear una nueva persona' })
  @ApiResponse({
    status: 201,
    description: 'Persona creada correctamente',
    type: Persona,
  })
  create(@Body() dto: CreatePersonaDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.read', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todas las personas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de personas',
    type: [Persona],
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('per_page') per_page: number = 10,
    @Query('nombre') nombre?: string,
    @Query('apellido') apellido?: string,
    @Query('documento') documento?: string,
    @Query('tipo_persona_id') tipo_persona_id?: number,
    @Query('movimiento_id') movimiento_id?: number,
    @User() user?: any,
  ) {

    return this.service.findAll(page, per_page, { nombre, apellido, documento, tipo_persona_id, movimiento_id }, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.read', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener una persona por ID' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.update', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar una persona por ID' })
  update(@Param('id') id: number, @Body() dto: UpdatePersonaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.delete', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar una persona por ID' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }

  @Post('relaciones')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.update', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Agregar una relación de parentesco' })
  addRelacion(@Body() dto: CreatePersonaRelacionDto) {
    return this.service.addRelacion(dto);
  }

  @Delete('relaciones/:id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['personas.update', 'personas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar una relación de parentesco' })
  removeRelacion(@Param('id') id: number) {
    return this.service.removeRelacion(id);
  }
}
