import path from 'node:path';
import dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { BansModule } from './bans.module';

dotenv.config({
    path: path.resolve(__dirname, '../../../apps/bans-service/.env'),
});

async function bootstrap() {
    const app = await NestFactory.create(BansModule);
    await app.listen(process.env.BANS_SERVICE_PORT ?? 3009);
}

void bootstrap();