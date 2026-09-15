import { Module } from '@nestjs/common';
import { CommunitiesServiceService } from './communities-service.service';
import { CommunitiesServiceController } from './communities-service.controller';
import { BansModule } from '../bans/bans.module';
import { CommunitiesRepository } from './repositories/communities.repository';
import { CommunityMembersModule } from '../community-members/community-members.module';
import { RateLimitModule } from '../rate-limit/rate-limit.module';

@Module({
  imports: [BansModule, RateLimitModule, CommunityMembersModule],
  controllers: [CommunitiesServiceController],
  providers: [CommunitiesServiceService, CommunitiesRepository],
})
export class CommunitiesServiceModule {}
