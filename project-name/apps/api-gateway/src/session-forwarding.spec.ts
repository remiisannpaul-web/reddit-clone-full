jest.mock('@nestjs/axios', () => ({
  HttpService: class HttpService {},
}));

import type { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import type { AuthenticatedRequest, SessionRequest } from '../../../auth.guard';
import { BansClient } from './bans/bans.service';
import { CommentsClient } from './comments/comments.service';
import { CommunitiesClient } from './communities/communities.service';
import { CommunitiesController } from './communities/communities.controller';
import { MembersClient } from './members/members.service';
import { PostsClient } from './posts/posts.service';
import { UsersClient } from './users/users.service';

describe('gateway session cookie forwarding', () => {
  const http = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };
  const transport = http as unknown as HttpService;
  const bans = new BansClient(transport);
  const comments = new CommentsClient(transport);
  const communities = new CommunitiesClient(transport);
  const members = new MembersClient(transport);
  const posts = new PostsClient(transport);
  const users = new UsersClient(transport);
  const cookie =
    'better-auth.session_token=session-1; better-auth.session_data=data-1';
  const req = {
    user: { id: 'user-1' },
    headers: { cookie },
  } as AuthenticatedRequest;

  beforeEach(() => {
    for (const method of Object.values(http)) {
      method.mockReset().mockReturnValue(of({ data: { success: true } }));
    }
  });

  const routes: [string, (req: AuthenticatedRequest) => Promise<unknown>][] = [
    ['users.findOne', (req) => users.findOne('user-1', req)],
    ['users.modifyName', (req) => users.modifyName('Name', req)],
    [
      'users.modifyDisplayName',
      (req) => users.modifyDisplayName('Display', req),
    ],
    ['communities.create', (req) => communities.create('user-1', {}, req)],
    ['communities.findAll', (req) => communities.findAll(req)],
    ['communities.findOne', (req) => communities.findOne('community-1', req)],
    [
      'communities.membership',
      (req) => communities.membership('community-1', req),
    ],
    [
      'communities.join',
      (req) => communities.join('user-1', 'community-1', req),
    ],
    [
      'communities.leave',
      (req) => communities.leave('user-1', 'community-1', req),
    ],
    ['posts.findFeed', (req) => posts.findFeed(req)],
    [
      'posts.getCommunityPosts',
      (req) => posts.getCommunityPosts('community-1', '123', 'post-1', req),
    ],
    [
      'posts.getSpecificPosts',
      (req) => posts.getSpecificPosts('community-1', req),
    ],
    ['posts.findOne', (req) => posts.findOne('post-1', req)],
    ['posts.update', (req) => posts.update('post-1', {}, req)],
    ['posts.createPost', (req) => posts.createPost('community-1', {}, req)],
    ['posts.countLikes', (req) => posts.countLikes('post-1', req)],
    ['posts.addLike', (req) => posts.addLike('post-1', 'community-1', req)],
    ['posts.removeLike', (req) => posts.removeLike('post-1', req)],
    ['posts.deletePost', (req) => posts.deletePost('post-1', req)],
    ['posts.pin', (req) => posts.pin('post-1', req)],
    ['posts.unpin', (req) => posts.unpin('post-1', req)],
    ['comments.list', (req) => comments.list('post-1', req)],
    [
      'comments.create',
      (req) => comments.create('post-1', { content: 'Hi' }, req),
    ],
    ['comments.likes', (req) => comments.likes('comment-1', req)],
    ['comments.like', (req) => comments.like('comment-1', req)],
    ['comments.unlike', (req) => comments.unlike('comment-1', req)],
    ['comments.remove', (req) => comments.remove('comment-1', 'post-1', req)],
    ['members.list', (req) => members.list('community-1', req)],
    ['members.getOwner', (req) => members.getOwner('community-1', req)],
    ['members.getRole', (req) => members.getRole('user-1', 'community-1', req)],
    [
      'members.removeMember',
      (req) => members.removeMember('user-1', 'community-1', req),
    ],
    [
      'members.setModerator',
      (req) => members.setModerator('user-1', 'community-1', true, req),
    ],
    ['bans.get', (req) => bans.get('community-1', 'user-1', req)],
    ['bans.upsert', (req) => bans.upsert('community-1', 'user-1', {}, req)],
    ['bans.remove', (req) => bans.remove('community-1', 'user-1', req)],
  ];

  it.each(routes)(
    '%s forwards all incoming session cookies',
    async (_, call) => {
      await expect(call(req)).resolves.toEqual({ success: true });

      const calls = Object.values(http).flatMap((method) => method.mock.calls);
      expect(calls).toHaveLength(1);
      expect(calls[0].at(-1)).toEqual({ headers: { Cookie: cookie } });
    },
  );

  it.each(routes)('%s omits the cookie header when absent', async (_, call) => {
    await call({ user: req.user, headers: {} } as AuthenticatedRequest);

    const calls = Object.values(http).flatMap((method) => method.mock.calls);
    expect(calls).toHaveLength(1);
    expect(calls[0].at(-1)).toEqual({});
  });

  it('forwards cookies from the public community-list controller to the service', async () => {
    const controller = new CommunitiesController(communities);

    await controller.findAll({ headers: { cookie } } as SessionRequest);

    expect(http.get).toHaveBeenCalledWith(
      expect.stringMatching(/\/communities$/),
      { headers: { Cookie: cookie } },
    );
  });

  it('keeps cookies specific to each request', async () => {
    await communities.findAll(req);
    await communities.findAll({ headers: {} } as SessionRequest);

    expect(http.get.mock.calls[0].at(-1)).toEqual({
      headers: { Cookie: cookie },
    });
    expect(http.get.mock.calls[1].at(-1)).toEqual({});
  });
});
