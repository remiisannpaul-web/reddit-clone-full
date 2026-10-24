import { Inject, Injectable } from '@nestjs/common';
import {
  DATABASE_POOL,
  type DatabasePool,
} from '../../../../lib/database/database.module';

type CommentDeletionRow = {
  author_id: string;
  community_id: string;
};

@Injectable()
export class CommentsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly db: DatabasePool) {}

  async forPost(userId: string, postId: string) {
    const result = await this.db.query(
      `SELECT c.id, c.content, c.created_at, c.author_id, c.post_id, u.name,
      EXISTS (SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = $1) AS liked_comment
      FROM comments c JOIN "user" u ON c.author_id = u.id WHERE c.post_id = $2 ORDER BY c.created_at ASC`,
      [userId, postId],
    );
    return result.rows;
  }

  async create(userId: string, postId: string, content: string) {
    await this.db.query(
      'INSERT INTO comments (content, author_id, post_id) VALUES ($1,$2,$3)',
      [content, userId, postId],
    );
  }

  async findCommentForDeletion(
    commentId: string,
    postId: string,
  ): Promise<CommentDeletionRow | undefined> {
    const result = await this.db.query<CommentDeletionRow>(
      `
        SELECT c.author_id, p.community_id
        FROM comments c
        JOIN posts p ON p.id = c.post_id
        WHERE c.id = $1 AND c.post_id = $2
      `,
      [commentId, postId],
    );

    return result.rows[0];
  }

  async deleteComment(commentId: string): Promise<number> {
    const result = await this.db.query('DELETE FROM comments WHERE id = $1', [
      commentId,
    ]);
    return result.rowCount ?? 0;
  }

  async countLikes(commentId: string): Promise<string> {
    const result = await this.db.query<{ count: string }>(
      'SELECT COUNT(*) FROM comment_likes WHERE comment_id = $1',
      [commentId],
    );

    return result.rows[0].count;
  }

  async addLike(userId: string, commentId: string): Promise<number> {
    const result = await this.db.query(
      `
        INSERT INTO comment_likes (user_id, comment_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, comment_id) DO NOTHING
      `,
      [userId, commentId],
    );

    return result.rowCount ?? 0;
  }

  async removeLike(userId: string, commentId: string): Promise<number> {
    const result = await this.db.query(
      `
        DELETE FROM comment_likes
        WHERE user_id = $1 AND comment_id = $2
      `,
      [userId, commentId],
    );

    return result.rowCount ?? 0;
  }
}
