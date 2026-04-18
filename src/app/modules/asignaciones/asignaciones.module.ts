import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionesController } from './asignaciones.controller';
import { Asignacion } from './entities/asignacion.entity';
import { Persona } from '../personas/entities/persona.entity';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Asignacion, Persona, UsuarioSesion]), AuthModule],
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
  exports: [AsignacionesService],
})
export class AsignacionesModule { }
