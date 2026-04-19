import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LibrosService } from './libros.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards, Put } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('libros')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SessionGuard)
@Controller('libros')
export class LibrosController {
  constructor(private readonly service: LibrosService) {}

  @Post()
  @RequirePermissions(['libros.create', 'libros.*'])
  @ApiOperation({ summary: 'Crear un nuevo libro' })
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(['libros.read', 'libros.*'])
  @ApiOperation({ summary: 'Listar libros' })
  findAll(@Query('page') page: string, @Query('per_page') per_page: string, @Query() filters: any) {
    return this.service.findAll(+page || 1, +per_page || 10, filters);
  }

  @Get(':id')
  @RequirePermissions(['libros.read', 'libros.*'])
  @ApiOperation({ summary: 'Obtener un libro por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @RequirePermissions(['libros.update', 'libros.*'])
  @ApiOperation({ summary: 'Actualizar un libro' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions(['libros.delete', 'libros.*'])
  @ApiOperation({ summary: 'Eliminar un libro' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
