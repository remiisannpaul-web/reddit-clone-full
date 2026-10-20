import path from 'node:path';
import dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { RateLimitModule } from './rate-limit.module';

dotenv.config({
  path: path.resolve(__dirname, '../../../apps/rate-limit/.env'),
});

async function bootstrap() {
  const app = await NestFactory.create(RateLimitModule);
  await app.listen(process.env.RATE_LIMIT_SERVICE_PORT ?? 3006);
}

void bootstrap();
