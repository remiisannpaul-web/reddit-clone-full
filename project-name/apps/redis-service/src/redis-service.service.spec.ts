jest.mock('../../../lib/redis', () => ({
  connectRedis: jest.fn(),
  redis: { incr: jest.fn(), get: jest.fn() },
}));

import { connectRedis, redis } from '../../../lib/redis';
import { RedisServiceService } from './redis-service.service';

describe('RedisServiceService', () => {
  let service: RedisServiceService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(connectRedis).mockResolvedValue(undefined);
    service = new RedisServiceService();
  });

  it('increments the post-view counter and returns the new count', async () => {
    jest.mocked(redis.incr).mockResolvedValue(8);

    await expect(service.incrementPostViews('post-1')).resolves.toBe(8);
    expect(connectRedis).toHaveBeenCalledTimes(1);
    expect(redis.incr).toHaveBeenCalledWith('post:post-1:views');
  });

  it('converts the stored view count to a number', async () => {
    jest.mocked(redis.get).mockResolvedValue('12');

    await expect(service.getPostViews('post-1')).resolves.toBe(12);
    expect(redis.get).toHaveBeenCalledWith('post:post-1:views');
  });

  it('returns zero when no view count exists', async () => {
    jest.mocked(redis.get).mockResolvedValue(null);

    await expect(service.getPostViews('new-post')).resolves.toBe(0);
  });

  it('propagates Redis connection failures', async () => {
    jest.mocked(connectRedis).mockRejectedValue(new Error('Redis unavailable'));

    await expect(service.getPostViews('post-1')).rejects.toThrow(
      'Redis unavailable',
    );
    expect(redis.get).not.toHaveBeenCalled();
  });
});
