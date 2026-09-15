import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { auth } from '../lib/auth';
import { db } from '../lib/db';

jest.mock('../lib/auth', () => ({ auth: { api: { getSession: jest.fn() } } }));
jest.mock('../lib/db', () => ({
  db: { query: jest.fn(), connect: jest.fn() },
}));
jest.mock('../lib/redis', () => ({
  redis: { incr: jest.fn(), get: jest.fn(), expire: jest.fn() },
  connectRedis: jest.fn(),
}));

const communityId = '123e4567-e89b-42d3-a456-426614174000';
const postId = '123e4567-e89b-42d3-a456-426614174001';
const commentId = '123e4567-e89b-42d3-a456-426614174002';

describe('Migrated Nest API', () => {
  let app: INestApplication;
  const query = db.query as jest.Mock;
  const getSession = auth.api.getSession as unknown as jest.Mock;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    getSession.mockResolvedValue({ user: { id: 'actor' } });
    query.mockResolvedValue({ rows: [], rowCount: 0 });
  });

  it('starts with all moved modules registered', async () => {
    await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('rejects invalid community UUIDs before querying PostgreSQL', async () => {
    await request(app.getHttpServer())
      .get('/communities/undefined')
      .expect(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('loads a community with its UUID unchanged and forwards the session cookie', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ id: communityId, name: 'test' }] })
      .mockResolvedValueOnce({ rows: [] });
    const response = await request(app.getHttpServer())
      .get(`/communities/${communityId}`)
      .set('Cookie', 'better-auth.session_token=signed-token')
      .expect(200);
    expect(response.body.id).toBe(communityId);
    expect(query.mock.calls[0][1]).toEqual([communityId]);
    expect(getSession.mock.calls[0][0].headers.get('cookie')).toBe(
      'better-auth.session_token=signed-token',
    );
  });

  it('rejects anonymous writes', async () => {
    getSession.mockResolvedValue(null);
    await request(app.getHttpServer())
      .post('/communities')
      .send({ name: 'test' })
      .expect(401);
    await request(app.getHttpServer())
      .post(`/comments/post/${postId}`)
      .send({ content: 'test' })
      .expect(401);
    expect(query).not.toHaveBeenCalled();
  });

  it('creates the community and owner atomically using the authenticated actor', async () => {
    const client = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    };
    client.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: communityId, name: 'test' }] });
    (db.connect as jest.Mock).mockResolvedValue(client);
    await request(app.getHttpServer())
      .post('/communities')
      .send({ name: 'test', creator_id: 'spoofed' })
      .expect(201);
    expect(client.query.mock.calls[1][1][4]).toBe('actor');
    expect(client.query.mock.calls[2][1]).toEqual(['actor', communityId]);
    expect(client.query.mock.calls.map((call) => call[0])).toEqual(
      expect.arrayContaining(['BEGIN', 'COMMIT']),
    );
    expect(client.release).toHaveBeenCalled();
  });

  it('rolls back community creation if owner creation fails', async () => {
    const client = { query: jest.fn(), release: jest.fn() };
    client.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: communityId }] })
      .mockRejectedValueOnce(new Error('owner insert failed'))
      .mockResolvedValueOnce({ rows: [] });
    (db.connect as jest.Mock).mockResolvedValue(client);
    await request(app.getHttpServer())
      .post('/communities')
      .send({ name: 'test' })
      .expect(500);
    expect(client.query).toHaveBeenCalledWith('ROLLBACK');
    expect(client.release).toHaveBeenCalled();
  });

  it('rejects moderator changes by a non-owner', async () => {
    query.mockResolvedValue({ rows: [{ role: 'Member' }] });
    await request(app.getHttpServer())
      .patch(`/communities/${communityId}/members/target/moderator`)
      .send({ actorId: 'owner' })
      .expect(403);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('prevents profile edits for another user', async () => {
    await request(app.getHttpServer())
      .patch('/users/another-user')
      .send({ newName: 'test' })
      .expect(403);
    expect(query).not.toHaveBeenCalled();
  });

  it('keeps pagination and viewer parameters separate across requests', async () => {
    await request(app.getHttpServer())
      .get(`/posts/community/${communityId}`)
      .expect(200);
    getSession.mockResolvedValue({ user: { id: 'second-user' } });
    await request(app.getHttpServer())
      .get(
        `/posts/community/${communityId}?cursorCreatedAt=1700000000&cursorId=${postId}`,
      )
      .expect(200);
    const pageQueries = query.mock.calls.filter(([sql]) =>
      sql.includes('LIMIT'),
    );
    expect(pageQueries[0][1]).toEqual([communityId, 'actor', 26]);
    expect(pageQueries[1][1]).toEqual([
      communityId,
      'second-user',
      1700000000,
      postId,
      26,
    ]);
  });

  it('rejects incomplete pagination cursors', async () => {
    await request(app.getHttpServer())
      .get(`/posts/community/${communityId}?cursorId=${postId}`)
      .expect(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('enforces view bans before listing community posts', async () => {
    query.mockResolvedValue({ rows: [{ can_view: false }] });
    await request(app.getHttpServer())
      .get(`/posts/community/${communityId}`)
      .expect(403);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('checks votes against the stored post community rather than the URL hint', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ community_id: communityId }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ can_vote: false }] });
    await request(app.getHttpServer())
      .post(`/posts/likes/add/${postId}/${commentId}`)
      .expect(403);
    expect(query.mock.calls[2][1]).toEqual(['actor', communityId]);
    expect(query).toHaveBeenCalledTimes(3);
  });

  it('prevents a non-author and non-owner from deleting a comment', async () => {
    query
      .mockResolvedValueOnce({
        rows: [{ author_id: 'another-user', community_id: communityId }],
      })
      .mockResolvedValueOnce({ rows: [{ role: 'Member' }] });
    await request(app.getHttpServer())
      .delete(`/comments/${commentId}/${postId}`)
      .expect(403);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('returns the post envelope expected by the frontend', async () => {
    query
      .mockResolvedValueOnce({ rows: [{ community_id: communityId }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: postId, community_id: communityId }],
      });
    const response = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .expect(200);
    expect(response.body).toEqual({
      success: true,
      post: { id: postId, community_id: communityId },
    });
  });
});
