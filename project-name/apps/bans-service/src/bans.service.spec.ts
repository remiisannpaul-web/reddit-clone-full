jest.mock('../../../lib/db', () => ({
  db: { query: jest.fn() },
}));

import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { db } from '../../../lib/db';
import { CommunityMembersService } from '../../community-members/src/community-members.service';
import { BansService } from './bans.service';

describe('BansService', () => {
  let service: BansService;
  const members = {
    requireOwner: jest.fn(),
    getRole: jest.fn(),
  };
  const query = jest.mocked(db.query);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BansService,
        { provide: CommunityMembersService, useValue: members },
      ],
    }).compile();
    service = module.get(BansService);
  });

  it('allows actions when there is no active ban', async () => {
    query.mockResolvedValue({ rows: [] } as never);

    await expect(
      service.banPermissions('user-1', 'community-1', 'post'),
    ).resolves.toBeNull();
  });

  it('allows a permission explicitly granted by an active ban record', async () => {
    query.mockResolvedValue({
      rows: [
        {
          can_post: true,
          can_comment: false,
          can_vote: true,
          can_view: true,
          reason: null,
          expires_at: null,
        },
      ],
    } as never);

    await expect(
      service.banPermissions('user-1', 'community-1', 'post'),
    ).resolves.toBe(true);
  });

  it('rejects a permission denied by an active ban', async () => {
    query.mockResolvedValue({
      rows: [
        {
          can_post: false,
          can_comment: true,
          can_vote: true,
          can_view: true,
          reason: 'spam',
          expires_at: null,
        },
      ],
    } as never);

    await expect(
      service.banPermissions('user-1', 'community-1', 'post'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('requires the actor to own the community before writing a ban', async () => {
    members.requireOwner.mockRejectedValue(
      new ForbiddenException('Community owner required'),
    );

    await expect(
      service.upsert('member-1', 'user-2', 'community-1', {
        can_post: true,
        can_comment: true,
        can_vote: true,
        can_view: true,
      }),
    ).rejects.toThrow(ForbiddenException);
    expect(query).not.toHaveBeenCalled();
  });
});
