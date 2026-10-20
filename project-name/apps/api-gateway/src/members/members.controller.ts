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
import { AuthGuard, type AuthenticatedRequest } from '../../../../auth.guard';
import { MembersClient } from './members.service';

@Controller('communities/:communityId/members')
@UseGuards(AuthGuard)
export class MembersController {
  constructor(private readonly membersClient: MembersClient) {}

  @Get()
  list(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.membersClient.list(communityId, req);
  }

  @Get('owner')
  owner(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.membersClient.getOwner(communityId, req);
  }

  @Get(':userId/role')
  role(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.membersClient.getRole(userId, communityId, req);
  }

  @Delete(':userId')
  remove(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.membersClient.removeMember(userId, communityId, req);
  }

  @Patch(':userId/moderator')
  promote(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.membersClient.setModerator(userId, communityId, true, req);
  }

  @Delete(':userId/moderator')
  demote(
    @Param('communityId', ParseUUIDPipe) communityId: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.membersClient.setModerator(userId, communityId, false, req);
  }
}
