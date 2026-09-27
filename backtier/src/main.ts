import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { ApiExceptionFilter } from './core/interceptors/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  app.enableCors({
    origin: [
      'https://meridian-proj.web.app',
      'https://meridian-proj.firebaseapp.com',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'x-tenant-id'],
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port}`);
}
bootstrap();
