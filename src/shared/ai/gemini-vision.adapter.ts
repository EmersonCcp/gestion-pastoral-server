import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiVisionAdapter, AiVisionResult } from './ai-vision.interface';

@Injectable()
export class GeminiVisionAdapter implements AiVisionAdapter {
  private genAI: GoogleGenerativeAI;
  private modelName: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
    this.modelName = this.configService.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash';
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async scan(buffer: Buffer, mimeType: string, prompt: string): Promise<AiVisionResult> {
    if (!this.genAI.apiKey) {
      throw new Error('GEMINI_API_KEY no configurada');
    }

    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    });

    const filePart = {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, filePart]);
    const text = result.response.text();
    const parsed = this.parseJson(text);

    return { raw: parsed };
  }

  private parseJson(content: string): any {
    const trimmed = content.trim();
    try { return JSON.parse(trimmed); } catch { /* fall through */ }

    const md = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (md) {
      try { return JSON.parse(md[1].trim()); } catch { /* fall through */ }
    }

    const cleaned = trimmed
      .replace(/,\s*([}\]])/g, '$1')                 // trailing commas
      .replace(/([}\]])[\s\n]*([\[{])/g, '$1,$2')    // missing comma between adjacent []/{}
      .replace(/(\d|"|true|false|null)[\s\n]+"/g, '$1,"')  // missing comma between value and key
      .replace(/"[\s\n]+"/g, '","')                   // missing comma between adjacent strings
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");

    const obj = cleaned.match(/\{[\s\S]*\}/);
    if (obj) {
      try { return JSON.parse(obj[0]); } catch { /* fall through */ }
    }

    throw new Error(`JSON inválido de Gemini: ${trimmed.slice(0, 200)}`);
  }
}
