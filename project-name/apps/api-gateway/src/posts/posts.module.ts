import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsClient } from './posts.service';

@Module({
  imports: [HttpModule],
  controllers: [PostsController],
  providers: [PostsClient],
})
export class PostsModule {}
