import { Inject, BadRequestException } from '@nestjs/common';
import { redis, connectRedis } from '../lib/redis';
import { Injectable } from '@nestjs/common';
import { UpdateRateLimitDto } from './dto/update-rate-limit.dto';




@Injectable()
export class RateLimitService {
  

  async checkPostsRateLimit(userId: string) {
    await connectRedis();
    
    const key = `rate-limit:posts:${userId}`;
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, 60)
    }

    if (count > 3) {
      throw new BadRequestException('You have exceeded the limit of 3 posts per minute.');
    }
  }

  findAll() {
    return `This action returns all rateLimit`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rateLimit`;
  }

  update(id: number, updateRateLimitDto: UpdateRateLimitDto) {
    return `This action updates a #${id} rateLimit`;
  }

  remove(id: number) {
    return `This action removes a #${id} rateLimit`;
  }
}
