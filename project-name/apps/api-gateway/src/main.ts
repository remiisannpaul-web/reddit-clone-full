import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(process.env.API_GATEWAY_PORT ?? 4000);
}
bootstrap();
