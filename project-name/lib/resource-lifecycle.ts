import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { db } from './db';
import { redis } from './redis';

@Injectable()
export class ResourceLifecycle implements OnApplicationShutdown {
  async onApplicationShutdown() {
    // Release shared connections when the application shuts down.
    await db.end();
    if (redis.isOpen) redis.destroy();
  }
}
