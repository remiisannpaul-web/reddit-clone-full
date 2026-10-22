import { Module } from '@nestjs/common';
import { CommentsServiceModule } from '../../comments-service/src/comments-service.module';
import { PostServiceModule } from '../../post-service/src/post-service.module';
import { UserServiceModule } from '../../user-service/src/user-service.module';

@Module({
  imports: [PostServiceModule, CommentsServiceModule, UserServiceModule],
})
export class ContentServiceModule {}
