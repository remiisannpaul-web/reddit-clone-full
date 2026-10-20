import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BansController } from './bans.controller';
import { BansClient } from './bans.service';

@Module({
  imports: [HttpModule],
  controllers: [BansController],
  providers: [BansClient],
})
export class BansModule {}
