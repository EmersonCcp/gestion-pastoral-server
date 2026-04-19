import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibrosService } from './libros.service';
import { LibrosInventarioService } from './libros-inventario.service';
import { LibrosController } from './libros.controller';
import { LibrosInventarioController } from './libros-inventario.controller';
import { TemasController } from './temas.controller';
import { Libro } from './entities/libro.entity';
import { Tema } from './entities/tema.entity';
import { LibroMovimiento } from './entities/libro-movimiento.entity';
import { LibroAsignacion } from './entities/libro-asignacion.entity';
import { UsuarioSesion } from '../usuarios_sesiones/entities/usuarios_sesione.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Libro, Tema, LibroMovimiento, LibroAsignacion, UsuarioSesion])],
  controllers: [LibrosController, TemasController, LibrosInventarioController],
  providers: [LibrosService, LibrosInventarioService],
  exports: [LibrosService, LibrosInventarioService, TypeOrmModule],
})
export class LibrosModule {}
