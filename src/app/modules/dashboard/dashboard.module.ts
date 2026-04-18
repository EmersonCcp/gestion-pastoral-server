import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../personas/entities/persona.entity';
import { TipoPersona } from '../personas/entities/tipo-persona.entity';
import { Asignacion } from '../asignaciones/entities/asignacion.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthModule } from '../auth/auth.module';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Persona, TipoPersona, Asignacion, UsuarioSesion]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule { }
