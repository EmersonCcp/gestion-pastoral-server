import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { DesarrolloClaseService } from './desarrollo-clase.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards, Put } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('desarrollo-clases')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SessionGuard)
@Controller('desarrollo-clases')
export class DesarrolloClaseController {
  constructor(private readonly service: DesarrolloClaseService) {}

  @Post()
  @RequirePermissions(['desarrollo_clases.create', 'desarrollo_clases.*'])
  @ApiOperation({ summary: 'Registrar el desarrollo de una clase y su asistencia' })
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(['desarrollo_clases.read', 'desarrollo_clases.*'])
  @ApiOperation({ summary: 'Listar desarrollos de clases' })
  findAll(@Query('page') page: string, @Query('per_page') per_page: string, @Query() filters: any) {
    return this.service.findAll(+page || 1, +per_page || 20, filters);
  }

  @Get(':id')
  @RequirePermissions(['desarrollo_clases.read', 'desarrollo_clases.*'])
  @ApiOperation({ summary: 'Obtener detalle de una clase específica' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @RequirePermissions(['desarrollo_clases.create', 'desarrollo_clases.*'])
  @ApiOperation({ summary: 'Actualizar un registro de clase' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions(['desarrollo_clases.delete', 'desarrollo_clases.*'])
  @ApiOperation({ summary: 'Eliminar un registro de clase' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
