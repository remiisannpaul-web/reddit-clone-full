// cache.module.ts

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,

      useFactory: async () => ({
        stores: [
          createKeyv(
            process.env.REDIS_URL ?? 'redis://localhost:6379',
          ),
        ],
      }),
    }),
  ],
})
export class AppCacheModule {}