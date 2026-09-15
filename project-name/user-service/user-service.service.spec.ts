import { Test, TestingModule } from '@nestjs/testing';
import { UserServiceService } from './user-service.service';
import { UserRepository } from './repositories/user.repository';

describe('UserServiceService', () => {
  let service: UserServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserServiceService,
        { provide: UserRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<UserServiceService>(UserServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
