import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersClient } from './members.service';

@Module({
  imports: [HttpModule],
  controllers: [MembersController],
  providers: [MembersClient],
})
export class MembersModule {}
