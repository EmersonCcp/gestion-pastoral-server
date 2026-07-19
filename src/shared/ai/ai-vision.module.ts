import { Global, Module } from '@nestjs/common';
import { GeminiVisionAdapter } from './gemini-vision.adapter';
import { OpenCodeGoVisionAdapter } from './opencode-go-vision.adapter';
import { AiVisionService } from './ai-vision.service';

@Global()
@Module({
  providers: [GeminiVisionAdapter, OpenCodeGoVisionAdapter, AiVisionService],
  exports: [AiVisionService],
})
export class AiVisionModule {}
