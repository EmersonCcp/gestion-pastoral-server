import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentosPersonaService } from './documentos-persona.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { DocumentoPersona } from './entities/documento-persona.entity';

@ApiTags('documentos-persona')
@Controller('documentos-persona')
@UseGuards(JwtAuthGuard, SessionGuard)
@ApiBearerAuth('access-token')
export class DocumentosPersonaController {
  constructor(private readonly service: DocumentosPersonaService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar metadatos de un documento subido' })
  create(@Body() data: Partial<DocumentoPersona>) {
    return this.service.create(data);
  }

  @Get('persona/:personaId')
  @ApiOperation({ summary: 'Listar documentos de una persona' })
  findByPersona(@Param('personaId') personaId: string) {
    return this.service.findByPersona(+personaId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar metadatos de un documento' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
