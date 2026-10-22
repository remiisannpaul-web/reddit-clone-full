import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type {
  AuthenticatedRequest,
  SessionRequest,
} from '../../../../auth.guard';

@Injectable()
export class PostsClient {
  private readonly baseUrl =
    process.env.CONTENT_SERVICE_URL ?? 'http://localhost:3005';

  constructor(private readonly http: HttpService) {}

  private sessionHeaders(req?: SessionRequest | AuthenticatedRequest) {
    const cookie = req?.headers?.cookie;
    return cookie ? { headers: { Cookie: cookie } } : {};
  }

  findFeed(req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/posts/feed`, this.sessionHeaders(req)),
    ).then(({ data }) => data);
  }

  getCommunityPosts(
    communityId: string,
    cursorCreatedAt?: string,
    cursorId?: string,
    req?: SessionRequest,
  ) {
    const params = new URLSearchParams();
    if (cursorCreatedAt) params.set('cursorCreatedAt', cursorCreatedAt);
    if (cursorId) params.set('cursorId', cursorId);
    const query = params.toString();
    const url = `${this.baseUrl}/posts/community/${communityId}${query ? `?${query}` : ''}`;
    return firstValueFrom(this.http.get(url, this.sessionHeaders(req))).then(
      ({ data }) => data,
    );
  }

  getSpecificPosts(communityId: string, req?: SessionRequest) {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/posts/community/${communityId}/all`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  findOne(id: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.get(`${this.baseUrl}/posts/${id}`, this.sessionHeaders(req)),
    ).then(({ data }) => data);
  }

  update(id: string, body: Record<string, unknown>, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.patch(
        `${this.baseUrl}/posts/${id}`,
        body,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  createPost(
    communityId: string,
    body: Record<string, unknown>,
    req: AuthenticatedRequest,
  ) {
    return firstValueFrom(
      this.http.post(
        `${this.baseUrl}/posts/create/${communityId}`,
        body,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  countLikes(id: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.get(
        `${this.baseUrl}/posts/${id}/likes`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  addLike(postId: string, communityId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.post(
        `${this.baseUrl}/posts/likes/add/${postId}/${communityId}`,
        undefined,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  removeLike(postId: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.delete(
        `${this.baseUrl}/posts/likes/remove/${postId}`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  deletePost(id: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.delete(`${this.baseUrl}/posts/${id}`, this.sessionHeaders(req)),
    ).then(({ data }) => data);
  }

  pin(id: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.patch(
        `${this.baseUrl}/posts/${id}/pin`,
        undefined,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }

  unpin(id: string, req: AuthenticatedRequest) {
    return firstValueFrom(
      this.http.delete(
        `${this.baseUrl}/posts/${id}/pin`,
        this.sessionHeaders(req),
      ),
    ).then(({ data }) => data);
  }
}
