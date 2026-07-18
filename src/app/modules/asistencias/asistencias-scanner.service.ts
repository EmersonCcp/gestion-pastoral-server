import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GoChoice {
  message: { content?: string };
}

@Injectable()
export class AsistenciasScannerService {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://opencode.ai/zen/go/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENCODE_GO_API_KEY') || '';
    this.model =
      this.configService.get<string>('OPENCODE_GO_MODEL') || 'kimi-k2.7-code';
  }

  async scanPlanilla(
    fileBuffer: Buffer,
    mimeType: string,
    alumnos: { id: number; nombre: string; apellido: string }[],
    fechasSugeridas: string[],
  ) {
    const base64Image = fileBuffer.toString('base64');

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

Devuelve SOLO UN JSON VÁLIDO, sin markdown, sin explicaciones, sin bloques de código. Usa estrictamente esta estructura:
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

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64Image}` },
              },
            ],
          },
        ],
        max_tokens: 8192,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OpenCode Go API error (${response.status}): ${errorBody}`,
      );
    }

    const data = (await response.json()) as {
      choices?: GoChoice[];
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('OpenCode Go API returned empty response');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.extractJson(content);
  }

  /* eslint-disable @typescript-eslint/no-unsafe-return */
  private extractJson(content: string) {
    const trimmed = content.trim();

    const markdownMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      return JSON.parse(markdownMatch[1].trim());
    }

    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    return JSON.parse(trimmed);
  }
  /* eslint-enable @typescript-eslint/no-unsafe-return */
}
