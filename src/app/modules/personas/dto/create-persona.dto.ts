import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsInt,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePersonaDto {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre de la persona',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido de la persona',
  })
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiPropertyOptional({
    example: '12345678',
    description: 'Documento de identidad',
  })
  @IsString()
  @IsOptional()
  documento?: string;

  @ApiPropertyOptional({
    example: 'juan.perez@example.com',
    description: 'Correo electrónico',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: '+123456789',
    description: 'Número de teléfono',
  })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    example: 'Calle Falsa 123',
    description: 'Dirección física',
  })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({
    example: 'MASCULINO',
    description: 'Género de la persona',
  })
  @IsString()
  @IsOptional()
  genero?: string;

  @ApiPropertyOptional({
    example: '1990-05-15',
    description: 'Fecha de nacimiento',
  })
  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: string;

  @ApiProperty({
    example: [1, 2],
    description: 'IDs de los tipos de persona asignados',
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty()
  tipos_personas_ids: number[];

  @ApiProperty({
    example: 1,
    description: 'ID del movimiento al que pertenece la persona',
  })
  @IsInt()
  @IsNotEmpty()
  movimiento_id: number;
}
