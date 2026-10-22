import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './repositories/user.repository';
import { UserServiceService } from './user-service.service';

describe('UserServiceService', () => {
  let service: UserServiceService;
  const repository = {
    updateName: jest.fn(),
    updateDisplayName: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserServiceService,
        { provide: UserRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(UserServiceService);
  });

  it('returns success after updating a user name', async () => {
    repository.updateName.mockResolvedValue(1);

    await expect(service.modifyName('New name', 'user-1')).resolves.toEqual({
      success: true,
      message: 'Name updated',
    });
  });

  it('reports when a name update finds no user', async () => {
    repository.updateName.mockResolvedValue(0);

    await expect(service.modifyName('New name', 'missing')).resolves.toEqual({
      success: false,
      message: 'User not found',
    });
  });

  it('returns an explicit error result when the name update fails', async () => {
    repository.updateName.mockRejectedValue(new Error('database unavailable'));

    await expect(service.modifyName('New name', 'user-1')).resolves.toEqual({
      success: false,
      message: 'Database error',
    });
  });

  it('updates a display name and passes through user-not-found results', async () => {
    repository.updateDisplayName.mockResolvedValueOnce(1).mockResolvedValue(0);

    await expect(
      service.modifyDisplayName('Display name', 'user-1'),
    ).resolves.toEqual({ success: true, message: 'Display name updated' });
    await expect(
      service.modifyDisplayName('Display name', 'missing'),
    ).resolves.toEqual({ success: false, message: 'User not found' });
  });

  it('delegates user lookup to the repository', async () => {
    const user = { id: 'user-1', name: 'User' };
    repository.findOne.mockResolvedValue(user);

    await expect(service.findOne('user-1')).resolves.toBe(user);
    expect(repository.findOne).toHaveBeenCalledWith('user-1');
  });
});
