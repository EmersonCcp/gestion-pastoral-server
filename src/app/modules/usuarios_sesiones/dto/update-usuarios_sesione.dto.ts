import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuariosSesioneDto } from './create-usuarios_sesione.dto';

export class UpdateUsuariosSesioneDto extends PartialType(CreateUsuariosSesioneDto) {}
