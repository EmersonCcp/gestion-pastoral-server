import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
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
}
