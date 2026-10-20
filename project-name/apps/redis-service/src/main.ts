import path from 'node:path';
import dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { RedisServiceModule } from './redis-service.module';

dotenv.config({
  path: path.resolve(__dirname, '../../../apps/redis-service/.env'),
});

async function bootstrap() {
  const app = await NestFactory.create(RedisServiceModule);
  await app.listen(process.env.REDIS_SERVICE_PORT ?? 3007);
}

void bootstrap();
