import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersClient } from './users.service';

@Module({
    imports: [HttpModule],
    controllers: [UsersController],
    providers: [UsersClient],
})
export class UsersModule {}