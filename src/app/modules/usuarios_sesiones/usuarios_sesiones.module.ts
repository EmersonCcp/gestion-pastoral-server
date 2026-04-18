import { Module } from '@nestjs/common';
import { UsuariosSesionesService } from './usuarios_sesiones.service';
import { UsuariosSesionesController } from './usuarios_sesiones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioSesion } from './entities/usuarios_sesione.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Module({imports:[TypeOrmModule.forFeature([UsuarioSesion,Usuario])],
  controllers: [UsuariosSesionesController],
  providers: [UsuariosSesionesService,],
})
export class UsuariosSesionesModule {}
