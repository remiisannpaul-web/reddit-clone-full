import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BansService } from '../../bans-service/src/bans.service';
import { CommunityMembersService } from '../../community-members/src/community-members.service';
import { CommunitiesRepository } from './repositories/communities.repository';
import { CommunitiesServiceService } from './communities-service.service';

describe('CommunitiesServiceService', () => {
  let service: CommunitiesServiceService;
  const bans = { banPermissions: jest.fn() };
  const members = { getRole: jest.fn() };
  const repository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findMember: jest.fn(),
    addMember: jest.fn(),
    removeMember: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesServiceService,
        { provide: BansService, useValue: bans },
        { provide: CommunityMembersService, useValue: members },
        { provide: CommunitiesRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(CommunitiesServiceService);
  });

  it('validates and normalizes community creation fields', async () => {
    const community = { id: 'community-1', name: 'cats' };
    repository.create.mockResolvedValue(community);

    await expect(
      service.create('user-1', {
        name: '  cats  ',
        description: '  cat fans  ',
        banner_url: '',
        icon_url: 'https://example.test/cat.png',
      }),
    ).resolves.toBe(community);
    expect(repository.create).toHaveBeenCalledWith(
      'user-1',
      'cats',
      'cat fans',
      null,
      'https://example.test/cat.png',
    );
  });

  it('requires a community to exist before returning it', async () => {
    repository.findOne.mockResolvedValue(undefined);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('checks view permission for an authenticated community lookup', async () => {
    const community = { id: 'community-1', name: 'cats' };
    repository.findOne.mockResolvedValue(community);

    await expect(service.findOne('community-1', 'user-1')).resolves.toBe(
      community,
    );
    expect(bans.banPermissions).toHaveBeenCalledWith(
      'user-1',
      'community-1',
      'view',
    );
  });

  it('does not perform membership lookups for anonymous users', async () => {
    await expect(service.isMember(null, 'community-1')).resolves.toBe(false);
    expect(repository.findMember).not.toHaveBeenCalled();
  });

  it('adds a member only after confirming the community exists and is viewable', async () => {
    repository.findOne.mockResolvedValue({ id: 'community-1' });
    repository.addMember.mockResolvedValue(undefined);

    await expect(
      service.regularJoinCommunity('user-1', 'community-1'),
    ).resolves.toEqual({ success: true });
    expect(repository.addMember).toHaveBeenCalledWith('user-1', 'community-1');
  });

  it('prevents the owner from leaving their community', async () => {
    members.getRole.mockResolvedValue({ role: 'Owner' });

    await expect(
      service.leaveCommunity('owner-1', 'community-1'),
    ).rejects.toThrow(ForbiddenException);
    expect(repository.removeMember).not.toHaveBeenCalled();
  });
});
