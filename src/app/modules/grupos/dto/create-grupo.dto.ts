import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGrupoDto {
  @ApiProperty({
    example: 'Confirmación 1',
    description: 'Nombre del grupo',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiPropertyOptional({
    example: 'Grupo de primer año de confirmación',
    description: 'Descripción del grupo',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del movimiento al que pertenece el grupo',
  })
  @IsInt()
  @IsNotEmpty()
  movimiento_id: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID del grupo padre (para subgrupos)',
  })
  @IsInt()
  @IsOptional()
  parent_id?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado activo/inactivo del grupo',
  })
  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'IDs de los libros asignados al grupo',
    type: [Number]
  })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  libro_ids?: number[];
}
