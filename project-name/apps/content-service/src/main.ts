import { NestFactory } from '@nestjs/core';
import { ContentServiceModule } from './content-service.module';

async function bootstrap() {
  const app = await NestFactory.create(ContentServiceModule);
  await app.listen(process.env.CONTENT_SERVICE_PORT ?? 3005);
}

void bootstrap();
