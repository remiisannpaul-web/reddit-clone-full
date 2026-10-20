import { CommunityMembersService } from '../../community-members/src/community-members.service';
import { Test, TestingModule } from '@nestjs/testing';
import { CommunitiesServiceService } from './communities-service.service';
import { BansService } from '../../bans-service/src/bans.service';
import { CommunitiesRepository } from './repositories/communities.repository';

describe('CommunitiesServiceService', () => {
  let service: CommunitiesServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: CommunityMembersService, useValue: {} },
        CommunitiesServiceService,
        { provide: BansService, useValue: {} },
        { provide: CommunitiesRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<CommunitiesServiceService>(CommunitiesServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
