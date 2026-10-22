import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../../auth.guard';
import { CommunityMembersService } from './community-members.service';
import { CommunityMembersController } from './community-members.controller';

describe('CommunityMembersController', () => {
  let controller: CommunityMembersController;
  const members = {
    list: jest.fn(),
    getOwner: jest.fn(),
    getRole: jest.fn(),
    removeMember: jest.fn(),
    setModerator: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityMembersController],
      providers: [{ provide: CommunityMembersService, useValue: members }],
    }).compile();
    controller = module.get(CommunityMembersController);
  });

  it('lists members for the authenticated owner', () => {
    const request = { user: { id: 'owner-1' } } as AuthenticatedRequest;

    controller.list('community-1', request);

    expect(members.list).toHaveBeenCalledWith('community-1', 'owner-1');
  });

  it('looks up the community owner', () => {
    controller.owner('community-1');

    expect(members.getOwner).toHaveBeenCalledWith('community-1');
  });

  it('promotes the requested member', () => {
    const request = { user: { id: 'owner-1' } } as AuthenticatedRequest;

    controller.promote('community-1', 'user-1', request);

    expect(members.setModerator).toHaveBeenCalledWith(
      'owner-1',
      'user-1',
      'community-1',
      true,
    );
  });
});
