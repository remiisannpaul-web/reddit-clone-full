import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BansService } from '../../bans-service/src/bans.service';
import { CommunityMembersService } from '../../community-members/src/community-members.service';
import { CommentsRepository } from './repositories/comments.repository';
import { CommentsServiceService } from './comments-service.service';

describe('CommentsServiceService', () => {
  let service: CommentsServiceService;
  const bans = {
    getCommunityIdForPost: jest.fn(),
    getCommunityIdForComment: jest.fn(),
    banPermissions: jest.fn(),
  };
  const members = { getRole: jest.fn() };
  const repository = {
    forPost: jest.fn(),
    create: jest.fn(),
    findCommentForDeletion: jest.fn(),
    deleteComment: jest.fn(),
    countLikes: jest.fn(),
    addLike: jest.fn(),
    removeLike: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsServiceService,
        { provide: BansService, useValue: bans },
        { provide: CommunityMembersService, useValue: members },
        { provide: CommentsRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(CommentsServiceService);
  });

  it('checks the view permission before listing post comments', async () => {
    const comments = [{ id: 'comment-1' }];
    bans.getCommunityIdForPost.mockResolvedValue('community-1');
    repository.forPost.mockResolvedValue(comments);

    await expect(service.forPost('user-1', 'post-1')).resolves.toBe(comments);
    expect(bans.banPermissions).toHaveBeenCalledWith(
      'user-1',
      'community-1',
      'view',
    );
    expect(repository.forPost).toHaveBeenCalledWith('user-1', 'post-1');
  });

  it('rejects comments for a missing post', async () => {
    bans.getCommunityIdForPost.mockResolvedValue(null);

    await expect(service.forPost('user-1', 'missing')).rejects.toThrow(
      NotFoundException,
    );
    expect(repository.forPost).not.toHaveBeenCalled();
  });

  it('validates content and checks view and comment permissions before creating', async () => {
    bans.getCommunityIdForPost.mockResolvedValue('community-1');
    repository.create.mockResolvedValue(undefined);

    await expect(
      service.create('user-1', 'post-1', '  useful comment  '),
    ).resolves.toEqual({ success: true, communityId: 'community-1' });
    expect(bans.banPermissions.mock.calls).toEqual([
      ['user-1', 'community-1', 'view'],
      ['user-1', 'community-1', 'comment'],
    ]);
    expect(repository.create).toHaveBeenCalledWith(
      'user-1',
      'post-1',
      'useful comment',
    );
  });

  it("allows an owner to delete another member's comment", async () => {
    repository.findCommentForDeletion.mockResolvedValue({
      author_id: 'author-1',
      community_id: 'community-1',
    });
    members.getRole.mockResolvedValue({ role: 'Owner' });
    repository.deleteComment.mockResolvedValue(1);

    await expect(
      service.removeOneComment('comment-1', 'post-1', 'owner-1'),
    ).resolves.toEqual({
      success: true,
      data: { commentId: 'comment-1', postId: 'post-1', deletedRows: 1 },
    });
  });

  it('prevents a non-author non-owner from deleting a comment', async () => {
    repository.findCommentForDeletion.mockResolvedValue({
      author_id: 'author-1',
      community_id: 'community-1',
    });
    members.getRole.mockResolvedValue({ role: 'Member' });

    await expect(
      service.removeOneComment('comment-1', 'post-1', 'other-user'),
    ).rejects.toThrow(ForbiddenException);
    expect(repository.deleteComment).not.toHaveBeenCalled();
  });
});
