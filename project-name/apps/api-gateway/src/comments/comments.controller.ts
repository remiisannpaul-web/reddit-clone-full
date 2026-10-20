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
import { AuthGuard, type AuthenticatedRequest } from '../../../../auth.guard';
import { CommentsClient } from './comments.service';

@Controller('comments')
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(private readonly commentsClient: CommentsClient) {}

  @Get('post/:postId')
  list(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsClient.list(postId, req);
  }

  @Post('post/:postId')
  create(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { content: unknown },
  ) {
    return this.commentsClient.create(postId, body, req);
  }

  @Get('likes/:commentId')
  likes(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsClient.likes(commentId, req);
  }

  @Post('likes/add/:commentId')
  like(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsClient.like(commentId, req);
  }

  @Delete('likes/:commentId')
  unlike(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsClient.unlike(commentId, req);
  }

  @Delete(':commentId/:postId')
  remove(
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Param('postId', ParseUUIDPipe) postId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.commentsClient.remove(commentId, postId, req);
  }
}
