import path from 'node:path';
import dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { PostServiceModule } from './post-service.module';

dotenv.config({
  path: path.resolve(__dirname, '../../../apps/post-service/.env'),
});

async function bootstrap() {
  const app = await NestFactory.create(PostServiceModule);
  await app.listen(process.env.POST_SERVICE_PORT ?? 3005);
}

void bootstrap();
