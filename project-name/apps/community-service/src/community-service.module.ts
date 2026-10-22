import { Module } from '@nestjs/common';
import { BansModule } from '../../bans-service/src/bans.module';
import { CommunitiesServiceModule } from '../../communities-service/src/communities-service.module';
import { CommunityMembersModule } from '../../community-members/src/community-members.module';

@Module({
  imports: [CommunitiesServiceModule, CommunityMembersModule, BansModule],
})
export class CommunityServiceModule {}
