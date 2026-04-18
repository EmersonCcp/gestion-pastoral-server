import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuariosRoleDto } from './create-usuarios_role.dto';

export class UpdateUsuariosRoleDto extends PartialType(CreateUsuariosRoleDto) {}
