import {
  IsInt,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoParentesco } from '../entities/persona-relacion.entity';

export class CreatePersonaRelacionDto {
  @ApiProperty({ description: 'ID de la persona principal (ej: alumno)' })
  @IsInt()
  @IsNotEmpty()
  persona_id: number;

  @ApiProperty({ description: 'ID del pariente (ej: padre)' })
  @IsInt()
  @IsNotEmpty()
  pariente_id: number;

  @ApiProperty({ enum: TipoParentesco })
  @IsEnum(TipoParentesco)
  parentesco: TipoParentesco;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  es_contacto_emergencia?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  es_responsable_legal?: boolean;
}

export class UpdatePersonaRelacionDto {
  @ApiPropertyOptional({ enum: TipoParentesco })
  @IsEnum(TipoParentesco)
  @IsOptional()
  parentesco?: TipoParentesco;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  es_contacto_emergencia?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  es_responsable_legal?: boolean;
}
