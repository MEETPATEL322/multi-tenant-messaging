import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove extra fields not in DTO
      forbidNonWhitelisted: true, // Throw error for unknown fields
      transform: true, // Auto transform query/body into DTO instances
    }),
  );
  
  const config = new DocumentBuilder()
    .setTitle('=Multi tenant Messaging Service')
    .setDescription('API for multi-tenant WAHA messaging integration')
    .setVersion('1.0')
    .addBearerAuth() // if you have JWT auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}`);
}
bootstrap();
