import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsuariosModule } from './app/modules/usuarios/usuarios.module';
import { AuthModule } from './app/modules/auth/auth.module';
import { RolesModule } from './app/modules/roles/roles.module';
import { PermisosModule } from './app/modules/permisos/permisos.module';
import { RolesPermisosModule } from './app/modules/roles_permisos/roles_permisos.module';
import { UsuariosRolesModule } from './app/modules/usuarios_roles/usuarios_roles.module';
import { UsuariosSesionesModule } from './app/modules/usuarios_sesiones/usuarios_sesiones.module';
import { EntitlementsModule } from './app/modules/entitlements/entitlements.module';
import { ParroquiasModule } from './app/modules/parroquias/parroquias.module';
import { MovimientosModule } from './app/modules/movimientos/movimientos.module';
import { GruposModule } from './app/modules/grupos/grupos.module';
import { PeriodosModule } from './app/modules/periodos/periodos.module';
import { PersonasModule } from './app/modules/personas/personas.module';
import { AulasModule } from './app/modules/aulas/aulas.module';
import { AsignacionesModule } from './app/modules/asignaciones/asignaciones.module';
import { AsistenciasModule } from './app/modules/asistencias/asistencias.module';
import { DashboardModule } from './app/modules/dashboard/dashboard.module';
import { LibrosModule } from './app/modules/libros/libros.module';
import { DesarrolloClaseModule } from './app/modules/desarrollo-clase/desarrollo-clase.module';
import { SocketModule } from './app/modules/socket/socket.module';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { JwtPayloadGuard } from './app/modules/auth/jwt-payload.guard';
import { PermisosGuard } from './shared/guards/permisos.guard';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { LoggerMiddleware } from './shared/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),

        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
        autoLoadEntities: true,
        synchronize: false, //
      }),
    }),
    AuthModule,
    UsuariosModule,
    RolesModule,
    PermisosModule,
    RolesPermisosModule,
    UsuariosRolesModule,
    UsuariosSesionesModule,
    EntitlementsModule,
    ParroquiasModule,
    MovimientosModule,
    GruposModule,
    PeriodosModule,
    PersonasModule,
    AulasModule,
    AsignacionesModule,
    AsistenciasModule,
    DashboardModule,
    LibrosModule,
    DesarrolloClaseModule,
    SocketModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD, useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD, useClass: PermisosGuard
    }
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
