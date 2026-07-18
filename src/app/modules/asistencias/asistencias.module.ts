import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { AsistenciaPersona } from './entities/asistencia-persona.entity';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { AuthModule } from '../auth/auth.module';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';

import { AsistenciasScannerService } from './asistencias-scanner.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asistencia, AsistenciaPersona, UsuarioSesion]),
    AuthModule,
  ],
  controllers: [AsistenciasController],
  providers: [AsistenciasService, AsistenciasScannerService],
  exports: [AsistenciasService, AsistenciasScannerService],
})
export class AsistenciasModule { }
