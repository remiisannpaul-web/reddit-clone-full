import { Module } from '@nestjs/common';
import { CommunitiesServiceService } from './communities-service.service';
import { CommunitiesServiceController } from './communities-service.controller';
import { CommunitiesRepository } from './repositories/communities.repository';
import { CommunityMembersCoreModule } from '../../community-members/src/community-members-core.module';
import { BansCoreModule } from '../../bans-service/src/bans-core.module';

@Module({
  imports: [BansCoreModule, CommunityMembersCoreModule],
  controllers: [CommunitiesServiceController],
  providers: [CommunitiesServiceService, CommunitiesRepository],
})
export class CommunitiesServiceModule {}
