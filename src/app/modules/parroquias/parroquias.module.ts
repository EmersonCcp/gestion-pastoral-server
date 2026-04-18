import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParroquiasService } from './parroquias.service';
import { ParroquiasController } from './parroquias.controller';
import { Parroquia } from './entities/parroquia.entity';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';
import { AuthModule } from '../auth/auth.module';
import { EntitlementsModule } from '../entitlements/entitlements.module';

@Module({
  imports: [TypeOrmModule.forFeature([Parroquia, UsuarioSesion]), AuthModule, EntitlementsModule],
  controllers: [ParroquiasController],
  providers: [ParroquiasService],
  exports: [ParroquiasService],
})
export class ParroquiasModule { }
