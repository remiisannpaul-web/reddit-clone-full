import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { AuthenticatedRequest } from '../../../../auth.guard';

@Injectable()
export class BansClient {
  private readonly baseUrl =
    process.env.COMMUNITY_SERVICE_URL ?? 'http://localhost:3003';

  constructor(private readonly http: HttpService) {}

  private sessionHeaders(req: AuthenticatedRequest) {
    const cookie = req.headers?.cookie;
    return cookie ? { headers: { Cookie: cookie } } : {};
  }

  get(communityId: string, userId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/communities/${communityId}/bans/${userId}`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  upsert(
    communityId: string,
    userId: string,
    body: Record<string, unknown>,
    req: AuthenticatedRequest,
  ) {
    return firstValueFrom(
      this.http.put(
        `${this.baseUrl}/communities/${communityId}/bans/${userId}`,
        body,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  remove(communityId: string, userId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.delete(
        `${this.baseUrl}/communities/${communityId}/bans/${userId}`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }
}
