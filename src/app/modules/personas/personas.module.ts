import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonasService } from './personas.service';
import { PersonasController } from './personas.controller';
import { TiposPersonasService } from './tipos-personas.service';
import { TiposPersonasController } from './tipos-personas.controller';
import { DocumentosPersonaController } from './documentos-persona.controller';
import { Persona } from './entities/persona.entity';
import { TipoPersona } from './entities/tipo-persona.entity';
import { DocumentoPersona } from './entities/documento-persona.entity';
import { PersonaRelacion } from './entities/persona-relacion.entity';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';
import { AuthModule } from '../auth/auth.module';
import { DocumentosPersonaService } from './documentos-persona.service';

@Module({
  imports: [TypeOrmModule.forFeature([Persona, TipoPersona, DocumentoPersona, PersonaRelacion, UsuarioSesion]), AuthModule],
  controllers: [PersonasController, TiposPersonasController, DocumentosPersonaController],
  providers: [PersonasService, TiposPersonasService, DocumentosPersonaService],
  exports: [PersonasService, TiposPersonasService, DocumentosPersonaService],
})
export class PersonasModule { }
