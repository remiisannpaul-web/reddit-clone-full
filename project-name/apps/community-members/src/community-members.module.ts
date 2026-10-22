import { Module } from '@nestjs/common';
import { CommunityMembersCoreModule } from './community-members-core.module';
import { CommunityMembersController } from './community-members.controller';

@Module({
  imports: [CommunityMembersCoreModule],
  controllers: [CommunityMembersController],
})
export class CommunityMembersModule {}
