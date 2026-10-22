import type { AuthenticatedRequest } from '../../../auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { PostServiceController } from './post-service.controller';
import { PostServiceService } from './post-service.service';

describe('PostServiceController', () => {
  let controller: PostServiceController;
  let service: PostServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostServiceController],
      providers: [
        {
          provide: PostServiceService,
          useValue: {
            getAllRelatedPosts: jest.fn(),
            updatePost: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PostServiceController>(PostServiceController);
    service = module.get<PostServiceService>(PostServiceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should update a post via patch', async () => {
    const result = { success: true, message: 'Post updated' };
    jest.spyOn(service, 'updatePost').mockResolvedValue(result);

    await expect(
      controller.update('post-123', { title: 'Updated title' }, {
        user: { id: 'author' },
      } as AuthenticatedRequest),
    ).resolves.toEqual(result);
    expect(service.updatePost).toHaveBeenCalledWith(
      'post-123',
      { title: 'Updated title' },
      'author',
    );
  });
});
