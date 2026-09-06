import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { ApiExceptionFilter } from './core/interceptors/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow requests from the Vite frontend dev server
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
    ],
    credentials: true,
  });

  // Increase parser limits so profile-photo data URLs can be persisted.
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ limit: '15mb', extended: true }));

  // ─── Global Validation ────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ─── N4: Global Response Envelope ────────────────────────────────────────
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new ApiExceptionFilter());

  // ─── Swagger / OpenAPI ───────────────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('B2 Backend API')
    .setDescription(
      'Multi-tenant SaaS backend API — includes Auth, Tenants, Users, Vendors, Vessels, Catalog, Requisitions, and SMC modules.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
bootstrap();
