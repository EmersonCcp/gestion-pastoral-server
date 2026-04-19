import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LibrosInventarioService } from './libros-inventario.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';

@ApiTags('libros-inventario')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, SessionGuard)
@Controller('libros-inventario')
export class LibrosInventarioController {
  constructor(private readonly service: LibrosInventarioService) {}

  @Post('movimiento')
  @RequirePermissions(['libros.update', 'libros.*'])
  @ApiOperation({ summary: 'Registrar un movimiento manual de inventario' })
  registrarMovimiento(@Body() dto: any) {
    return this.service.registrarMovimiento(dto);
  }

  @Post('asignar')
  @RequirePermissions(['libros.update', 'libros.*'])
  @ApiOperation({ summary: 'Asignar un libro a una persona (Venta/Préstamo)' })
  asignarLibro(@Body() dto: any) {
    return this.service.asignarLibro(dto);
  }

  @Post('devolver/:id')
  @RequirePermissions(['libros.update', 'libros.*'])
  @ApiOperation({ summary: 'Registrar devolución de un libro' })
  devolverLibro(@Param('id') id: string, @Body() dto: any) {
    return this.service.devolverLibro(+id, dto);
  }

  @Get('historial')
  @RequirePermissions(['libros.read', 'libros.*'])
  @ApiOperation({ summary: 'Listar historial de movimientos' })
  findHistory(@Query('page') page: string, @Query('per_page') per_page: string, @Query() filters: any) {
    return this.service.findHistory(+page || 1, +per_page || 10, filters);
  }

  @Get('asignaciones')
  @RequirePermissions(['libros.read', 'libros.*'])
  @ApiOperation({ summary: 'Listar libros asignados a personas' })
  findAsignaciones(@Query('page') page: string, @Query('per_page') per_page: string, @Query() filters: any) {
    return this.service.findAsignaciones(+page || 1, +per_page || 10, filters);
  }
}
