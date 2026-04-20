import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesarrolloClaseService } from './desarrollo-clase.service';
import { DesarrolloClaseController } from './desarrollo-clase.controller';
import { DesarrolloClase } from './entities/desarrollo-clase.entity';
import { LibrosModule } from '../libros/libros.module';
import { AsistenciasModule } from '../asistencias/asistencias.module';
import { GruposModule } from '../grupos/grupos.module';
import { Grupo } from '../grupos/entities/grupo.entity';
import { AsistenciaPersona } from '../asistencias/entities/asistencia-persona.entity';
import { Asistencia } from '../asistencias/entities/asistencia.entity';
import { Tema } from '../libros/entities/tema.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DesarrolloClase, 
      Grupo, 
      Tema, 
      Asistencia, 
      AsistenciaPersona
    ]),
    LibrosModule,
    AsistenciasModule,
    GruposModule,
  ],
  controllers: [DesarrolloClaseController],
  providers: [DesarrolloClaseService,],
})
export class DesarrolloClaseModule {}
