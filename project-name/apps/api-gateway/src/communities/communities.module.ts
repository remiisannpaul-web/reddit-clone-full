import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CommunitiesController } from './communities.controller';
import { CommunitiesClient } from './communities.service';

@Module({
  imports: [HttpModule],
  controllers: [CommunitiesController],
  providers: [CommunitiesClient],
})
export class CommunitiesModule {}
