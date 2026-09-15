import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BansService } from '../bans/bans.service';
import { CommunityMembersService } from '../community-members/community-members.service';
import { CommentsRepository } from './repositories/comments.repository';
import { requiredText } from '../lib/validation';

@Injectable()
export class CommentsServiceService {
  constructor(
    private readonly bansService: BansService,
    private readonly commentsRepository: CommentsRepository,
    private readonly members: CommunityMembersService,
  ) {}

  async forPost(userId: string, postId: string) {
    const communityId = await this.bansService.getCommunityIdForPost(postId);
    if (!communityId) throw new NotFoundException('Post not found');
    await this.bansService.banPermissions(userId, communityId, 'view');
    return this.commentsRepository.forPost(userId, postId);
  }

  async create(userId: string, postId: string, content: unknown) {
    const text = requiredText(content, 'content');
    const communityId = await this.bansService.getCommunityIdForPost(postId);
    if (!communityId) throw new NotFoundException('Post not found');
    await this.bansService.banPermissions(userId, communityId, 'view');
    await this.bansService.banPermissions(userId, communityId, 'comment');
    await this.commentsRepository.create(userId, postId, text);
    return { success: true, communityId };
  }

  async removeOneComment(commentId: string, postId: string, userId: string) {
    const comment = await this.commentsRepository.findCommentForDeletion(
      commentId,
      postId,
    );
    if (!comment) throw new NotFoundException('Comment not found');
    const membership = await this.members.getRole(userId, comment.community_id);
    if (userId !== comment.author_id && membership?.role !== 'Owner')
      throw new ForbiddenException('Cannot delete this comment');
    const deletedRows = await this.commentsRepository.deleteComment(commentId);
    return { success: true, data: { commentId, postId, deletedRows } };
  }

  async getCommentLikes(commentId: string, userId: string) {
    await this.checkPermission(userId, commentId, 'view');
    return this.commentsRepository.countLikes(commentId);
  }

  private async checkPermission(
    userId: string,
    commentId: string,
    permission: 'view' | 'vote',
  ) {
    const communityId =
      await this.bansService.getCommunityIdForComment(commentId);
    if (!communityId) throw new NotFoundException('Comment not found');
    await this.bansService.banPermissions(userId, communityId, 'view');
    if (permission !== 'view')
      await this.bansService.banPermissions(userId, communityId, permission);
  }

  async addCommentLike(userId: string, commentId: string) {
    await this.checkPermission(userId, commentId, 'vote');
    const changedRows = await this.commentsRepository.addLike(
      userId,
      commentId,
    );
    return { success: true, commentId, changedRows };
  }

  async removeCommentLike(userId: string, commentId: string) {
    await this.checkPermission(userId, commentId, 'vote');
    const deletedRows = await this.commentsRepository.removeLike(
      userId,
      commentId,
    );
    return { success: true, commentId, deletedRows };
  }
}
