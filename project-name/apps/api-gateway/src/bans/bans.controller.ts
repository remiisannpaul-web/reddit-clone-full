import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../../../../auth.guard';
import { BansClient } from './bans.service';

@Controller('communities/:communityId/bans')
@UseGuards(AuthGuard)
export class BansController {
  constructor(private readonly bansClient: BansClient) {}

  @Get(':userId')
  get(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bansClient.get(communityId, userId, req);
  }

  @Put(':userId')
  upsert(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    return this.bansClient.upsert(communityId, userId, body, req);
  }

  @Delete(':userId')
  remove(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bansClient.remove(communityId, userId, req);
  }
}
