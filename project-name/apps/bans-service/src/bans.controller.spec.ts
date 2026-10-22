import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../../auth.guard';
import { CommunityMembersService } from '../../community-members/src/community-members.service';
import { BansService } from './bans.service';
import { BansController } from './bans.controller';

describe('BansController', () => {
  let controller: BansController;
  const bans = {
    getActiveBan: jest.fn(),
    upsert: jest.fn(),
    remove: jest.fn(),
  };
  const members = { requireOwner: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BansController],
      providers: [
        { provide: BansService, useValue: bans },
        { provide: CommunityMembersService, useValue: members },
      ],
    }).compile();
    controller = module.get(BansController);
  });

  it('allows a user to read their own ban without an owner lookup', async () => {
    const request = { user: { id: 'user-1' } } as AuthenticatedRequest;

    await controller.get('community-1', 'user-1', request);

    expect(members.requireOwner).not.toHaveBeenCalled();
    expect(bans.getActiveBan).toHaveBeenCalledWith('user-1', 'community-1');
  });

  it("requires an owner to read another user's ban", async () => {
    const request = { user: { id: 'owner-1' } } as AuthenticatedRequest;

    await controller.get('community-1', 'user-1', request);

    expect(members.requireOwner).toHaveBeenCalledWith('owner-1', 'community-1');
  });

  it('passes ban mutations through with the acting user', () => {
    const request = { user: { id: 'owner-1' } } as AuthenticatedRequest;
    const body = { can_view: false };

    controller.upsert('community-1', 'user-1', request, body);

    expect(bans.upsert).toHaveBeenCalledWith(
      'owner-1',
      'user-1',
      'community-1',
      body,
    );
  });
});
