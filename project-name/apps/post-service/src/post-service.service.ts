import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePostServiceDto } from './dto/update-post-service.dto';
import { BansService } from '../../bans-service/src/bans.service';
import { PostRepository } from './repositories/post.repository';
import { RateLimitService } from '../../rate-limit/src/rate-limit.service';
import { RedisServiceService } from '../../redis-service/src/redis-service.service';
import { CommunityMembersService } from '../../community-members/src/community-members.service';
import { requiredText, requireUuid } from '../../../lib/validation';
import { CreatePostServiceDto } from './dto/create-post-service.dto';

@Injectable()
export class PostServiceService {
  constructor(
    private readonly bansService: BansService,
    private readonly postRepository: PostRepository,
    private readonly rateLimitService: RateLimitService,
    private readonly redisService: RedisServiceService,
    private readonly members: CommunityMembersService,
  ) {}

  getAllRelatedPosts(userId: string) {
    return this.postRepository.getAllRelatedPosts(userId);
  }

  async getCommunityPosts(
    userId: string | null,
    communityId: string,
    cursorCreatedAt?: string,
    cursorId?: string,
  ) {
    if ((cursorCreatedAt === undefined) !== (cursorId === undefined))
      throw new BadRequestException('Both cursor values are required');
    if (cursorId !== undefined) {
      requireUuid(cursorId);
      if (!cursorCreatedAt?.trim() || !Number.isFinite(Number(cursorCreatedAt)))
        throw new BadRequestException('Invalid cursor timestamp');
    }
    if (userId)
      await this.bansService.banPermissions(userId, communityId, 'view');
    // Votes depend on the viewer and pagination depends on both cursor fields.
    return this.postRepository.getCommunityPosts(
      userId,
      communityId,
      cursorCreatedAt,
      cursorId,
    );
  }

  async getSpecificPosts(userId: string | null, communityId: string) {
    if (userId)
      await this.bansService.banPermissions(userId, communityId, 'view');
    return this.postRepository.getSpecificPosts(communityId, userId);
  }

  async updatePost(postId: string, body: UpdatePostServiceDto, userId: string) {
    const post = await this.postRepository.getOnePost(postId, userId);
    if (!post) throw new NotFoundException('Post not found');
    if (post.author_id !== userId)
      throw new ForbiddenException('Only the author may edit a post');
    await this.bansService.banPermissions(userId, post.community_id, 'post');
    if (body.title === undefined && body.content === undefined)
      throw new BadRequestException('No fields to update');
    const fields = {
      ...(body.title !== undefined
        ? { title: requiredText(body.title, 'title', 300) }
        : {}),
      ...(body.content !== undefined
        ? { content: requiredText(body.content, 'content') }
        : {}),
    };
    await this.postRepository.updatePost(postId, fields);
    return { success: true, message: 'Post updated' };
  }

  private async checkPost(
    userId: string,
    postId: string,
    permission: 'view' | 'vote',
  ) {
    const communityId = await this.postRepository.findPostCommunityId(postId);
    if (!communityId) throw new NotFoundException('Post not found');
    await this.bansService.banPermissions(userId, communityId, 'view');
    if (permission !== 'view')
      await this.bansService.banPermissions(userId, communityId, permission);
    return communityId;
  }

  async getOnePost(id: string, userId: string) {
    await this.checkPost(userId, id, 'view');
    const post = await this.postRepository.getOnePost(id, userId);
    if (!post) throw new NotFoundException('Post not found');
    this.redisService
      .incrementPostViews(id)
      .catch((error) => console.error('Failed to increment views', error));
    return post;
  }

  async createPost(
    userId: string,
    communityId: string,
    createPostDto: CreatePostServiceDto,
  ) {
    const validTitle = requiredText(createPostDto.title, 'title', 300);
    const validContent = requiredText(createPostDto.content, 'content');
    await this.bansService.banPermissions(userId, communityId, 'view');
    await this.bansService.banPermissions(userId, communityId, 'post');
    await this.rateLimitService.checkPostsRateLimit(userId);
    const post = await this.postRepository.createPost(
      userId,
      communityId,
      validTitle,
      validContent,
    );
    return { success: true, message: 'Post created successfully', post };
  }

  async addLike(userId: string, postId: string, _communityId?: string) {
    await this.checkPost(userId, postId, 'vote');
    const changedRows = await this.postRepository.addLike(userId, postId);
    return { success: true, action: 'add', postId, changed: changedRows > 0 };
  }

  async removeLike(userId: string, postId: string) {
    await this.checkPost(userId, postId, 'vote');
    const changedRows = await this.postRepository.removeLike(userId, postId);
    return {
      success: true,
      action: 'remove',
      postId,
      changed: changedRows > 0,
    };
  }

  async countLikes(userId: string, postId: string) {
    await this.checkPost(userId, postId, 'view');
    return this.postRepository.countLikes(postId);
  }

  async moderate(
    userId: string,
    postId: string,
    action: 'delete' | 'pin' | 'unpin',
  ) {
    const communityId = await this.postRepository.findPostCommunityId(postId);
    if (!communityId) throw new NotFoundException('Post not found');
    await this.members.requireOwner(userId, communityId);
    await this.postRepository.moderate(postId, communityId, action);
    return { success: true, communityId };
  }
}
