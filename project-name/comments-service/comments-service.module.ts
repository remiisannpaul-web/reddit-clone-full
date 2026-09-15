import { CommunityMembersModule } from '../community-members/community-members.module';
import { Module } from '@nestjs/common';
import { CommentsServiceService } from './comments-service.service';
import { CommentsServiceController } from './comments-service.controller';
import { BansModule } from '../bans/bans.module';
import { CommentsRepository } from './repositories/comments.repository';

@Module({
  imports: [BansModule, CommunityMembersModule],
  controllers: [CommentsServiceController],
  providers: [CommentsServiceService, CommentsRepository],
})
export class CommentsServiceModule {}
