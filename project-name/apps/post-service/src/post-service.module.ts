import { CommunityMembersModule } from '../../community-members/src/community-members.module';
import { Module } from '@nestjs/common';
import { PostServiceService } from './post-service.service';
import { PostServiceController } from './post-service.controller';
import { BansModule } from '../../bans-service/src/bans.module';
import { PostRepository } from './repositories/post.repository';
import { RateLimitModule } from '../../rate-limit/src/rate-limit.module';
import { RedisServiceModule } from '../../redis-service/src/redis-service.module';
import { RequestIdMiddleware } from '../../../lib/middleware';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';

@Module({
  imports: [
    BansModule,
    RateLimitModule,
    RedisServiceModule,
    CommunityMembersModule,
  ],
  controllers: [PostServiceController],
  providers: [PostServiceService, PostRepository],
})
export class PostServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('posts');
  }
}
