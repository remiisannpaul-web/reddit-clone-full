import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsServiceService } from './comments-service.service';
import { AuthGuard, type AuthenticatedRequest } from '../../../auth.guard';

@Controller('comments')
@UseGuards(AuthGuard)
export class CommentsServiceController {
  constructor(private readonly comments: CommentsServiceService) {}
  @Get('post/:postId')
  list(
    @Param('postId', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.comments.forPost(req.user.id, id);
  }
  @Post('post/:postId')
  create(
    @Param('postId', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { content: unknown },
  ) {
    return this.comments.create(req.user.id, id, body.content);
  }
  @Get('likes/:commentId')
  likes(
    @Param('commentId', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.comments.getCommentLikes(id, req.user.id);
  }
  @Post('likes/add/:commentId')
  like(
    @Param('commentId', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.comments.addCommentLike(req.user.id, id);
  }
  @Delete('likes/:commentId')
  unlike(
    @Param('commentId', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.comments.removeCommentLike(req.user.id, id);
  }
  @Delete(':commentId/:postId')
  remove(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.comments.removeOneComment(commentId, postId, req.user.id);
  }
}
