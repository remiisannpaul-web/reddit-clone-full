import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { AuthenticatedRequest } from '../../../../auth.guard';

@Injectable()
export class UsersClient {
  private readonly baseUrl =
    process.env.CONTENT_SERVICE_URL ?? 'http://localhost:3005';

  constructor(private readonly http: HttpService) {}

  private sessionHeaders(req: AuthenticatedRequest) {
    const cookie = req.headers?.cookie;
    return cookie ? { headers: { Cookie: cookie } } : {};
  }

  findOne(id: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/users/${id}`, this.sessionHeaders(req)),
    ).then(({ data }) => data);
  }

  modifyName(newName: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.patch(
        `${this.baseUrl}/users/${req.user.id}`,
        { newName },
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  modifyDisplayName(newDisplayName: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.patch(
        `${this.baseUrl}/users/${req.user.id}/display-name`,
        { newDisplayName },
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }
}
