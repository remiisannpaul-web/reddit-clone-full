import path from 'node:path';
import dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { UserServiceModule } from './user-service.module';

dotenv.config({
	path: path.resolve(__dirname, '../../../apps/user-service/.env'),
});

async function bootstrap() {
	const app = await NestFactory.create(UserServiceModule);
	await app.listen(process.env.USER_SERVICE_PORT ?? 3008);
}

void bootstrap();
