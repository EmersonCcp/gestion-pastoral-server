import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiVisionAdapter } from './gemini-vision.adapter';
import { OpenCodeGoVisionAdapter } from './opencode-go-vision.adapter';
import { AiVisionAdapter, AiVisionResult } from './ai-vision.interface';

function isQuotaError(error: unknown): boolean {
  const msg =
    error instanceof Error ? error.message : String(error);
  return (
    msg.includes('429') ||
    msg.toLowerCase().includes('quota') ||
    msg.toLowerCase().includes('rate limit') ||
    msg.toLowerCase().includes('too many requests') ||
    msg.includes('OPENCODE_GO_API_KEY no configurada') ||
    msg.includes('GEMINI_API_KEY no configurada')
  );
}

@Injectable()
export class AiVisionService implements AiVisionAdapter {
  constructor(
    private gemini: GeminiVisionAdapter,
    private opencodeGo: OpenCodeGoVisionAdapter,
    private configService: ConfigService,
  ) {}

  async scan(buffer: Buffer, mimeType: string, prompt: string): Promise<AiVisionResult> {
    const primary = this.pickPrimary();
    const fallback = this.pickFallback();

    try {
      return await primary.scan(buffer, mimeType, prompt);
    } catch (primaryError) {
      if (!isQuotaError(primaryError) || !fallback) {
        throw primaryError;
      }

      try {
        return await fallback.scan(buffer, mimeType, prompt);
      } catch (fallbackError) {
        if (isQuotaError(fallbackError)) {
          throw new Error(
            'Ambos proveedores agotados. Gemini: cuota excedida. Go: sin API key o cuota agotada.',
          );
        }
        throw fallbackError;
      }
    }
  }

  private pickPrimary(): AiVisionAdapter {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) return this.gemini;
    return this.opencodeGo;
  }

  private pickFallback(): AiVisionAdapter | null {
    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    const goKey = this.configService.get<string>('OPENCODE_GO_API_KEY');

    if (geminiKey && goKey) return this.opencodeGo;
    if (goKey && !geminiKey) return this.gemini;
    return null;
  }
}
