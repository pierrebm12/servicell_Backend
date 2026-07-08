import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import * as rateLimit from 'express-rate-limit';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  app.useStaticAssets(path.resolve(process.cwd(), 'uploads'), { prefix: '/uploads' });



  app.useBodyParser('json', { limit: '10mb' });

  app.setGlobalPrefix('api/v1');

  app.use(helmet());
  app.use(compression());
  app.use(
    rateLimit.default({
      windowMs: 15 * 60 * 1000,
      max: 100,
    }),
  );

  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}

bootstrap();
