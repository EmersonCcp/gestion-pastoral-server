import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMovimientoDto {
  @ApiProperty({
    example: 'Catequesis',
    description: 'Nombre del movimiento',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    example: 'Formación para sacramentos...',
    description: 'Descripción del movimiento',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la parroquia a la que pertenece (opcional)',
  })
  @IsInt()
  @IsOptional()
  parroquia_id?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado activo/inactivo del movimiento',
  })
  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
