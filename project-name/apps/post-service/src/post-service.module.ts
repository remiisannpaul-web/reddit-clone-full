import { Module } from '@nestjs/common';
import { PostServiceService } from './post-service.service';
import { PostServiceController } from './post-service.controller';
import { BansCoreModule } from '../../bans-service/src/bans-core.module';
import { CommunityMembersCoreModule } from '../../community-members/src/community-members-core.module';
import { PostRepository } from './repositories/post.repository';
import { RateLimitModule } from '../../rate-limit/src/rate-limit.module';
import { RedisServiceModule } from '../../redis-service/src/redis-service.module';
import { RequestIdMiddleware } from '../../../lib/middleware';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';

@Module({
  imports: [
    BansCoreModule,
    RateLimitModule,
    RedisServiceModule,
    CommunityMembersCoreModule,
  ],
  controllers: [PostServiceController],
  providers: [PostServiceService, PostRepository],
})
export class PostServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('posts');
  }
}
