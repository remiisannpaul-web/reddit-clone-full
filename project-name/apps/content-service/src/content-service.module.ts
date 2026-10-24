import { Module } from '@nestjs/common';
import { CommentsServiceModule } from '../../comments-service/src/comments-service.module';
import { PostServiceModule } from '../../post-service/src/post-service.module';
import { UserServiceModule } from '../../user-service/src/user-service.module';
import { DatabaseModule } from '../../../lib/database/database.module';

@Module({
  imports: [PostServiceModule, CommentsServiceModule, UserServiceModule, DatabaseModule],
})
export class ContentServiceModule {}
