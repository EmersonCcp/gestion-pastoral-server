import { Controller, Get, Post, Body, Put, Param, Delete, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { AsistenciasService } from './asistencias.service';
import { CreateAsistenciaDto, UpdateAsistenciaDto } from './dto/asistencias.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { RequirePermissions } from 'src/shared/decorators/permissions.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('asistencias')
@Controller('asistencias')
@UseGuards(JwtAuthGuard, SessionGuard)
@ApiBearerAuth('access-token')
export class AsistenciasController {
  constructor(private readonly service: AsistenciasService) {}

  @Post()
  @RequirePermissions(['asistencias.create', 'asistencias.*'])
  @ApiOperation({ summary: 'Registrar una asistencia' })
  create(@Body() dto: CreateAsistenciaDto) {
    return this.service.create(dto);
  }

  @Get()
  @RequirePermissions(['asistencias.read', 'asistencias.*'])
  @ApiOperation({ summary: 'Listar asistencias' })
  findAll(
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
    @Query('grupo_id') grupo_id?: number,
    @Query('periodo_id') periodo_id?: number,
    @Query('movimiento_id') movimiento_id?: number,
    @User() user?: any,
  ) {
    return this.service.findAll(page, per_page, { 
      grupo_id: grupo_id ? Number(grupo_id) : undefined, 
      periodo_id: periodo_id ? Number(periodo_id) : undefined, 
      movimiento_id: movimiento_id ? Number(movimiento_id) : undefined 
    }, user);
  }

  @Get(':id')
  @RequirePermissions(['asistencias.read', 'asistencias.*'])
  @ApiOperation({ summary: 'Obtener detalle de una asistencia' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  @RequirePermissions(['asistencias.update', 'asistencias.*'])
  @ApiOperation({ summary: 'Actualizar una asistencia' })
  update(@Param('id') id: string, @Body() dto: UpdateAsistenciaDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  @RequirePermissions(['asistencias.delete', 'asistencias.*'])
  @ApiOperation({ summary: 'Eliminar una asistencia' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Get('resumen-persona/:personaId')
  @ApiOperation({ summary: 'Obtener resumen de asistencias de una persona' })
  getPersonaSummary(@Param('personaId') personaId: string) {
    return this.service.getPersonaSummary(+personaId);
  }

  @Get('historial-persona/:personaId')
  @ApiOperation({ summary: 'Obtener historial de asistencias de una persona paginado' })
  getPersonaHistory(
    @Param('personaId') personaId: string,
    @Query('page') page?: number,
    @Query('per_page') per_page?: number,
  ) {
    return this.service.getPersonaHistory(+personaId, page, per_page);
  }

  @Post('reporte')
  @ApiOperation({ summary: 'Obtener detalle para reporte de múltiples asistencias' })
  getReportDetails(@Body() body: { ids: number[] }) {
    return this.service.getReportDetails(body.ids);
  }

  @Get('reporte-planilla/grilla')
  @ApiOperation({ summary: 'Obtener la planilla de asistencias consolidada en un rango de fechas' })
  getReportePlanilla(
    @Query('periodo_id') periodo_id: number,
    @Query('grupo_id') grupo_id: number,
    @Query('fecha_inicio') fecha_inicio: string,
    @Query('fecha_fin') fecha_fin: string,
  ) {
    return this.service.getReportePlanilla({
      periodo_id: Number(periodo_id),
      grupo_id: Number(grupo_id),
      fecha_inicio,
      fecha_fin,
    });
  }

  @Post('escanear')
  @RequirePermissions(['asistencias.create', 'asistencias.*'])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Escanear una planilla de asistencia física con IA' })
  scanPlanilla(
    @Body('periodo_id') periodo_id: string,
    @Body('grupo_id') grupo_id: string,
    @Body('tipo_escaneo') tipo_escaneo: string,
    @Body('fecha_especifica') fecha_especifica: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.scanPlanilla(
      Number(periodo_id),
      Number(grupo_id),
      file.buffer,
      file.mimetype,
      tipo_escaneo,
      fecha_especifica,
    );
  }

  @Post('guardar-lote')
  @RequirePermissions(['asistencias.create', 'asistencias.*'])
  @ApiOperation({ summary: 'Guardar lote de asistencias validadas' })
  guardarLote(@Body() body: any) {
    return this.service.guardarLote(body);
  }
}
