import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'tangamandapio',
    });
  }

  async validate(payload: any) {
    
    return { userId: payload.id, email: payload.email, rol: payload.rol, isSuperAdmin: payload.isSuperAdmin,sede_id: payload.sede_id };
  }
}
