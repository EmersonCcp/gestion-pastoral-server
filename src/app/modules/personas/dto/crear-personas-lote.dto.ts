import { IsInt, IsNotEmpty, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PersonaLoteItemDto {
  @ApiProperty({ example: 'Juan' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  @IsNotEmpty()
  apellido: string;
}

export class CrearPersonasLoteDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  movimiento_id: number;

  @ApiProperty({ type: [PersonaLoteItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonaLoteItemDto)
  personas: PersonaLoteItemDto[];
}
