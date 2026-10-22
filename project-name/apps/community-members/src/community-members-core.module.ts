import { Module } from '@nestjs/common';
import { CommunityMembersService } from './community-members.service';

@Module({
  providers: [CommunityMembersService],
  exports: [CommunityMembersService],
})
export class CommunityMembersCoreModule {}
