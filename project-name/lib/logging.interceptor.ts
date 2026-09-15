// logging.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor
  implements NestInterceptor
{
  private readonly logger =
    new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request =
      context
        .switchToHttp()
        .getRequest();

    const response =
      context
        .switchToHttp()
        .getResponse();

    const startedAt = Date.now();

    const {
      method,
      originalUrl,
    } = request;

    const requestId =
      request.requestId;

    return next.handle().pipe(
      tap(() => {
        const duration =
          Date.now() - startedAt;

        this.logger.log({
          requestId,
          method,
          path: originalUrl,
          statusCode:
            response.statusCode,
          durationMs: duration,
        });
      }),
    );
  }
}