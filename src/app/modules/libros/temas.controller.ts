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

@ApiTags('temas')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SessionGuard)
@Controller('temas')
export class TemasController {
  constructor(private readonly service: LibrosService) {}

  @Get()
  @RequirePermissions(['libros.read', 'libros.*'])
  @ApiOperation({ summary: 'Listar temas de libros' })
  findAll(@Query() filters: any) {
    return this.service.findAllTemas(filters);
  }

  @Post()
  @RequirePermissions(['libros.update', 'libros.*'])
  @ApiOperation({ summary: 'Crear un tema' })
  create(@Body() dto: any) {
    return this.service.createTema(dto);
  }

  @Put(':id')
  @RequirePermissions(['libros.update', 'libros.*'])
  @ApiOperation({ summary: 'Actualizar un tema' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.updateTema(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions(['libros.update', 'libros.*'])
  @ApiOperation({ summary: 'Eliminar un tema' })
  remove(@Param('id') id: string) {
    return this.service.removeTema(+id);
  }
}
