import { Test, TestingModule } from '@nestjs/testing';
import { RedisServiceController } from './redis-service.controller';
import { RedisServiceService } from './redis-service.service';

describe('RedisServiceController', () => {
  let controller: RedisServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedisServiceController],
      providers: [RedisServiceService],
    }).compile();

    controller = module.get<RedisServiceController>(RedisServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
