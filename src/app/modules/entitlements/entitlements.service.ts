import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { UsuarioRol } from 'src/app/modules/usuarios_roles/entities/usuarios_role.entity';
import { RolPermiso } from 'src/app/modules/roles_permisos/entities/roles_permiso.entity';

export type Grant = { key: string; own?: boolean };
const toKey = (s: string, a: string) => `${s}.${a}`;

@Injectable()
export class EntitlementsService {
  constructor(
    @InjectRepository(UsuarioRol) private urRepo: Repository<UsuarioRol>,
    @InjectRepository(RolPermiso) private rpRepo: Repository<RolPermiso>,
    @Inject(CACHE_MANAGER) public cache: Cache,
  ) {}

  async getUserPermissionKeys(userId: number): Promise<Set<string>> {
    const cacheKey = `perms:${userId}`;
    const cached = await this.cache.get<string[]>(cacheKey);
    if (cached) return new Set(cached);
    // roles vigentes
    const urs = await this.urRepo.find({
      where: { usuario: { id: Number(userId) } },
      relations: ['rol'],
    });

    const roleIds = urs
      .filter((ur) => ur.rol?.estado)
      .map((ur) => ur.rol.id);

    if (roleIds.length === 0) return new Set();

    const rps = await this.rpRepo.find({
      where: { rol: { id: In(roleIds) } },
      relations: ['permiso'],
    });

    const keys = rps.map(
      (rp) => `${rp.permiso.sujeto}.${rp.permiso.accion}`,
    );

    await this.cache.set(cacheKey, keys, 60); // TTL 60s
    return new Set(keys);
  }

  async getUserGrants(userId: string): Promise<Grant[]> {
    const cacheKey = `perms:${userId}:v1`;
    const cached = await this.cache.get<Grant[]>(cacheKey);
    if (cached) return cached;
    const now = new Date();
    const urs = await this.urRepo.find({
      where: { usuario: { id: Number(userId) } },
      relations: ['rol'],
    });
    const roleIds = urs
      .filter((ur) => ur.rol?.estado)
      .map((ur) => ur.rol.id);
    if (!roleIds.length) return [];
    const rps = await this.rpRepo.find({
      where: { rol: { id: In(roleIds) } },
      relations: ['permiso'],
    });
    const grants = rps.map((rp) => ({
      key: toKey(rp.permiso.sujeto, rp.permiso.accion),
      // own: !!rp.permiso.perm_condiciones?.own,
    }));
    await this.cache.set(cacheKey, grants, 60);
    return grants;
  }

  async invalidateUser(userId: string) {
    await this.cache.del(`perms:${userId}`);
    await this.cache.del(`perms:${userId}:v1`);
  }

  async clearAllCache() {
    await this.cache.clear();
  }
}