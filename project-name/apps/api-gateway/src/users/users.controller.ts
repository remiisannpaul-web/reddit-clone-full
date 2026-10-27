import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersClient } from './users.service';
import { AuthGuard, type AuthenticatedRequest } from '../../../../auth.guard';
import { requiredText } from '../../../../lib/validation';

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersClient: UsersClient) {}

  private requireSelf(req: AuthenticatedRequest, userId: string) {
    if (req.user.id !== userId) {
      throw new ForbiddenException('Cannot access another user profile');
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    this.requireSelf(req, id);
    return this.usersClient.findOne(id, req);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { newName: unknown },
  ) {
    this.requireSelf(req, id);
    return this.usersClient.modifyName(
      requiredText(body.newName, 'name', 100),
      req,
    );
  }

  @Patch(':id/display-name')
  updateDisplayName(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { newDisplayName: unknown },
  ) {
    this.requireSelf(req, id);
    return this.usersClient.modifyDisplayName(
      requiredText(body.newDisplayName, 'display name', 100),
      req,
    );
  }
}
