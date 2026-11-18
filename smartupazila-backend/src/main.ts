// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
    : ['http://localhost:3001'];
  app.enableCors({ origin: corsOrigins, credentials: true });

  const config = new DocumentBuilder()
    .setTitle('SmartUpazila AI API')
    .setDescription('Comprehensive AI-driven digital municipality & public service API for Bangladesh Upazilas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, doc);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
void bootstrap();