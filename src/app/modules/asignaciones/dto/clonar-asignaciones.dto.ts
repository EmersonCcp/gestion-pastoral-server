import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClonarAsignacionesDto {
  @ApiProperty({ example: 1, description: 'ID del período origen' })
  @IsInt()
  @IsNotEmpty()
  periodo_origen_id: number;

  @ApiProperty({ example: 2, description: 'ID del período destino' })
  @IsInt()
  @IsNotEmpty()
  periodo_destino_id: number;

  @ApiPropertyOptional({ example: true, description: 'Copiar también las personas asignadas' })
  @IsBoolean()
  @IsOptional()
  copiar_personas?: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID del movimiento al que pertenece el clonado',
  })
  @IsInt()
  @IsNotEmpty()
  movimiento_id: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del grupo a clonar' })
  @IsInt()
  @IsOptional()
  grupo_id?: number;

  @ApiPropertyOptional({ example: [1, 2], description: 'IDs de los grupos a clonar' })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  grupo_ids?: number[];

  @ApiPropertyOptional({ example: [1, 2], description: 'IDs de las personas a clonar' })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  persona_ids?: number[];
}
