import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asistencia } from './entities/asistencia.entity';
import { AsistenciaPersona } from './entities/asistencia-persona.entity';
import { AsistenciasService } from './asistencias.service';
import { AsistenciasController } from './asistencias.controller';
import { AuthModule } from '../auth/auth.module';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asistencia, AsistenciaPersona, UsuarioSesion]),
    AuthModule,
  ],
  controllers: [AsistenciasController],
  providers: [AsistenciasService],
  exports: [AsistenciasService],
})
export class AsistenciasModule { }
