import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { AuthenticatedRequest } from '../../../../auth.guard';

@Injectable()
export class MembersClient {
  private readonly baseUrl =
    process.env.COMMUNITY_SERVICE_URL ?? 'http://localhost:3003';

  constructor(private readonly http: HttpService) {}

  private sessionHeaders(req: AuthenticatedRequest) {
    const cookie = req.headers?.cookie;
    return cookie ? { headers: { Cookie: cookie } } : {};
  }

  list(communityId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/communities/${communityId}/members`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  getOwner(communityId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/communities/${communityId}/members/owner`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  getRole(userId: string, communityId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/communities/${communityId}/members/${userId}/role`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  removeMember(userId: string, communityId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.delete(
        `${this.baseUrl}/communities/${communityId}/members/${userId}`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  setModerator(
    userId: string,
    communityId: string,
    promote: boolean,
    req: AuthenticatedRequest,
  ) {
    return firstValueFrom(
      this.http.patch(
        `${this.baseUrl}/communities/${communityId}/members/${userId}/moderator`,
        undefined,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }
}
