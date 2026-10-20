import { CommunityMembersService } from '../../community-members/src/community-members.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsServiceController } from './comments-service.controller';
import { CommentsServiceService } from './comments-service.service';
import { BansService } from '../../bans-service/src/bans.service';
import { CommentsRepository } from './repositories/comments.repository';

describe('CommentsServiceController', () => {
  let controller: CommentsServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsServiceController],
      providers: [
        { provide: CommunityMembersService, useValue: {} },
        CommentsServiceService,
        { provide: BansService, useValue: {} },
        { provide: CommentsRepository, useValue: {} },
      ],
    }).compile();

    controller = module.get<CommentsServiceController>(
      CommentsServiceController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
