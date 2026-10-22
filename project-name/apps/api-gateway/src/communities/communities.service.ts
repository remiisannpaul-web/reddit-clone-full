import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type {
  SessionRequest,
  AuthenticatedRequest,
} from '../../../../auth.guard';

@Injectable()
export class CommunitiesClient {
  private readonly baseUrl =
    process.env.COMMUNITY_SERVICE_URL ?? 'http://localhost:3003';

  constructor(private readonly http: HttpService) {}

  private sessionHeaders(req?: SessionRequest | AuthenticatedRequest) {
    const cookie = req?.headers?.cookie;
    return cookie ? { headers: { Cookie: cookie } } : {};
  }

  create(
    userId: string,
    body: Record<string, unknown>,
    req: AuthenticatedRequest,
  ) {
    return firstValueFrom(
      this.http.post(
        `${this.baseUrl}/communities`,
        body,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  findAll() {
    return firstValueFrom(this.http.get(`${this.baseUrl}/communities`)).then(
      ({ data }) => data,
    );
  }

  findOne(id: string, req?: SessionRequest) {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/communities/${id}`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  membership(id: string, req?: SessionRequest) {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/communities/${id}/membership`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  join(userId: string, communityId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.post(
        `${this.baseUrl}/communities/membership/join/regular/${communityId}`,
        { userId },
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  leave(userId: string, communityId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.delete(
        `${this.baseUrl}/communities/membership/leave/regular/${communityId}`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }
}
