import { Test, TestingModule } from '@nestjs/testing';
import { CommunitiesServiceController } from './communities-service.controller';
import { CommunitiesServiceService } from './communities-service.service';

describe('CommunitiesServiceController', () => {
  let controller: CommunitiesServiceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunitiesServiceController],
      providers: [
        {
          provide: CommunitiesServiceService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CommunitiesServiceController>(CommunitiesServiceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
