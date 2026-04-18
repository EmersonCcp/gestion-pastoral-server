import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';

@Entity('parroquias')
export class Parroquia {
  @ApiProperty({
    description: 'ID único de la parroquia',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Nombre de la parroquia',
    example: 'Parroquia San Juan Bautista',
  })
  @Column()
  nombre: string;

  @ApiProperty({
    description: 'Dirección física de la parroquia',
    example: 'Calle Principal 123',
  })
  @Column({ nullable: true })
  direccion: string;

  @ApiProperty({
    description: 'Teléfono de contacto',
    example: '+123456789',
  })
  @Column({ nullable: true })
  telefono: string;

  @ApiProperty({
    description: 'Correo electrónico de contacto',
    example: 'contacto@parroquia.com',
  })
  @Column({ nullable: true })
  email: string;

  @ApiProperty({
    description: 'Descripción o historia de la parroquia',
    example: 'Fundada en 1950...',
  })
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @ApiProperty({
    description: 'Estado de la parroquia (activo/inactivo)',
    example: true,
  })
  @Column({ type: 'boolean', default: true })
  estado: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-08-15T12:34:56.000Z',
  })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2025-08-15T12:34:56.000Z',
  })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Movimiento, (m) => m.parroquia)
  movimientos: Movimiento[];
}
