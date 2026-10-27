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
import {
  AuthGuard,
  OptionalAuthGuard,
  type AuthenticatedRequest,
  type SessionRequest,
} from '../../../../auth.guard';
import { CommunitiesClient } from './communities.service';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesClient: CommunitiesClient) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Req() req: AuthenticatedRequest,
    @Body() body: Record<string, unknown>,
  ) {
    return this.communitiesClient.create(req.user.id, body, req);
  }

  @Get()
  findAll(@Req() req: SessionRequest) {
    return this.communitiesClient.findAll(req);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: SessionRequest) {
    return this.communitiesClient.findOne(id, req);
  }

  @Get(':id/membership')
  @UseGuards(OptionalAuthGuard)
  membership(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SessionRequest,
  ) {
    return this.communitiesClient.membership(id, req);
  }

  @Post('membership/join/regular/:communityId')
  @UseGuards(AuthGuard)
  join(
    @Param('communityId', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.communitiesClient.join(req.user.id, id, req);
  }

  @Delete('membership/leave/regular/:communityId')
  @UseGuards(AuthGuard)
  leave(
    @Param('communityId', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.communitiesClient.leave(req.user.id, id, req);
  }
}
