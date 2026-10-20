import path from 'node:path';
import dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { CommentsServiceModule } from './comments-service.module';

dotenv.config({
  path: path.resolve(__dirname, '../../../apps/comments-service/.env'),
});

async function bootstrap() {
  const app = await NestFactory.create(CommentsServiceModule);
  await app.listen(process.env.COMMENTS_SERVICE_PORT ?? 3002);
}

void bootstrap();
