import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParroquiaDto {
  @ApiProperty({
    example: 'Parroquia San Juan Bautista',
    description: 'Nombre de la parroquia',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    example: 'Calle Principal 123',
    description: 'Dirección física de la parroquia',
  })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({
    example: '+123456789',
    description: 'Teléfono de contacto',
  })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiPropertyOptional({
    example: 'contacto@parroquia.com',
    description: 'Correo electrónico de contacto',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'Fundada en 1950...',
    description: 'Descripción o historia de la parroquia',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado activo/inactivo de la parroquia',
  })
  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}
