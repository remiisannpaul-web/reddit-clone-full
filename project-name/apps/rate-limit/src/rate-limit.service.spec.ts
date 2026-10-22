jest.mock('../../../lib/redis', () => ({
  connectRedis: jest.fn(),
  redis: { incr: jest.fn(), expire: jest.fn() },
}));

import { BadRequestException } from '@nestjs/common';
import { connectRedis, redis } from '../../../lib/redis';
import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(connectRedis).mockResolvedValue(undefined);
    service = new RateLimitService();
  });

  it('connects to Redis, increments the user key, and sets expiry on the first post', async () => {
    jest.mocked(redis.incr).mockResolvedValue(1);

    await expect(
      service.checkPostsRateLimit('user-1'),
    ).resolves.toBeUndefined();
    expect(connectRedis).toHaveBeenCalledTimes(1);
    expect(redis.incr).toHaveBeenCalledWith('rate-limit:posts:user-1');
    expect(redis.expire).toHaveBeenCalledWith('rate-limit:posts:user-1', 60);
  });

  it('does not reset the expiry for subsequent posts in the same window', async () => {
    jest.mocked(redis.incr).mockResolvedValue(2);

    await expect(
      service.checkPostsRateLimit('user-1'),
    ).resolves.toBeUndefined();
    expect(redis.expire).not.toHaveBeenCalled();
  });

  it('rejects posts beyond the per-minute limit', async () => {
    jest.mocked(redis.incr).mockResolvedValue(4);

    await expect(service.checkPostsRateLimit('user-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('propagates Redis connection failures', async () => {
    jest.mocked(connectRedis).mockRejectedValue(new Error('Redis unavailable'));

    await expect(service.checkPostsRateLimit('user-1')).rejects.toThrow(
      'Redis unavailable',
    );
    expect(redis.incr).not.toHaveBeenCalled();
  });
});
