import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserServiceModule } from '../user-service/user-service.module';
import { PostServiceModule } from '../post-service/post-service.module';
import { CommentsServiceModule } from '../comments-service/comments-service.module';
import { CommunitiesServiceModule } from '../communities-service/communities-service.module';
import { RequestIdMiddleware } from '@/lib/middleware';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '@/lib/logging.interceptor';

@Module({
  imports: [
    UserServiceModule,
    PostServiceModule,
    CommentsServiceModule,
    CommunitiesServiceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule 
implements NestModule
{
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(RequestIdMiddleware)
    .forRoutes('*');
  }
}