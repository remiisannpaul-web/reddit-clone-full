import { Module } from '@nestjs/common';
import { CommunityMembersCoreModule } from '../../community-members/src/community-members-core.module';
import { BansService } from './bans.service';

@Module({
  imports: [CommunityMembersCoreModule],
  providers: [BansService],
  exports: [BansService],
})
export class BansCoreModule {}
