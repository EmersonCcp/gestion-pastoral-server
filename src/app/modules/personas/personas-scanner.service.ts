import { Injectable } from '@nestjs/common';
import { AiVisionService } from 'src/shared/ai/ai-vision.service';

export interface NombreDetectado {
  nombre_completo: string;
  nombre: string;
  apellido: string;
}

@Injectable()
export class PersonasScannerService {
  constructor(private aiVision: AiVisionService) {}

  async scanLista(
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<{ nombres_detectados: NombreDetectado[] }> {
    const prompt = `Analiza la imagen. Es una lista de nombres de personas (planilla, listado manuscrito o impreso).

Extrae TODOS los nombres. Para cada uno separa nombre y apellido.
Si solo hay un nombre, apellido queda "".

Responde UNICAMENTE con este JSON (sin markdown, sin texto extra):
{"nombres_detectados":[{"nombre_completo":"Juan Perez","nombre":"Juan","apellido":"Perez"}]}`;

    const result = await this.aiVision.scan(fileBuffer, mimeType, prompt);
    const parsed = result.raw;

    const raw = Array.isArray(parsed?.nombres_detectados)
      ? parsed.nombres_detectados
      : Array.isArray(parsed)
        ? parsed
        : [];

    const nombres_detectados: NombreDetectado[] = raw
      .map((item: any) => this.normalize(item))
      .filter((item: NombreDetectado | null): item is NombreDetectado => item !== null);

    return { nombres_detectados };
  }

  private normalize(item: any): NombreDetectado | null {
    if (!item || typeof item !== 'object') return null;

    let nombreCompleto = String(item.nombre_completo || item.nombreCompleto || '').trim();
    let nombre = String(item.nombre || '').trim();
    let apellido = String(item.apellido || '').trim();

    if (!nombreCompleto && !nombre) return null;

    if (!nombreCompleto) {
      nombreCompleto = `${nombre} ${apellido}`.trim();
    }

    if (!nombre && nombreCompleto) {
      const parts = nombreCompleto.split(/\s+/);
      nombre = parts[0] || '';
      apellido = parts.slice(1).join(' ');
    }

    return { nombre_completo: nombreCompleto, nombre, apellido };
  }
}
