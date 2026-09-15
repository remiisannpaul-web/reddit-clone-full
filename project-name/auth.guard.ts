import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { auth } from './lib/auth';

export type AuthenticatedRequest = Request & {
  user: { id: string; email?: string; name?: string };
};
export type SessionRequest = Request & { user?: AuthenticatedRequest['user'] };

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (typeof value === 'string') headers.set(key, value);
    }
    const session = await auth.api.getSession({ headers });
    request.user = session?.user
      ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        }
      : undefined;
    return true;
  }
}

@Injectable()
export class AuthGuard extends OptionalAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);
    if (!context.switchToHttp().getRequest<SessionRequest>().user)
      throw new UnauthorizedException('Invalid or missing session');
    return true;
  }
}
