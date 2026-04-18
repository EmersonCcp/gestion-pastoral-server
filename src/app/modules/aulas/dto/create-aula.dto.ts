import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAulaDto {
  @ApiProperty({
    example: 'Salón San José',
    description: 'Nombre del aula',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    example: 30,
    description: 'Capacidad máxima de personas',
  })
  @IsInt()
  @IsOptional()
  capacidad?: number;

  @ApiPropertyOptional({
    example: 'Planta Alta',
    description: 'Ubicación física',
  })
  @IsString()
  @IsOptional()
  ubicacion?: string;

  @ApiProperty({
    example: 1,
    description: 'ID de la parroquia a la que pertenece',
  })
  @IsInt()
  @IsNotEmpty()
  parroquia_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID del movimiento al que pertenece el aula',
  })
  @IsInt()
  @IsNotEmpty()
  movimiento_id: number;
}
