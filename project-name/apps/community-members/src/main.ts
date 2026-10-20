import path from 'node:path';
import dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { CommunityMembersModule } from './community-members.module';

dotenv.config({
  path: path.resolve(__dirname, '../../../apps/community-members/.env'),
});

async function bootstrap() {
  const app = await NestFactory.create(CommunityMembersModule);
  await app.listen(process.env.COMMUNITY_MEMBERS_SERVICE_PORT ?? 3004);
}

void bootstrap();
