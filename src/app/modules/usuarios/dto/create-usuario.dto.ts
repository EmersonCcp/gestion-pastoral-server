import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsInt,
  IsNotEmpty,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'usuario@correo.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'contraseña_encriptada',
    description: 'Contraseña encriptada del usuario',
  })
  @IsString()
  password_encrypted: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
  })
  @IsString()
  nombre_completo: string;

  @ApiProperty({
    example: 1,
    description: 'ID del rol que se le va a asignar al usuario en su creación',
  })
  @IsInt()
  @IsNotEmpty()
  rol_id: number;

  @ApiPropertyOptional({
    example: [1, 2],
    description: 'IDs de los movimientos a los que tendrá acceso',
    type: [Number],
  })
  @IsArray()
  @IsOptional()
  movimiento_ids?: number[];

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si es super usuario',
  })
  @IsBoolean()
  @IsOptional()
  is_super_user: boolean = false;

  @ApiPropertyOptional({
    example: true,
    description: 'Estado activo/inactivo del usuario',
  })
  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la parroquia a la que pertenece el usuario',
  })
  @IsInt()
  @IsOptional()
  parroquia_id?: number;
}
