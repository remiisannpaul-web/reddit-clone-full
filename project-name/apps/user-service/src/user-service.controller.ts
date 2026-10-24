import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { UserServiceService } from './user-service.service';
import { AuthGuard, type AuthenticatedRequest } from '@/auth.guard';
import { ForbiddenException } from '@nestjs/common';


@Controller('users')
@UseGuards(AuthGuard)
export class UserServiceController {
  constructor(private readonly users: UserServiceService) {}

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new ForbiddenException('You are not authorized');
    }
    return this.users.findOne(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() body: { newName: string; userId: string },
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You are not authorized');
    }
    return this.users.modifyName(body.newName, req.user.id);
  }

  @Patch(':id/display-name')
  updateDisplayName(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() body: { newDisplayName: string; userId: string },
  ) {
    if (req.user.id !== id) {
      throw new ForbiddenException('You are not authorized');
    }
    return this.users.modifyDisplayName(body.newDisplayName, req.user.id);
  }
}
