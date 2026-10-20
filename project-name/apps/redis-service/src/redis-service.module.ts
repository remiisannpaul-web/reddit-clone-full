import { Module } from '@nestjs/common';
import { RedisServiceService } from './redis-service.service';
import { RedisServiceController } from './redis-service.controller';

@Module({
  exports: [RedisServiceService],
  controllers: [RedisServiceController],
  providers: [RedisServiceService],
})
export class RedisServiceModule {}
