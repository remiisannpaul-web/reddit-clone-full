import './env';
import { createClient } from 'redis';

export const redis = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
});

redis.on('error', (err) => console.log('Redis Client Error', err));

let connectionPromise: Promise<void> | undefined;

export function connectRedis(): Promise<void> {
  connectionPromise ??= redis
    .connect()
    .then(() => undefined)
    .catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
  return connectionPromise;
}
