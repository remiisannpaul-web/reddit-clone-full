import './env';
import { Pool } from 'pg';

const max = Number(process.env.DB_POOL_MAX ?? 10);
if (!Number.isSafeInteger(max) || max < 1) {
  throw new Error('DB_POOL_MAX must be a positive integer');
}

// DatabaseModule and Better Auth share this pool within each process.
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
