import { Module } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { UserServiceController } from './user-service.controller';
import { UserRepository } from './repositories/user.repository';

@Module({
  controllers: [UserServiceController],
  providers: [UserServiceService, UserRepository],
})
export class UserServiceModule {}
