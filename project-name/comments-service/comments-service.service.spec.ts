import { CommunityMembersService } from '../community-members/community-members.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsServiceService } from './comments-service.service';
import { BansService } from '../bans/bans.service';
import { CommentsRepository } from './repositories/comments.repository';

describe('CommentsServiceService', () => {
  let service: CommentsServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: CommunityMembersService, useValue: {} },
        CommentsServiceService,
        { provide: BansService, useValue: {} },
        { provide: CommentsRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<CommentsServiceService>(CommentsServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
