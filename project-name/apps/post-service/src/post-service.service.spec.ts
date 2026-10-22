import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BansService } from '../../bans-service/src/bans.service';
import { CommunityMembersService } from '../../community-members/src/community-members.service';
import { RateLimitService } from '../../rate-limit/src/rate-limit.service';
import { RedisServiceService } from '../../redis-service/src/redis-service.service';
import { PostRepository } from './repositories/post.repository';
import { PostServiceService } from './post-service.service';

describe('PostServiceService', () => {
  let service: PostServiceService;
  const bans = { banPermissions: jest.fn() };
  const repository = {
    getAllRelatedPosts: jest.fn(),
    getCommunityPosts: jest.fn(),
    getSpecificPosts: jest.fn(),
    getOnePost: jest.fn(),
    findPostCommunityId: jest.fn(),
    updatePost: jest.fn(),
    createPost: jest.fn(),
    addLike: jest.fn(),
    removeLike: jest.fn(),
    countLikes: jest.fn(),
    moderate: jest.fn(),
  };
  const rateLimit = { checkPostsRateLimit: jest.fn() };
  const redis = { incrementPostViews: jest.fn() };
  const members = { requireOwner: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostServiceService,
        { provide: BansService, useValue: bans },
        { provide: PostRepository, useValue: repository },
        { provide: RateLimitService, useValue: rateLimit },
        { provide: RedisServiceService, useValue: redis },
        { provide: CommunityMembersService, useValue: members },
      ],
    }).compile();
    service = module.get(PostServiceService);
  });

  it('rejects incomplete pagination cursors before querying the repository', async () => {
    await expect(
      service.getCommunityPosts(null, 'community-1', '1712345678', undefined),
    ).rejects.toThrow(BadRequestException);
    expect(repository.getCommunityPosts).not.toHaveBeenCalled();
  });

  it('requires view permission for authenticated community post reads', async () => {
    repository.getCommunityPosts.mockResolvedValue({ posts: [] });

    await expect(
      service.getCommunityPosts('user-1', 'community-1'),
    ).resolves.toEqual({ posts: [] });
    expect(bans.banPermissions).toHaveBeenCalledWith(
      'user-1',
      'community-1',
      'view',
    );
  });

  it('validates and authorizes post creation before persisting it', async () => {
    const post = { id: 'post-1', title: 'Cats' };
    repository.createPost.mockResolvedValue(post);

    await expect(
      service.createPost('user-1', 'community-1', {
        title: '  Cats  ',
        content: '  Cat discussion  ',
      }),
    ).resolves.toEqual({
      success: true,
      message: 'Post created successfully',
      post,
    });
    expect(bans.banPermissions.mock.calls).toEqual([
      ['user-1', 'community-1', 'view'],
      ['user-1', 'community-1', 'post'],
    ]);
    expect(rateLimit.checkPostsRateLimit).toHaveBeenCalledWith('user-1');
    expect(repository.createPost).toHaveBeenCalledWith(
      'user-1',
      'community-1',
      'Cats',
      'Cat discussion',
    );
  });

  it('rejects edits by users other than the post author', async () => {
    repository.getOnePost.mockResolvedValue({
      author_id: 'author-1',
      community_id: 'community-1',
    });

    await expect(
      service.updatePost('post-1', { title: 'Changed' }, 'other-user'),
    ).rejects.toThrow(ForbiddenException);
    expect(repository.updatePost).not.toHaveBeenCalled();
  });

  it('allows an owner to moderate a post', async () => {
    repository.findPostCommunityId.mockResolvedValue('community-1');

    await expect(service.moderate('owner-1', 'post-1', 'pin')).resolves.toEqual(
      { success: true, communityId: 'community-1' },
    );
    expect(members.requireOwner).toHaveBeenCalledWith('owner-1', 'community-1');
    expect(repository.moderate).toHaveBeenCalledWith(
      'post-1',
      'community-1',
      'pin',
    );
  });
});
