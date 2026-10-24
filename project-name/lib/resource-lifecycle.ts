import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { redis } from './redis';

@Injectable()
export class ResourceLifecycle implements OnApplicationShutdown {
  onApplicationShutdown() {
    if (redis.isOpen) redis.destroy();
  }
}
