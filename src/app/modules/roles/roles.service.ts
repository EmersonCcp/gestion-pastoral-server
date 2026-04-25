import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { BaseService } from 'src/shared/services/base-service.service';
import { Rol } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ApiErrorResponse, ApiResponse } from 'src/shared/types/response.types';
import { RolPermiso } from '../roles_permisos/entities/roles_permiso.entity';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class RolesService extends BaseService<Rol> {
  constructor(
    @InjectRepository(Rol)
    public repo: Repository<Rol>,
    private ents: EntitlementsService,
    private socket: SocketGateway,
    dataSource: DataSource,
  ) {
    super(repo, dataSource);
  }

  async createWithPermissions(
    dto: any,
    path: string,
    version = 'v1',
  ): Promise<ApiResponse<Rol> | ApiErrorResponse> {
    return this.dataSource.transaction(async (manager) => {
      try {
        // 1️⃣ Crear el rol
        const rol = manager.create(Rol, {
          nombre: dto.nombre,
          descripcion: dto.descripcion,
          estado: dto.estado ?? true,
        });

        await manager.save(rol);

        // 2️⃣ Guardar la tabla pivote role_permissions
        if (dto.permisos?.length) {
          const relations = dto.permisos.map((pid) =>
            manager.create(RolPermiso, {
              rol: { id: rol.id },
              permiso: { id: pid },
            }),
          );

          await manager.save(relations);
        }

        // 3️⃣ Traer el rol completo con sus permisos
        const fullRole = await manager.findOne(Rol, {
          where: { id: rol.id },
          relations: { rolPermisos: { permiso: true } },
        });

        await this.ents.clearAllCache();
        this.socket.notifyPermissionsUpdate();

        return this.buildSuccessResponse(fullRole, path, version);
      } catch (error) {
        return this.buildErrorResponse(
          'CREATE_ROLE_FAILED',
          error.message,
          path,
          version,
        );
      }
    });
  }

  async updateWithPermissions(
    id: number,
    dto: any,
    path: string,
    version = 'v1',
  ): Promise<ApiResponse<Rol> | ApiErrorResponse> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        // 1️⃣ Verificar que exista el rol con permisos actuales
        const existing = await manager.findOne(Rol, {
          where: { id },
          relations: { rolPermisos: { permiso: true } },
        });

        if (!existing) {
          throw new Error('Role not found');
        }

        // 2️⃣ Actualizar datos del rol
        await manager.update(Rol, id, {
          nombre: dto.nombre ?? existing.nombre,
          descripcion: dto.descripcion ?? existing.descripcion,
          estado: dto.estado ?? existing.estado,
        });

        // 3️⃣ Obtener IDs actuales y nuevos
        const currentIds = existing.rolPermisos.map((rp) => rp.permiso.id);

        const newIds: number[] = dto.permisos || [];

        // 4️⃣ Calcular diferencias
        const toDelete = currentIds.filter((id) => !newIds.includes(id));

        const toInsert = newIds.filter((id) => !currentIds.includes(id));

        // 5️⃣ Eliminar solo los que ya no están
        if (toDelete.length > 0) {
          await manager
            .createQueryBuilder()
            .delete()
            .from(RolPermiso)
            .where('rol_id = :rolId', { rolId: id })
            .andWhere('permiso_id IN (:...toDelete)', { toDelete })
            .execute();
        }

        // 6️⃣ Insertar solo los nuevos
        if (toInsert.length > 0) {
          const relations = toInsert.map((pid) =>
            manager.create(RolPermiso, {
              rol: { id },
              permiso: { id: pid },
            }),
          );

          await manager.save(relations);
        }

        // 7️⃣ Obtener resultado final
        const updated = await manager.findOne(Rol, {
          where: { id },
          relations: { rolPermisos: { permiso: true } },
        });

        await this.ents.clearAllCache();
        this.socket.notifyPermissionsUpdate();

        return this.buildSuccessResponse(updated, path, version);
      });
    } catch (error) {
      return this.buildErrorResponse(
        'UPDATE_ROLE_FAILED',
        error.message,
        path,
        version,
      );
    }
  }

  async removeData(
    id: number,
    path: string = '/roles/:id',
    version = 'v1',
  ): Promise<ApiResponse<any> | ApiErrorResponse> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const rol = await manager.findOne(Rol, {
          where: { id },
          relations: { usuarioRoles: true },
        });

        if (!rol) {
          throw new Error('Role not found');
        }

        // 🚫 Validación clave
        if (rol.usuarioRoles.length > 0) {
          throw new Error(
            'No se puede eliminar el rol porque tiene usuarios asociados',
          );
        }

        await manager.delete(Rol, id);

        await this.ents.clearAllCache();
        this.socket.notifyPermissionsUpdate();

        return this.buildSuccessResponse(null, path, version);
      });
    } catch (error) {
      return this.buildErrorResponse(
        'DELETE_ROLE_FAILED',
        error.message,
        path,
        version,
      );
    }
  }
}
