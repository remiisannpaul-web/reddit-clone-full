import { Injectable } from '@nestjs/common';
import { CreateRedisServiceDto } from './dto/create-redis-service.dto';
import { UpdateRedisServiceDto } from './dto/update-redis-service.dto';
import { redis, connectRedis } from '../lib/redis';

@Injectable()
export class RedisServiceService {
  async incrementPostViews(postId: string) {
    await connectRedis();

    return redis.incr(`post:${postId}:views`);
  }

  async getPostViews(postId: string) {
    await connectRedis();
    const views = await redis.get(`post:${postId}:views`);

    return Number(views ?? 0);
  }

  create(createRedisServiceDto: CreateRedisServiceDto) {
    return 'This action adds a new redisService';
  }

  findAll() {
    return `This action returns all redisService`;
  }

  findOne(id: number) {
    return `This action returns a #${id} redisService`;
  }

  update(id: number, updateRedisServiceDto: UpdateRedisServiceDto) {
    return `This action updates a #${id} redisService`;
  }

  remove(id: number) {
    return `This action removes a #${id} redisService`;
  }
}
