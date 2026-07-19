export interface AiVisionResult {
  raw: any;
}

export interface AiVisionAdapter {
  scan(buffer: Buffer, mimeType: string, prompt: string): Promise<AiVisionResult>;
}
