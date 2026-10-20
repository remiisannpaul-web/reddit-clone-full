import { Test, TestingModule } from '@nestjs/testing';
import { PostServiceService } from './post-service.service';
import { BansService } from '../../bans-service/src/bans.service';
import { PostRepository } from './repositories/post.repository';
import { RateLimitService } from '../../rate-limit/src/rate-limit.service';
import { RedisServiceService } from '../../redis-service/src/redis-service.service';
import { CommunityMembersService } from '../../community-members/src/community-members.service';

describe('PostServiceService', () => {
  let service: PostServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostServiceService,
        { provide: BansService, useValue: {} },
        { provide: PostRepository, useValue: {} },
        { provide: RedisServiceService, useValue: {} },
        { provide: CommunityMembersService, useValue: {} },
        { provide: RateLimitService, useValue: {} },
      ],
    }).compile();

    service = module.get<PostServiceService>(PostServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
