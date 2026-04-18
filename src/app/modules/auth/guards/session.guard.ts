import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { UsuarioSesion } from "../../usuarios_sesiones/entities/usuarios_sesione.entity";
import { JwtService } from "@nestjs/jwt";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @InjectRepository(UsuarioSesion)
    private userSessRepo: Repository<UsuarioSesion>,
    private jwtService: JwtService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    const token = authHeader?.split(' ')[1];
    if (!token) return false;

    const decoded: any = this.jwtService.decode(token);
    if (!decoded?.jti) return false;

    const session = await this.userSessRepo.findOne({
      where: { token: decoded.jti },
    });

    if (!session) return false;
    if (session.revokedAt) return false;
    if (session.estado === false) return false;

    return true;
  }
}