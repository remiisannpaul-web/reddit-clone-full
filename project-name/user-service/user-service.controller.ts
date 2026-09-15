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
import { UserServiceService } from './user-service.service';
import { AuthGuard, type AuthenticatedRequest } from '../auth.guard';
import { requiredText } from '../lib/validation';

@Controller('users')
@UseGuards(AuthGuard)
export class UserServiceController {
  constructor(private readonly users: UserServiceService) {}
  private requireSelf(req: AuthenticatedRequest, userId: string) {
    if (req.user.id !== userId)
      throw new ForbiddenException('Cannot access another user profile');
  }
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    this.requireSelf(req, id);
    return this.users.findOne(id);
  }
  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { newName: unknown },
  ) {
    this.requireSelf(req, id);
    return this.users.modifyName(
      requiredText(body.newName, 'name', 100),
      req.user.id,
    );
  }
  @Patch(':id/display-name')
  updateDisplayName(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { newDisplayName: unknown },
  ) {
    this.requireSelf(req, id);
    return this.users.modifyDisplayName(
      requiredText(body.newDisplayName, 'display name', 100),
      req.user.id,
    );
  }
}
