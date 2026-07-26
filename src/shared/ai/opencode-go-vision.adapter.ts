import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiVisionAdapter, AiVisionResult } from './ai-vision.interface';

@Injectable()
export class OpenCodeGoVisionAdapter implements AiVisionAdapter {
  private apiKey: string;
  private model: string;
  private baseUrl = 'https://opencode.ai/zen/go/v1/chat/completions';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENCODE_GO_API_KEY') || '';
    this.model = this.configService.get<string>('OPENCODE_GO_VISION_MODEL') || 'mimo-v2.5';
  }

  async scan(buffer: Buffer, mimeType: string, prompt: string): Promise<AiVisionResult> {
    if (!this.apiKey) {
      throw new Error('OPENCODE_GO_API_KEY no configurada');
    }

    const base64Image = buffer.toString('base64');

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
      throw new Error(`OpenCode Go API error (${response.status}): ${errorBody}`);
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('OpenCode Go API returned empty response');
    }

    const parsed = this.parseJson(content);
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
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/([}\]])[\s\n]*([\[{])/g, '$1,$2')
      .replace(/(\d|"|true|false|null)[\s\n]+"/g, '$1,"')
      .replace(/"[\s\n]+"/g, '","')
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'");

    const obj = cleaned.match(/\{[\s\S]*\}/);
    if (obj) {
      try { return JSON.parse(obj[0]); } catch { /* fall through */ }
    }

    throw new Error(`JSON inválido de OpenCode Go: ${trimmed.slice(0, 200)}`);
  }
}
