// write guard logic
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

// write the IS_PUBLIC_KEY constant here meanwhile
const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | import('rxjs').Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true; // Skip JWT validation for public routes
    }

    return super.canActivate(context);
  }
  
  handleRequest(err: any, user: any, info: any) {

    if (err || !user) {
      // throw err || new Error('Unauthorized');
      return {
        ok: false,
        message: 'Sin autorizacion',
      };
    }
    return user;
  }
  // Optionally, you can override the handleRequest method to customize error handling
  // handleRequest(err: any, user: any, info: any) {
}