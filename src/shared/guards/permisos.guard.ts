import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { EntitlementsService } from 'src/app/modules/entitlements/entitlements.service';
import { log } from 'util';
const esc = (s: string) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
const wildcardToRegex = (pattern: string) =>
  new RegExp(
    '^' +
      pattern
        .split('.')
        .map((seg) => (seg === '**' ? '.*' : seg === '*' ? '[^.]+' : esc(seg)))
        .join('\\.') +
      '$',
  );
const covers = (granted: string, required: string) =>
  wildcardToRegex(granted).test(required);

@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private entl: EntitlementsService,
  ) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<(string | string[])[]>(
      PERMISSIONS_KEY as any,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!required?.length) return true;

    const req = ctx.switchToHttp().getRequest();

    const data = req.user;


    // 🔐 Usuario no autenticado
    if (!data) return false;

    // 👑 Super admin → acceso total
    if (data.isSuperAdmin) return true;

    if (!data) return false;

    // 🧩 Permisos otorgados
    const granted = await this.entl.getUserPermissionKeys(data.userId);


    return required.every((group) => {
      const needs = Array.isArray(group) ? group : [group];
      return needs.some((need) => [...granted].some((g) => covers(g, need)));
    });
  }
}