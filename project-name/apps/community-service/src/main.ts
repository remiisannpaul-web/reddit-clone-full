import { NestFactory } from '@nestjs/core';
import { CommunityServiceModule } from './community-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CommunityServiceModule);
  await app.listen(process.env.COMMUNITY_SERVICE_PORT ?? 3003);
}

void bootstrap();
