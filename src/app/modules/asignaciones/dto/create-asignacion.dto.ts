import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAsignacionDto {
  @ApiProperty({ example: 1, description: 'ID del grupo' })
  @IsInt()
  @IsNotEmpty()
  grupo_id: number;

  @ApiProperty({ example: 1, description: 'ID del período' })
  @IsInt()
  @IsNotEmpty()
  periodo_id: number;

  @ApiPropertyOptional({ example: 1, description: 'ID del aula (opcional)' })
  @IsInt()
  @IsOptional()
  aula_id?: number;

  @ApiPropertyOptional({ example: 'SABADO', description: 'Día de reunión' })
  @IsString()
  @IsOptional()
  dia_reunion?: string;

  @ApiPropertyOptional({ example: 'QUINCENAL', description: 'Frecuencia de encuentro' })
  @IsString()
  @IsOptional()
  frecuencia?: string;

  @ApiPropertyOptional({ example: '09:00', description: 'Hora de inicio de la reunión' })
  @IsString()
  @IsOptional()
  hora_inicio?: string;

  @ApiPropertyOptional({ example: '11:00', description: 'Hora de fin de la reunión' })
  @IsString()
  @IsOptional()
  hora_fin?: string;

  @ApiProperty({ example: [1, 2, 3], description: 'IDs de personas a asignar' })
  @IsArray()
  @IsOptional()
  persona_ids?: number[];

  @ApiProperty({
    example: 1,
    description: 'ID del movimiento al que pertenece la asignación',
  })
  @IsInt()
  @IsNotEmpty()
  movimiento_id: number;
}
