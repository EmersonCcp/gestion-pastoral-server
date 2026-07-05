import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DataSource } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly dataSource: DataSource) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'tangamandapio',
    });
  }

  async validate(payload: any) {
    const user = await this.dataSource.getRepository(Usuario).findOne({
      where: { id: payload.id },
      relations: ['grupos'],
    });

    const grupoIds = (user?.grupos || []).map((g) => g.id);
    const isSuperAdmin = user?.is_super_user || false;

    return {
      userId: payload.id,
      email: payload.email,
      rol: payload.rol,
      isSuperAdmin,
      grupoIds,
    };
  }
}
