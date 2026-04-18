import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
   app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Sistema de Reservas de Libros')
    .setDescription(
      'API para gestionar la reserva de libros de los estudiantes de medicina UCP',
    )
    .setVersion('1.0')
    .addBearerAuth() // Para usar JWT en el futuro
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
