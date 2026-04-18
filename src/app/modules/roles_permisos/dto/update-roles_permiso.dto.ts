import { PartialType } from '@nestjs/mapped-types';
import { CreateRolesPermisoDto } from './create-roles_permiso.dto';

export class UpdateRolesPermisoDto extends PartialType(CreateRolesPermisoDto) {}
