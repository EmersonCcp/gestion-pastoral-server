import { PartialType } from '@nestjs/swagger';
import { CreateParroquiaDto } from './create-parroquia.dto';

export class UpdateParroquiaDto extends PartialType(CreateParroquiaDto) {}
