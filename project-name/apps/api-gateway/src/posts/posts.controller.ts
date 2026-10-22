import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AuthGuard,
  OptionalAuthGuard,
  type AuthenticatedRequest,
  type SessionRequest,
} from '../../../../auth.guard';
import { PostsClient } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsClient: PostsClient) {}

  @Get('feed')
  @UseGuards(AuthGuard)
  findFeed(@Req() req: AuthenticatedRequest) {
    return this.postsClient.findFeed(req);
  }

  @Get('community/:communityId')
  @UseGuards(OptionalAuthGuard)
  getCommunityPosts(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Req() req: SessionRequest,
    @Query('cursorCreatedAt') cursorCreatedAt?: string,
    @Query('cursorId') cursorId?: string,
  ) {
    return this.postsClient.getCommunityPosts(
      communityId,
      cursorCreatedAt,
      cursorId,
      req,
    );
  }

  @Get('community/:communityId/all')
  @UseGuards(OptionalAuthGuard)
  all(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Req() req: SessionRequest,
  ) {
    return this.postsClient.getSpecificPosts(communityId, req);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findRelatedPosts(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsClient.findOne(id, req);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsClient.update(id, body, req);
  }

  @Post('create/:communityId')
  @UseGuards(AuthGuard)
  createPost(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Body() body: Record<string, unknown>,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsClient.createPost(communityId, body, req);
  }

  @Get(':id/likes')
  @UseGuards(AuthGuard)
  countLikes(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsClient.countLikes(id, req);
  }

  @Post('likes/add/:postId/:communityId')
  @UseGuards(AuthGuard)
  addLike(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsClient.addLike(postId, communityId, req);
  }

  @Delete('likes/remove/:postId')
  @UseGuards(AuthGuard)
  removeLike(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsClient.removeLike(postId, req);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  deletePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsClient.deletePost(id, req);
  }

  @Patch(':id/pin')
  @UseGuards(AuthGuard)
  pin(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsClient.pin(id, req);
  }

  @Delete(':id/pin')
  @UseGuards(AuthGuard)
  unpin(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.postsClient.unpin(id, req);
  }
}
