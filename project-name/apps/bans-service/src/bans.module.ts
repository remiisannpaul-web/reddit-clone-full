import { Module } from '@nestjs/common';
import { BansCoreModule } from './bans-core.module';
import { BansController } from './bans.controller';
import { CommunityMembersCoreModule } from '../../community-members/src/community-members-core.module';

@Module({
  imports: [BansCoreModule, CommunityMembersCoreModule],
  controllers: [BansController],
})
export class BansModule {}
