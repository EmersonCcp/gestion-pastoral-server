import { Injectable } from '@nestjs/common';
import { AiVisionService } from 'src/shared/ai/ai-vision.service';

@Injectable()
export class AsistenciasScannerService {
  constructor(private aiVision: AiVisionService) {}

  async scanPlanilla(
    fileBuffer: Buffer,
    mimeType: string,
    alumnos: { id: number; nombre: string; apellido: string }[],
    fechasSugeridas: string[],
  ) {
    const prompt = `Analiza la siguiente imagen de una planilla fisica de control de asistencias de catequesis.
Tu objetivo es extraer el estado de asistencia de cada alumno y mapearlo a la lista oficial que te proporciono.

Lista oficial de alumnos inscritos en este grupo (con su ID y nombre completo):
${JSON.stringify(alumnos, null, 2)}

Fechas sugeridas de reuniones en este periodo:
${JSON.stringify(fechasSugeridas, null, 2)}

Instrucciones de analisis:
1. Identifica las columnas de fechas en la cabecera de la tabla. Usa las fechas sugeridas como referencia para mapearlas al formato YYYY-MM-DD.
2. Identifica las filas de participantes. Cada fila tiene un numero correlativo, el nombre del alumno y luego una celda para cada fecha.
3. Para cada combinacion de alumno oficial (mapeando por nombre y apellido, tolerando ligeras variaciones ortograficas) y fecha detectada, determina el estado de asistencia:
   - "P" o marca similar: "PRESENTE"
   - "A" o marca similar: "AUSENTE"
   - "J" o marca similar: "JUSTIFICADO"
   - Celda vacia con otros alumnos marcados en esa columna: "AUSENTE"
   - Sin marcas en toda la columna: "VACIO"
4. Identifica nombres agregados a mano al final que no figuren en la lista oficial. Marcalos con persona_id = null y agrega su nombre detectado en "nombre_detectado".

Responde SOLO con este JSON (sin markdown, sin texto extra):
{"fechas_detectadas":["YYYY-MM-DD"],"asistencias":[{"persona_id":1,"nombre_detectado":null,"asistencias":{"YYYY-MM-DD":"PRESENTE"}}]}`;

    const result = await this.aiVision.scan(fileBuffer, mimeType, prompt);
    return result.raw;
  }
}
