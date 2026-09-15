import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth.guard';
import { CommunityMembersService } from './community-members.service';

@Controller('communities/:communityId/members')
@UseGuards(AuthGuard)
export class CommunityMembersController {
  constructor(private readonly members: CommunityMembersService) {}

  @Get()
  list(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.members.list(communityId, req.user.id);
  }

  @Get('owner')
  owner(@Param('communityId', ParseUUIDPipe) communityId: string) {
    return this.members.getOwner(communityId);
  }

  @Get(':userId/role')
  role(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
  ) {
    return this.members.getRole(userId, communityId);
  }

  @Delete(':userId')
  remove(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.members.removeMember(req.user.id, userId, communityId);
  }

  @Patch(':userId/moderator')
  promote(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.members.setModerator(req.user.id, userId, communityId, true);
  }

  @Delete(':userId/moderator')
  demote(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.members.setModerator(req.user.id, userId, communityId, false);
  }
}
