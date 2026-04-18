import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTipoPersonaDto {
  @ApiProperty({
    example: 'ALUMNO',
    description: 'Nombre del tipo de persona',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    example: 'Persona que recibe formación',
    description: 'Descripción del tipo de persona',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del movimiento al que pertenece el tipo de persona',
  })
  @IsInt()
  @IsNotEmpty()
  movimiento_id: number;
}
