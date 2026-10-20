import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommunitiesServiceService } from './communities-service.service';
import {
  AuthGuard,
  OptionalAuthGuard,
  type AuthenticatedRequest,
  type SessionRequest,
} from '../../../auth.guard';

@Controller('communities')
export class CommunitiesServiceController {
  constructor(private readonly communities: CommunitiesServiceService) {}
  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    return this.communities.create(req.user.id, body);
  }
  @Get()
  findAll() {
    return this.communities.findAll();
  }
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: SessionRequest) {
    return this.communities.findOne(id, req.user?.id);
  }
  @Get(':id/membership')
  @UseGuards(OptionalAuthGuard)
  membership(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SessionRequest,
  ) {
    return this.communities.isMember(req.user?.id ?? null, id);
  }
  @Post('membership/join/regular/:communityId')
  @UseGuards(AuthGuard)
  join(
    @Param('communityId', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.communities.regularJoinCommunity(req.user.id, id);
  }
  @Delete('membership/leave/regular/:communityId')
  @UseGuards(AuthGuard)
  leave(
    @Param('communityId', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.communities.leaveCommunity(req.user.id, id);
  }
}
