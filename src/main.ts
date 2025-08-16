import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove extra fields not in DTO
      forbidNonWhitelisted: true, // Throw error for unknown fields
      transform: true, // Auto transform query/body into DTO instances
    }),
  );

  // Apply global rate limiter
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 60 seconds
      max: 5, // limit each IP to 5 requests per window
      message:
        'Too many requests from this IP, please try again after a minute',
    }),
  );

  // Enable CORS only for localhost
  app.enableCors({
    origin: ['http://localhost:3000'], // frontend origin(s)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // allowed HTTP methods
    credentials: true, // allow cookies/auth headers
  });

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
