// src/common/guards/jwt-payload.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtPayloadGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const payload = this.jwtService.verify(token, {
        secret: 'test',
      });

      

      // Aquí agregamos la info del usuario al request
      request.user = payload;

      return true;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
