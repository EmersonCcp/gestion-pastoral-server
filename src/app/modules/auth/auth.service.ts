import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Rol } from '../roles/entities/role.entity';
import { UsuarioRol } from '../usuarios_roles/entities/usuarios_role.entity';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { ApiErrorResponse, ApiResponse } from 'src/shared/types/response.types';
import { buildApiErrorResponse } from 'src/shared/http/api-response.util';
import { Movimiento } from '../movimientos/entities/movimiento.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuariosService,
    private readonly jwtService: JwtService,
    private entitlementsService: EntitlementsService,
    @InjectRepository(UsuarioSesion)
    private userSessRepo: Repository<UsuarioSesion>,
    @InjectRepository(UsuarioRol)
    private usuarioRolRepo: Repository<UsuarioRol>,
    @InjectRepository(Rol)
    private rolRepo: Repository<Rol>,
    @InjectRepository(Movimiento)
    private movimientoRepo: Repository<Movimiento>,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usuarioService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password_encrypted))) {
      const { password_encrypted, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    loginDto: any,
  ): Promise<
    | ApiResponse<{ accessToken: string; expiresIn: number; usuario: any }>
    | ApiErrorResponse
  > {
    try {
      const { email, password } = loginDto;


      const user = await this.usuarioService.findByEmail(email!);

      const usuarioRol = await this.usuarioRolRepo.findOne({
        where: {
          usuario: { id: user?.id },
        },
        relations: {
          rol: true,
          usuario: true,
        },
      });

      const rol = await this.rolRepo.findOneBy({
        id: usuarioRol?.rol.id,
      });

      if (!user) {
        return buildApiErrorResponse(
          'USER_NOT_FOUND',
          `El user ${email} no existe.`,
        );
      }

      const permissionsSet: Set<string> =
        await this.entitlementsService.getUserPermissionKeys(user.id);

      const permissions = Array.from(permissionsSet);

      const grants = await this.entitlementsService.getUserGrants(
        user.id.toString(),
      );

      if (!user) {
        return {
          ok: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Credenciales inválidas',
          },
          meta: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            path: '/auth/login',
            version: 'v1',
          },
        };
      }

      const matched = await bcrypt.compare(password, user.password_encrypted);
      if (!matched) {
        return {
          ok: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Credenciales inválidas',
          },
          meta: {
            requestId: uuidv4(),
            timestamp: new Date().toISOString(),
            path: '/auth/login',
            version: 'v1',
          },
        };
      }

      const sessionId = uuidv4();

      const payload = {
        id: user.id,
        email: user.email,
        rol: rol?.nombre,
        nombre: user.nombre_completo,
        isSuperAdmin: user.is_super_user,
      };

      const token = this.jwtService.sign(payload, {
        jwtid: sessionId,
        // expiresIn: '7d',
        secret: 'tangamandapio',
      });

      const decoded: any = this.jwtService.decode(token);

      const expires_at: Date = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const userSession: any = {
        usuario: user,
        token: sessionId,
        tipo: 'access',
        estado: true,
      };

      await this.userSessRepo.save(userSession);

      return {
        ok: true,
        data: {
          accessToken: token,
          expiresIn: decoded?.exp ?? null,
          usuario: {
            id: user.id,
            email: user.email,
            rol: rol?.nombre,
            nombre: user.nombre_completo,
            isSuperAdmin: user.is_super_user,
            permissions: permissions,
            grants: grants,
            parroquia: user.parroquia?.nombre || (user.is_super_user ? 'Super Admin' : 'Sin Parroquia'),
            movimientos: user.is_super_user 
              ? await this.movimientoRepo.find() 
              : (user.usuarioMovimientos || []).map(um => um.movimiento).filter(Boolean),
          },
        },
        meta: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          path: '/auth/login',
          version: 'v1',
        },
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          code: 'LOGIN_FAILED',
          message: `Error al iniciar sesión: ${error.message}`,
        },
        meta: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          path: '/auth/login',
          version: 'v1',
        },
      };
    }
  }

  private generateToken(usuario: any) {
    const payload = {
      usu_username: usuario.usu_username,
      usu_codigo: usuario.usu_codigo,
      usu_roles: usuario.usu_roles,
    };
    return {
      ok: true,
      usuario,
      message: 'Login successful',
      token: this.jwtService.sign(payload),
    };
  }

  async changePassword(userId: number, newPassword: string) {
    try {
      const usuarioRes: any = await this.usuarioService.findOne(userId);
      if (!usuarioRes || !usuarioRes.ok) {
        return { ok: false, message: 'Usuario no encontrado' };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updateResult: any = await this.usuarioService.update(userId, {
        password_encrypted: hashedPassword
      } as any);

      if (!updateResult || !updateResult.ok) {
        return {
          ok: false,
          data: updateResult,
          message: 'Error al actualizar contraseña',
        };
      }

      return { ok: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      return { ok: false, message: 'Error interno del servidor' };
    }
  }

  async validateUserById(userId: number) {
    return this.usuarioService.findOne(Number(userId));
  }

  async register(dto: CreateUsuarioDto) {
    try {


      const hashedPassword = await bcrypt.hash(dto.password_encrypted, 10);
      const user = await this.usuarioService.create({
        ...dto,
        password_encrypted: hashedPassword,
        is_super_user: false
      });
      return user;
    } catch (error) {
      return error;
    }
  }

  async getProfile(userId: number): Promise<ApiResponse<any> | ApiErrorResponse> {
    try {
      const user = await this.usuarioService.findOne(userId);
      if (!user || !(user as any).ok) {
        return buildApiErrorResponse('USER_NOT_FOUND', 'Usuario no encontrado');
      }

      const usuario = (user as any).data;

      const usuarioRol = await this.usuarioRolRepo.findOne({
        where: { usuario: { id: userId } },
        relations: { rol: true },
      });

      const permissionsSet = await this.entitlementsService.getUserPermissionKeys(userId);
      const grants = await this.entitlementsService.getUserGrants(userId.toString());

      const payload = {
        id: usuario.id,
        email: usuario.email,
        rol: usuarioRol?.rol?.nombre || 'Sin Rol',
        nombre: usuario.nombre_completo,
        isSuperAdmin: usuario.is_super_user,
      };

      const token = this.jwtService.sign(payload, {
        secret: 'tangamandapio',
      });

      return {
        ok: true,
        data: {
          accessToken: token,
          id: usuario.id,
          email: usuario.email,
          rol: usuarioRol?.rol?.nombre || 'Sin Rol',
          nombre: usuario.nombre_completo,
          isSuperAdmin: usuario.is_super_user,
          permissions: Array.from(permissionsSet),
          grants: grants,
          parroquia: usuario.parroquia?.nombre || (usuario.is_super_user ? 'Super Admin' : 'Sin Parroquia'),
          movimientos: usuario.is_super_user 
            ? await this.movimientoRepo.find() 
            : (usuario.usuarioMovimientos || []).map(um => um.movimiento).filter(Boolean),
        },
        meta: {
          requestId: uuidv4(),
          timestamp: new Date().toISOString(),
          path: '/auth/profile',
          version: 'v1',
        },
      };
    } catch (error) {
      return buildApiErrorResponse('INTERNAL_ERROR', error.message);
    }
  }

  async logout(token: string) {
    try {
      const decoded: any = this.jwtService.decode(token);

      if (!decoded?.jti) {
        return {
          ok: false,
          message: 'Token inválido',
        };
      }

      const sessionId = decoded.jti;

      const session = await this.userSessRepo.findOne({
        where: { token: sessionId },
      });

      if (!session) {
        return {
          ok: false,
          message: 'Sesión no encontrada',
        };
      }

      session.revokedAt = new Date();
      session.estado = false; // o false si cambias a boolean

      await this.userSessRepo.save(session);

      return {
        ok: true,
        message: 'Sesión cerrada correctamente',
      };
    } catch (error) {
      return {
        ok: false,
        message: 'Error al cerrar sesión',
      };
    }
  }
}
