import { Module } from '@nestjs/common';
import { CommunitiesServiceService } from './communities-service.service';
import { CommunitiesServiceController } from './communities-service.controller';
import { BansModule } from '../../bans-service/src/bans.module';
import { CommunitiesRepository } from './repositories/communities.repository';
import { CommunityMembersModule } from '../../community-members/src/community-members.module';
import { RateLimitModule } from '../../rate-limit/src/rate-limit.module';

@Module({
  imports: [BansModule, RateLimitModule, CommunityMembersModule],
  controllers: [CommunitiesServiceController],
  providers: [CommunitiesServiceService, CommunitiesRepository],
})
export class CommunitiesServiceModule {}
