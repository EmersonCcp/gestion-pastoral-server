import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsDateString,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePeriodoDto {
  @ApiProperty({
    example: 'Ciclo 2024',
    description: 'Nombre del periodo',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: '2024-01-01',
    description: 'Fecha de inicio del periodo',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha_inicio: string;

  @ApiProperty({
    example: '2024-12-31',
    description: 'Fecha de fin del periodo',
  })
  @IsDateString()
  @IsNotEmpty()
  fecha_fin: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado activo del periodo',
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiProperty({
    example: 1,
    description: 'ID del movimiento al que pertenece el periodo',
  })
  @IsInt()
  @IsNotEmpty()
  movimiento_id: number;
}
