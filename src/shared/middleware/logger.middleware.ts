import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl } = request;
    const datetime = new Date().toLocaleString();

    response.on('finish', () => {
      const { statusCode } = response;
      this.logger.log(
        `[${datetime}] ${method} ${originalUrl} ${statusCode}`,
      );
    });

    next();
  }
}
