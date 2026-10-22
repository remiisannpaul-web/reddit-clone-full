import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../../auth.guard';
import { CommentsServiceService } from './comments-service.service';
import { CommentsServiceController } from './comments-service.controller';

describe('CommentsServiceController', () => {
  let controller: CommentsServiceController;
  const comments = {
    forPost: jest.fn(),
    create: jest.fn(),
    getCommentLikes: jest.fn(),
    addCommentLike: jest.fn(),
    removeCommentLike: jest.fn(),
    removeOneComment: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsServiceController],
      providers: [{ provide: CommentsServiceService, useValue: comments }],
    }).compile();
    controller = module.get(CommentsServiceController);
  });

  it('passes the authenticated user and post to the comment listing service', () => {
    const request = { user: { id: 'user-1' } } as AuthenticatedRequest;

    controller.list('post-1', request);

    expect(comments.forPost).toHaveBeenCalledWith('user-1', 'post-1');
  });

  it('passes comment content through with the authenticated user', () => {
    const request = { user: { id: 'user-1' } } as AuthenticatedRequest;

    controller.create('post-1', request, { content: 'A comment' });

    expect(comments.create).toHaveBeenCalledWith(
      'user-1',
      'post-1',
      'A comment',
    );
  });

  it('passes comment deletion identifiers to the service', () => {
    const request = { user: { id: 'user-1' } } as AuthenticatedRequest;

    controller.remove('comment-1', 'post-1', request);

    expect(comments.removeOneComment).toHaveBeenCalledWith(
      'comment-1',
      'post-1',
      'user-1',
    );
  });
});
