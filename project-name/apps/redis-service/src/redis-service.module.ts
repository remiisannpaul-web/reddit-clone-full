import { Module } from '@nestjs/common';
import { RedisServiceService } from './redis-service.service';

@Module({
  exports: [RedisServiceService],
  providers: [RedisServiceService],
})
export class RedisServiceModule {}
