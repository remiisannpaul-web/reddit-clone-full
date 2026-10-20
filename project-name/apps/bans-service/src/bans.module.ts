import { Module } from '@nestjs/common';
import { BansService } from './bans.service';
import { BansController } from './bans.controller';
import { CommunityMembersModule } from '../../community-members/src/community-members.module';

@Module({
  imports: [CommunityMembersModule],
  controllers: [BansController],
  providers: [BansService],
  exports: [BansService],
})
export class BansModule {}
