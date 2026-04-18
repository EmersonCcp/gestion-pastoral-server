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
import { AulasService } from './aulas.service';
import { CreateAulaDto } from './dto/create-aula.dto';
import { UpdateAulaDto } from './dto/update-aula.dto';
import { ApiOperation, ApiParam, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { Aula } from './entities/aula.entity';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';

@ApiTags('aulas')
@Controller('aulas')
export class AulasController {
  constructor(private readonly service: AulasService) {}

  @Post()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['aulas.create', 'aulas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear una nueva aula' })
  @ApiResponse({
    status: 201,
    description: 'Aula creada correctamente',
    type: Aula,
  })
  create(@Body() dto: CreateAulaDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['aulas.read', 'aulas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener todas las aulas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de aulas',
    type: [Aula],
  })
  findAll(
    @Query('page') page: number = 1,
    @Query('per_page') per_page: number = 10,
    @Query('nombre') nombre?: string,
    @Query('parroquia_id') parroquia_id?: number,
    @Query('movimiento_id') movimiento_id?: number,
    @User() user?: any,
  ) {
    return this.service.findAll(page, per_page, { nombre, parroquia_id, movimiento_id }, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['aulas.read', 'aulas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener un aula por ID' })
  findOne(@Param('id') id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['aulas.update', 'aulas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar un aula por ID' })
  update(@Param('id') id: number, @Body() dto: UpdateAulaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, SessionGuard)
  @RequirePermissions(['aulas.delete', 'aulas.*'])
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar un aula por ID' })
  remove(@Param('id') id: number) {
    return this.service.remove(id);
  }
}
