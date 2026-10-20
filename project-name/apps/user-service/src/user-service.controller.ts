import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UserServiceService } from './user-service.service';

@Controller('users')
export class UserServiceController {
  constructor(private readonly users: UserServiceService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.users.findOne(id);
  }

  @Patch(':id')
  updateUser(
    @Param('id') id: string,
    @Body() body: { newName: string; userId: string },
  ) {
    if (body.userId !== id) {
      return { success: false, message: 'User ID mismatch' };
    }
    return this.users.modifyName(body.newName, body.userId);
  }

  @Patch(':id/display-name')
  updateDisplayName(
    @Param('id') id: string,
    @Body() body: { newDisplayName: string; userId: string },
  ) {
    if (body.userId !== id) {
      return { success: false, message: 'User ID mismatch' };
    }
    return this.users.modifyDisplayName(body.newDisplayName, body.userId);
  }
}
