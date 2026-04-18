import { PartialType } from '@nestjs/swagger';
import { CreateTipoPersonaDto } from './create-tipo-persona.dto';

export class UpdateTipoPersonaDto extends PartialType(CreateTipoPersonaDto) {}
