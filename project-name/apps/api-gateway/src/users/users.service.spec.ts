jest.mock('@nestjs/axios', () => ({
  HttpService: class HttpService {},
}));

import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import type { AuthenticatedRequest } from '../../../../auth.guard';
import { UsersClient } from './users.service';

describe('UsersClient', () => {
  let client: UsersClient;
  const http = {
    get: jest.fn(),
    patch: jest.fn(),
  };
  const req = {
    user: { id: 'user-1' },
    headers: { cookie: 'session=secret' },
  } as AuthenticatedRequest;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersClient, { provide: HttpService, useValue: http }],
    }).compile();
    client = module.get(UsersClient);
  });

  it('forwards the request cookie when fetching a user', async () => {
    http.get.mockReturnValue(of({ data: { id: 'user-1' } }));

    await expect(client.findOne('user-1', req)).resolves.toEqual({
      id: 'user-1',
    });
    expect(http.get).toHaveBeenCalledWith(
      'http://localhost:3005/users/user-1',
      { headers: { Cookie: 'session=secret' } },
    );
  });

  it('forwards the request cookie when updating a user name', async () => {
    http.patch.mockReturnValue(of({ data: { success: true } }));

    await expect(client.modifyName('New name', req)).resolves.toEqual({
      success: true,
    });
    expect(http.patch).toHaveBeenCalledWith(
      'http://localhost:3005/users/user-1',
      { newName: 'New name' },
      { headers: { Cookie: 'session=secret' } },
    );
  });

  it('forwards the request cookie when updating a display name', async () => {
    http.patch.mockReturnValue(of({ data: { success: true } }));

    await expect(
      client.modifyDisplayName('Display name', req),
    ).resolves.toEqual({ success: true });
    expect(http.patch).toHaveBeenCalledWith(
      'http://localhost:3005/users/user-1/display-name',
      { newDisplayName: 'Display name' },
      { headers: { Cookie: 'session=secret' } },
    );
  });
});
