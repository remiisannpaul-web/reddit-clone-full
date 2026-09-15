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
} from '../auth.guard';
import { PostServiceService } from './post-service.service';
import { UpdatePostServiceDto } from './dto/update-post-service.dto';
import { CreatePostServiceDto } from './dto/create-post-service.dto';


@Controller('posts')
export class PostServiceController {
  constructor(private readonly posts: PostServiceService) {}
  @Get('feed')
  @UseGuards(AuthGuard)
  findFeed(@Req() req: AuthenticatedRequest) {
    return this.posts.getAllRelatedPosts(req.user.id);
  }
  @Get('community/:communityId')
  @UseGuards(OptionalAuthGuard)
  getCommunityPosts(
    @Param('communityId', ParseUUIDPipe) id: string,
    @Query('cursorCreatedAt') cursorCreatedAt: string | undefined,
    @Query('cursorId') cursorId: string | undefined,
    @Req() req: SessionRequest,
  ) {
    return this.posts.getCommunityPosts(
      req.user?.id ?? null,
      id,
      cursorCreatedAt,
      cursorId,
    );
  }
  @Get('community/:communityId/all')
  @UseGuards(OptionalAuthGuard)
  all(
    @Param('communityId', ParseUUIDPipe) id: string,
    @Req() req: SessionRequest,
  ) {
    return this.posts.getSpecificPosts(req.user?.id ?? null, id);
  }
  @Get(':id')
  @UseGuards(AuthGuard)
  async findRelatedPosts(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return {
      success: true,
      post: await this.posts.getOnePost(id, req.user.id),
    };
  }
  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePostServiceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.posts.updatePost(id, body, req.user.id);
  }
  @Post('create/:communityId')
  @UseGuards(AuthGuard)
  createPost(
    @Param('communityId', ParseUUIDPipe) id: string,
    @Body() createuserDto: CreatePostServiceDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.posts.createPost(req.user.id, id, createuserDto);
  }
  @Get(':id/likes')
  @UseGuards(AuthGuard)
  countLikes(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.posts.countLikes(req.user.id, id);
  }
  @Post('likes/add/:postId/:communityId')
  @UseGuards(AuthGuard)
  addLike(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.posts.addLike(req.user.id, postId, communityId);
  }
  @Delete('likes/remove/:postId')
  @UseGuards(AuthGuard)
  removeLike(
    @Param('postId', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.posts.removeLike(req.user.id, id);
  }
  @Delete(':id')
  @UseGuards(AuthGuard)
  deletePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.posts.moderate(req.user.id, id, 'delete');
  }
  @Patch(':id/pin')
  @UseGuards(AuthGuard)
  pin(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.posts.moderate(req.user.id, id, 'pin');
  }
  @Delete(':id/pin')
  @UseGuards(AuthGuard)
  unpin(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.posts.moderate(req.user.id, id, 'unpin');
  }
}
