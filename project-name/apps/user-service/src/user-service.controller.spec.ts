import { ForbiddenException } from '@nestjs/common';
import type { AuthenticatedRequest } from '@/auth.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceService } from './user-service.service';
import { UserServiceController } from './user-service.controller';

describe('UserServiceController', () => {
  let controller: UserServiceController;
  const users = {
    findOne: jest.fn(),
    modifyName: jest.fn(),
    modifyDisplayName: jest.fn(),
  };
  const request = (id: string) => ({ user: { id } }) as AuthenticatedRequest;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserServiceController],
      providers: [{ provide: UserServiceService, useValue: users }],
    }).compile();
    controller = module.get(UserServiceController);
  });

  it('looks up the authenticated user profile', () => {
    controller.findOne('user-1', request('user-1'));

    expect(users.findOne).toHaveBeenCalledWith('user-1');
  });

  it('rejects profile lookup for another user', () => {
    expect(() => controller.findOne('user-2', request('user-1'))).toThrow(
      ForbiddenException,
    );
    expect(users.findOne).not.toHaveBeenCalled();
  });

  it('updates the authenticated user name', () => {
    controller.updateUser(
      'user-1',
      { newName: ' New name ' },
      request('user-1'),
    );

    expect(users.modifyName).toHaveBeenCalledWith('New name', 'user-1');
  });

  it('rejects name changes for another user', () => {
    expect(() =>
      controller.updateUser('user-2', { newName: 'Name' }, request('user-1')),
    ).toThrow(ForbiddenException);
    expect(users.modifyName).not.toHaveBeenCalled();
  });

  it('updates the authenticated user display name', () => {
    controller.updateDisplayName(
      'user-1',
      { newDisplayName: ' Display ' },
      request('user-1'),
    );

    expect(users.modifyDisplayName).toHaveBeenCalledWith('Display', 'user-1');
  });
});
