jest.mock('@nestjs/axios', () => ({
  HttpService: class HttpService {},
}));

import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedRequest } from '../../../../auth.guard';
import { UsersClient } from './users.service';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let module: TestingModule;
  let controller: UsersController;
  const usersClient = {
    findOne: jest.fn(),
    modifyName: jest.fn(),
    modifyDisplayName: jest.fn(),
  };
  const req = {
    user: { id: 'user-1' },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    jest.clearAllMocks();
    module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersClient, useValue: usersClient }],
    }).compile();
    controller = module.get(UsersController);
  });

  afterEach(async () => {
    await module.close();
  });

  it('passes the authenticated request to user lookup', () => {
    controller.findOne('user-1', req);

    expect(usersClient.findOne).toHaveBeenCalledWith('user-1', req);
  });

  it('passes the authenticated request to name updates', () => {
    controller.updateUser('user-1', req, { newName: 'New name' });

    expect(usersClient.modifyName).toHaveBeenCalledWith('New name', req);
  });

  it('passes the authenticated request to display-name updates', () => {
    controller.updateDisplayName('user-1', req, {
      newDisplayName: 'Display name',
    });

    expect(usersClient.modifyDisplayName).toHaveBeenCalledWith(
      'Display name',
      req,
    );
  });

  it('rejects requests to access another user profile', () => {
    expect(() => controller.findOne('user-2', req)).toThrow(ForbiddenException);
  });
});
