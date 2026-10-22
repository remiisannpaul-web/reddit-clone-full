import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { BansModule } from './bans/bans.module';
import { CommentsModule } from './comments/comments.module';
import { CommunitiesModule } from './communities/communities.module';
import { MembersModule } from './members/members.module';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';
import { AuthProxyModule } from './auth/auth-proxy.module';

@Module({
  imports: [
    AuthProxyModule,
    UsersModule,
    CommunitiesModule,
    PostsModule,
    CommentsModule,
    MembersModule,
    BansModule,
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule {}
