import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../../auth.guard';
import { CommunitiesServiceService } from './communities-service.service';
import { CommunitiesServiceController } from './communities-service.controller';

describe('CommunitiesServiceController', () => {
  let controller: CommunitiesServiceController;
  const communities = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    isMember: jest.fn(),
    regularJoinCommunity: jest.fn(),
    leaveCommunity: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunitiesServiceController],
      providers: [
        { provide: CommunitiesServiceService, useValue: communities },
      ],
    }).compile();
    controller = module.get(CommunitiesServiceController);
  });

  it('creates a community for the authenticated user', () => {
    const request = { user: { id: 'user-1' } } as AuthenticatedRequest;
    const body = { name: 'cats' };

    controller.create(request, body);

    expect(communities.create).toHaveBeenCalledWith('user-1', body);
  });

  it('supports anonymous membership lookups', () => {
    controller.membership('community-1', { user: undefined });

    expect(communities.isMember).toHaveBeenCalledWith(null, 'community-1');
  });

  it('passes the authenticated user into the join operation', () => {
    const request = { user: { id: 'user-1' } } as AuthenticatedRequest;

    controller.join('community-1', request);

    expect(communities.regularJoinCommunity).toHaveBeenCalledWith(
      'user-1',
      'community-1',
    );
  });
});
