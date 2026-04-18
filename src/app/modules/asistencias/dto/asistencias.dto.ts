import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoAsistencia } from '../entities/asistencia-persona.entity';

export class AsistenciaPersonaDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  persona_id: number;

  @ApiProperty({ enum: EstadoAsistencia, example: EstadoAsistencia.PRESENTE })
  @IsEnum(EstadoAsistencia)
  @IsNotEmpty()
  estado: EstadoAsistencia;

  @ApiPropertyOptional({ example: 'Justificación médica' })
  @IsString()
  @IsOptional()
  observacion?: string;
}

export class CreateAsistenciaDto {
  @ApiProperty({ example: '2026-03-28' })
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @ApiPropertyOptional({ example: 'Reunión ordinaria' })
  @IsString()
  @IsOptional()
  observacion?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  grupo_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  periodo_id: number;

  @ApiProperty({ type: [AsistenciaPersonaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AsistenciaPersonaDto)
  persona_estados: AsistenciaPersonaDto[];

  @ApiProperty({
    example: 1,
    description: 'ID del movimiento al que pertenece la asistencia',
  })
  @IsNumber()
  @IsNotEmpty()
  movimiento_id: number;
}

export class UpdateAsistenciaDto {
  @ApiPropertyOptional({ example: '2026-03-28' })
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @ApiPropertyOptional({ example: 'Reunión ordinaria editada' })
  @IsString()
  @IsOptional()
  observacion?: string;

  @ApiPropertyOptional({ type: [AsistenciaPersonaDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AsistenciaPersonaDto)
  persona_estados?: AsistenciaPersonaDto[];
}
