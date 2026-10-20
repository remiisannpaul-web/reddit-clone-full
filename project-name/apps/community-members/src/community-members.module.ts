import { Module } from '@nestjs/common';
import { CommunityMembersService } from './community-members.service';
import { CommunityMembersController } from './community-members.controller';

@Module({
  controllers: [CommunityMembersController],
  providers: [CommunityMembersService],
  exports: [CommunityMembersService],
})
export class CommunityMembersModule {}
