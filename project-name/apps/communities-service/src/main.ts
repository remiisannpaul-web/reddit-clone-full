import path from 'node:path';
import dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { CommunitiesServiceModule } from './communities-service.module';

dotenv.config({
  path: path.resolve(__dirname, '../../../apps/communities-service/.env'),
});

async function bootstrap() {
  const app = await NestFactory.create(CommunitiesServiceModule);
  await app.listen(process.env.COMMUNITIES_SERVICE_PORT ?? 3003);
}

void bootstrap();
