import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsClient } from './comments.service';

@Module({
  imports: [HttpModule],
  controllers: [CommentsController],
  providers: [CommentsClient],
})
export class CommentsModule {}
