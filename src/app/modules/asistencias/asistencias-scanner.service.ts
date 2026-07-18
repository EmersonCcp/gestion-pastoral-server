import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AsistenciasScannerService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async scanPlanilla(fileBuffer: Buffer, mimeType: string, alumnos: any[], fechasSugeridas: string[]) {
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const filePart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: mimeType,
      },
    };

    const prompt = `
Analiza la siguiente imagen de una planilla física de control de asistencias de catequesis.
Tu objetivo es extraer el estado de asistencia de cada alumno y mapearlo a la lista oficial que te proporciono.

Lista oficial de alumnos inscritos en este grupo (con su ID y nombre completo):
${JSON.stringify(alumnos, null, 2)}

Fechas sugeridas de reuniones en este período:
${JSON.stringify(fechasSugeridas, null, 2)}

Instrucciones de análisis:
1. Identifica las columnas de fechas en la cabecera de la tabla (usualmente tienen el formato dd/MM o dd, ordenadas cronológicamente por mes/año). Usa las fechas sugeridas como referencia para mapearlas al formato YYYY-MM-DD.
2. Identifica las filas de participantes. Cada fila tiene un número correlativo, el nombre del alumno y luego una celda para cada fecha.
3. Para cada combinación de alumno oficial (mapeando por nombre y apellido, tolerando ligeras variaciones ortográficas) y fecha detectada, determina el estado de asistencia:
   - Si la celda contiene una marca clara como "P" (o similar para Presente): "PRESENTE"
   - Si la celda contiene una marca clara como "A" (o similar para Ausente): "AUSENTE"
   - Si la celda contiene una marca clara como "J" (o similar para Justificado): "JUSTIFICADO"
   - Si la celda está vacía, contiene un punto o raya, pero hay registros de otros alumnos en esa columna (lo que indica que hubo clase ese día): "AUSENTE"
   - Si no hay marcas en toda la columna de esa fecha para ningún alumno (clase no dictada aún): "VACIO"
4. Identifica si hay nombres agregados a mano al final de la lista que no figuren en la lista oficial. Mapea sus asistencias de la misma forma, pero márcalos con persona_id = null y agrega su nombre detectado en un campo "nombre_detectado" para que el usuario pueda identificarlos.

Devuelve la respuesta estrictamente en formato JSON con la siguiente estructura:
{
  "fechas_detectadas": ["YYYY-MM-DD", ...],
  "asistencias": [
    {
      "persona_id": number | null,
      "nombre_detectado": string | null,
      "asistencias": {
        "YYYY-MM-DD": "PRESENTE" | "AUSENTE" | "JUSTIFICADO" | "VACIO",
        ...
      }
    },
    ...
  ]
}
`;

    const result = await model.generateContent([prompt, filePart]);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  }
}
