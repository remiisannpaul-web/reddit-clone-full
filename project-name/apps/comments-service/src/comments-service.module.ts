import { Module } from '@nestjs/common';
import { CommentsServiceService } from './comments-service.service';
import { CommentsServiceController } from './comments-service.controller';
import { BansCoreModule } from '../../bans-service/src/bans-core.module';
import { CommunityMembersCoreModule } from '../../community-members/src/community-members-core.module';
import { CommentsRepository } from './repositories/comments.repository';

@Module({
  imports: [BansCoreModule, CommunityMembersCoreModule],
  controllers: [CommentsServiceController],
  providers: [CommentsServiceService, CommentsRepository],
})
export class CommentsServiceModule {}
