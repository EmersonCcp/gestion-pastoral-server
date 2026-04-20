import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentoPersona } from './entities/documento-persona.entity';
import { buildErrorResponse, buildSuccessResponse } from 'src/shared/http/api-response.util';
import { ApiResponse, ApiErrorResponse } from 'src/shared/types/response.types';

@Injectable()
export class DocumentosPersonaService {
  constructor(
    @InjectRepository(DocumentoPersona)
    private repo: Repository<DocumentoPersona>,
  ) {}

  async create(data: Partial<DocumentoPersona>): Promise<ApiResponse<DocumentoPersona> | ApiErrorResponse> {
    try {
      const doc = this.repo.create(data);
      const saved = await this.repo.save(doc);
      return buildSuccessResponse(saved, '/documentos-persona');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, '/documentos-persona');
    }
  }

  async findByPersona(personaId: number): Promise<ApiResponse<DocumentoPersona[]> | ApiErrorResponse> {
    try {
      const docs = await this.repo.find({
        where: { persona_id: personaId },
        order: { createdAt: 'DESC' },
      });
      return buildSuccessResponse(docs, `/documentos-persona/persona/${personaId}`);
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/documentos-persona/persona/${personaId}`);
    }
  }

  async remove(id: number): Promise<ApiResponse<null> | ApiErrorResponse> {
    try {
      const doc = await this.repo.findOne({ where: { id } });
      if (!doc) {
        return buildErrorResponse('NOT_FOUND', 'Documento no encontrado', `/documentos-persona/${id}`);
      }
      await this.repo.remove(doc);
      return buildSuccessResponse(null, `/documentos-persona/${id}`, 'Documento eliminado');
    } catch (error) {
      return buildErrorResponse('INTERNAL_ERROR', error.message, `/documentos-persona/${id}`);
    }
  }
}
