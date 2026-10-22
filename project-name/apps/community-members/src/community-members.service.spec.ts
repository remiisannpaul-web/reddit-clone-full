jest.mock('../../../lib/db', () => ({
  db: { query: jest.fn() },
}));

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { db } from '../../../lib/db';
import { CommunityMembersService } from './community-members.service';

describe('CommunityMembersService', () => {
  let service: CommunityMembersService;
  const query = jest.mocked(db.query);

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CommunityMembersService();
  });

  it('returns null for an anonymous role lookup without querying the database', async () => {
    await expect(service.getRole(null, 'community-1')).resolves.toBeNull();
    expect(query).not.toHaveBeenCalled();
  });

  it('returns a role when the member exists', async () => {
    query.mockResolvedValue({ rows: [{ role: 'Moderator' }] } as never);

    await expect(service.getRole('user-1', 'community-1')).resolves.toEqual({
      role: 'Moderator',
    });
  });

  it('requires an owner for owner-only operations', async () => {
    query.mockResolvedValue({ rows: [{ role: 'Member' }] } as never);

    await expect(
      service.requireOwner('member-1', 'community-1'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('reports when no member with the required role can be promoted', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ role: 'Owner' }] } as never)
      .mockResolvedValueOnce({ rowCount: 0 } as never);

    await expect(
      service.setModerator('owner-1', 'missing-user', 'community-1', true),
    ).rejects.toThrow(NotFoundException);
  });

  it('promotes a member after confirming the actor is an owner', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ role: 'Owner' }] } as never)
      .mockResolvedValueOnce({ rowCount: 1 } as never);

    await expect(
      service.setModerator('owner-1', 'member-1', 'community-1', true),
    ).resolves.toEqual({ success: true });
    expect(query).toHaveBeenLastCalledWith(
      expect.stringContaining('UPDATE community_members'),
      ['member-1', 'community-1', 'Moderator', 'Member'],
    );
  });
});
