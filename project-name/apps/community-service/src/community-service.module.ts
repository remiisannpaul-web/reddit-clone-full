import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../lib/database/database.module';
import { BansModule } from '../../bans-service/src/bans.module';
import { CommunitiesServiceModule } from '../../communities-service/src/communities-service.module';
import { CommunityMembersModule } from '../../community-members/src/community-members.module';

@Module({
  imports: [
    DatabaseModule,
    CommunitiesServiceModule,
    CommunityMembersModule,
    BansModule,
  ],
})
export class CommunityServiceModule {}
