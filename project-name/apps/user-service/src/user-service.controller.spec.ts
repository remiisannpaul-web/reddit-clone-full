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

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserServiceController],
      providers: [{ provide: UserServiceService, useValue: users }],
    }).compile();
    controller = module.get(UserServiceController);
  });

  it('looks up a user by id', () => {
    controller.findOne('user-1');

    expect(users.findOne).toHaveBeenCalledWith('user-1');
  });

  it('rejects a name update when the body user id does not match the route', () => {
    expect(
      controller.updateUser('user-1', {
        userId: 'user-2',
        newName: 'Name',
      }),
    ).toEqual({ success: false, message: 'User ID mismatch' });
    expect(users.modifyName).not.toHaveBeenCalled();
  });

  it('passes a matching display-name update to the service', () => {
    controller.updateDisplayName('user-1', {
      userId: 'user-1',
      newDisplayName: 'Display',
    });

    expect(users.modifyDisplayName).toHaveBeenCalledWith('Display', 'user-1');
  });
});
