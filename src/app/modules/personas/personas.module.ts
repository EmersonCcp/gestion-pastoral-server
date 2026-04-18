import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasService } from './personas.service';
import { PersonasController } from './personas.controller';
import { TiposPersonasService } from './tipos-personas.service';
import { TiposPersonasController } from './tipos-personas.controller';
import { Persona } from './entities/persona.entity';
import { TipoPersona } from './entities/tipo-persona.entity';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Persona, TipoPersona, UsuarioSesion]), AuthModule],
  controllers: [PersonasController, TiposPersonasController],
  providers: [PersonasService, TiposPersonasService],
  exports: [PersonasService, TiposPersonasService],
})
export class PersonasModule { }
