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
import { AuthGuard, type AuthenticatedRequest } from '../../../auth.guard';
import { BansService } from './bans.service';
import { CommunityMembersService } from '../../community-members/src/community-members.service';

@Controller('communities/:communityId/bans')
@UseGuards(AuthGuard)
export class BansController {
  constructor(
    private readonly bans: BansService,
    private readonly members: CommunityMembersService,
  ) {}
  @Get(':userId')
  async get(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== userId)
      await this.members.requireOwner(req.user.id, communityId);
    return this.bans.getActiveBan(userId, communityId);
  }
  @Put(':userId')
  upsert(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    return this.bans.upsert(req.user.id, userId, communityId, body);
  }
  @Delete(':userId')
  remove(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.bans.remove(req.user.id, userId, communityId);
  }
}
