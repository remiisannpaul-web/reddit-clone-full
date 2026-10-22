import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { AuthenticatedRequest } from '../../../../auth.guard';

@Injectable()
export class CommentsClient {
  private readonly baseUrl =
    process.env.CONTENT_SERVICE_URL ?? 'http://localhost:3005';

  constructor(private readonly http: HttpService) {}

  private sessionHeaders(req: AuthenticatedRequest) {
    const cookie = req.headers?.cookie;
    return cookie ? { headers: { Cookie: cookie } } : {};
  }

  list(postId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/comments/post/${postId}`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  create(
    postId: string,
    body: { content: unknown },
    req: AuthenticatedRequest,
  ) {
    return firstValueFrom(
      this.http.post(
        `${this.baseUrl}/comments/post/${postId}`,
        body,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  likes(commentId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/comments/likes/${commentId}`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  like(commentId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.post(
        `${this.baseUrl}/comments/likes/add/${commentId}`,
        undefined,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  unlike(commentId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.delete(
        `${this.baseUrl}/comments/likes/${commentId}`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  remove(commentId: string, postId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.delete(
        `${this.baseUrl}/comments/${commentId}/${postId}`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }
}
