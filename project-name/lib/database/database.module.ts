import {
  Global,
  Inject,
  Injectable,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import type { Pool } from 'pg';
import { db } from '../db';

export const DATABASE_POOL = Symbol('DATABASE_POOL');
export type DatabasePool = Pool;

@Injectable()
class DatabaseShutdown implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onApplicationShutdown() {
    await this.pool.end();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useValue: db,
    },
    DatabaseShutdown,
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule {}
