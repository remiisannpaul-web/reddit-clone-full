import { Injectable } from '@nestjs/common';
import { db } from '../../../../lib/db';

type PostUpdateFields = {
  title?: string;
  content?: string;
};

type CommunityPost = {
  id: string;
  title: string;
  content: string | null;
  created_at: Date;
  is_pinned: boolean;
  author_id: string;
  community_id: string;
  author_name: string;
  like_count: number;
  had_liked: boolean;
  created_at_epoch: number;
};

export type CommunityPostsPage = {
  posts: CommunityPost[];
  nextCursor: { createdAt: number; id: string } | null;
};

const PAGE_SIZE = 25;

@Injectable()
export class PostRepository {
  async getSpecificPosts(communityId: string, userId: string | null) {
    const request = await db.query(
      `
      SELECT
        p.id::text AS id,
        p.title,
        p.content,
        p.created_at,
        p.is_pinned,
        c.id::text AS community_id,
        c.name AS community_name,
        u.name AS author_name,
        (
          SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.id
        ) AS like_count,
        CASE
          WHEN $2::text IS NULL THEN false
          ELSE EXISTS (
            SELECT 1 FROM post_likes pl
            WHERE pl.post_id = p.id AND pl.user_id = $2
          )
        END AS had_liked
      FROM posts p
      JOIN communities c ON c.id = p.community_id
      JOIN "user" u ON p.author_id = u.id
      WHERE c.id = $1
      ORDER BY
        p.is_pinned DESC,
        p.pinned_position ASC NULLS LAST,
        p.created_at DESC
    `,
      [communityId, userId],
    );
    return request.rows;
  }

  async countLikes(postId: string) {
    const result = await db.query(
      'SELECT COUNT(*)::int AS count FROM post_likes WHERE post_id = $1',
      [postId],
    );
    return result.rows[0]?.count ?? 0;
  }

  async moderate(
    postId: string,
    communityId: string,
    action: 'delete' | 'pin' | 'unpin',
  ) {
    if (action === 'delete') {
      await db.query('DELETE FROM posts WHERE id = $1', [postId]);
    } else if (action === 'unpin') {
      await db.query(
        'UPDATE posts SET is_pinned = false, pinned_position = NULL WHERE id = $1',
        [postId],
      );
    } else {
      await db.query(
        `UPDATE posts SET is_pinned = true,
        pinned_position = (SELECT COALESCE(MAX(pinned_position), 0) + 1 FROM posts WHERE community_id = $2 AND is_pinned = true)
        WHERE id = $1`,
        [postId, communityId],
      );
    }
  }

  async getCommunityPosts(
    userId: string | null,
    communityId: string,
    cursorCreatedAt?: string,
    cursorId?: string,
  ): Promise<CommunityPostsPage> {
    const hasCursor = Boolean(cursorCreatedAt && cursorId);
    const select = `
      SELECT
        p.id::text AS id,
        p.title,
        p.content,
        p.created_at,
        p.is_pinned,
        p.author_id,
        p.community_id::text AS community_id,
        u.name AS author_name,
        (SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = p.id) AS like_count,
        EXISTS (
          SELECT 1 FROM post_likes pl
          WHERE pl.post_id = p.id AND pl.user_id = $2
        ) AS had_liked,
        EXTRACT(EPOCH FROM p.created_at) AS created_at_epoch
      FROM posts p
      JOIN "user" u ON p.author_id = u.id
    `;
    const query = hasCursor
      ? `${select}
          WHERE p.community_id = $1
          AND (p.created_at, p.id) < (to_timestamp($3)::timestamp, $4::uuid)
          ORDER BY p.created_at DESC, p.id DESC
          LIMIT $5`
      : `${select}
          WHERE p.community_id = $1
          ORDER BY p.created_at DESC, p.id DESC
          LIMIT $3`;
    const values = hasCursor
      ? [communityId, userId, Number(cursorCreatedAt), cursorId, PAGE_SIZE + 1]
      : [communityId, userId, PAGE_SIZE + 1];

    const { rows } = await db.query<CommunityPost>(query, values);
    const posts = rows.slice(0, PAGE_SIZE);
    const lastPost = posts.at(-1);

    return {
      posts,
      nextCursor:
        rows.length > PAGE_SIZE && lastPost
          ? { createdAt: Number(lastPost.created_at_epoch), id: lastPost.id }
          : null,
    };
  }

  async getAllRelatedPosts(userId: string) {
    const result = await db.query(
      `
        SELECT
          posts.id::text AS id,
          posts.title,
          posts.content,
          posts.created_at,
          communities.id::text AS community_id,
          communities.name AS community_name,
          (
            SELECT COUNT(*)::int FROM post_likes pl WHERE pl.post_id = posts.id
          ) AS like_count,
          EXISTS (
            SELECT 1 FROM post_likes pl
            WHERE pl.post_id = posts.id AND pl.user_id = $1
          ) AS had_liked
        FROM posts
        JOIN communities ON posts.community_id = communities.id
        WHERE posts.community_id IN (
          SELECT community_id FROM community_members WHERE user_id = $1
        )
        AND NOT EXISTS (
          SELECT 1 FROM banned_users b
          WHERE b.user_id = $1
            AND b.community_id = posts.community_id
            AND (b.expires_at IS NULL OR b.expires_at > NOW())
            AND b.can_view = false
        )
        ORDER BY
          posts.is_pinned DESC,
          posts.pinned_position ASC NULLS LAST,
          posts.created_at DESC
      `,
      [userId],
    );

    return result.rows;
  }

  async findPostCommunityId(postId: string): Promise<string | undefined> {
    const result = await db.query<{ community_id: string }>(
      'SELECT community_id FROM posts WHERE id = $1',
      [postId],
    );

    return result.rows[0]?.community_id;
  }

  async updatePost(postId: string, fields: PostUpdateFields): Promise<number> {
    const updateFields: string[] = [];
    const values: string[] = [];

    if (fields.title !== undefined) {
      updateFields.push(`title = $${values.length + 1}`);
      values.push(fields.title);
    }

    if (fields.content !== undefined) {
      updateFields.push(`content = $${values.length + 1}`);
      values.push(fields.content);
    }

    values.push(postId);
    const result = await db.query(
      `
        UPDATE posts
        SET ${updateFields.join(', ')}
        WHERE id = $${values.length}
      `,
      values,
    );

    return result.rowCount ?? 0;
  }

  async getOnePost(postId: string, userId: string) {
    const result = await db.query(
      `
        SELECT
          p.id::text AS id,
          p.title,
          p.content,
          p.author_id,
          p.community_id::text AS community_id,
          p.created_at,
          c.name AS community_name,
          u.name AS author_name,
          EXISTS (
            SELECT 1 FROM post_likes
            WHERE post_id = p.id AND user_id = $1
          ) AS had_liked
        FROM posts p
        JOIN communities c ON c.id = p.community_id
        JOIN "user" u ON p.author_id = u.id
        WHERE p.id = $2
        LIMIT 1
      `,
      [userId, postId],
    );

    return result.rows[0] ?? null;
  }

  async createPost(
    userId: string,
    communityId: string,
    title: string,
    content: string,
  ) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const postResult = await client.query(
        `
          INSERT INTO posts (title, content, author_id, community_id)
          VALUES ($1, $2, $3, $4)
          RETURNING id::text AS id, title, content, author_id, community_id::text AS community_id, created_at
        `,
        [title, content, userId, communityId],
      );

      await client.query('UPDATE "user" SET karma = karma + 5 WHERE id = $1', [
        userId,
      ]);
      await client.query('COMMIT');

      return postResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async addLike(userId: string, postId: string): Promise<number> {
    const result = await db.query(
      `
        INSERT INTO post_likes (user_id, post_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, post_id) DO NOTHING
      `,
      [userId, postId],
    );

    return result.rowCount ?? 0;
  }

  async removeLike(userId: string, postId: string): Promise<number> {
    const result = await db.query(
      `
        DELETE FROM post_likes
        WHERE user_id = $1 AND post_id = $2
      `,
      [userId, postId],
    );

    return result.rowCount ?? 0;
  }
}
