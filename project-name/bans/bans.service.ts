import {
  Injectable,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { db } from '../lib/db';
import { CommunityMembersService } from '../community-members/community-members.service';
import { optionalText } from '../lib/validation';

type BanPermission = 'post' | 'comment' | 'vote' | 'view';
type BanPermissionColumn = 'can_post' | 'can_comment' | 'can_vote' | 'can_view';

type BanRow = {
  can_post: boolean | null;
  can_comment: boolean | null;
  can_vote: boolean | null;
  can_view: boolean | null;
  reason: string | null;
  expires_at: string | null;
};

@Injectable()
export class BansService {
  constructor(private readonly members: CommunityMembersService) {}

  readonly PERMISSION_COLUMNS: Record<BanPermission, BanPermissionColumn> = {
    post: 'can_post',
    comment: 'can_comment',
    vote: 'can_vote',
    view: 'can_view',
  };

  readonly PERMISSION_MESSAGES: Record<BanPermissionColumn, string> = {
    can_post: 'You are banned from posting in this community.',
    can_comment: 'You are banned from commenting in this community.',
    can_vote: 'You are banned from voting in this community.',
    can_view: 'You are banned from viewing this community.',
  };

  public async banPermissions(
    userId: string,
    communityId: string,
    permission: BanPermission,
  ) {
    const column: BanPermissionColumn = this.PERMISSION_COLUMNS[permission];
    const ban = await this.getActiveBan(userId, communityId);

    if (!ban) {
      return null;
    }

    if (!ban[column]) {
      throw new ForbiddenException(this.PERMISSION_MESSAGES[column]);
    }

    return true;
  }

  async getActiveBan(
    userId: string,
    communityId: string,
  ): Promise<BanRow | null> {
    const result = await db.query<BanRow>(
      `
        SELECT can_post, can_comment, can_vote, can_view, reason, expires_at
        FROM banned_users
        WHERE user_id = $1 AND community_id = $2
          AND (expires_at IS NULL OR expires_at > NOW())
      `,
      [userId, communityId],
    );

    return result.rows[0] ?? null;
  }

  async getCommunityIdForPost(postId: string) {
    const result = await db.query(
      'SELECT community_id FROM posts WHERE id = $1',
      [postId],
    );
    return result.rows[0]?.community_id ?? null;
  }

  async getCommunityIdForComment(commentId: string) {
    const result = await db.query(
      'SELECT p.community_id FROM comments c JOIN posts p ON p.id = c.post_id WHERE c.id = $1',
      [commentId],
    );
    return result.rows[0]?.community_id ?? null;
  }

  async upsert(
    actorId: string,
    userId: string,
    communityId: string,
    body: Record<string, unknown>,
  ) {
    await this.members.requireOwner(actorId, communityId);
    if ((await this.members.getRole(userId, communityId))?.role === 'Owner')
      throw new ForbiddenException('Community owners cannot be banned');
    for (const key of ['can_post', 'can_comment', 'can_vote', 'can_view']) {
      if (typeof body[key] !== 'boolean')
        throw new BadRequestException(`Invalid ${key}`);
    }
    const expiresAt = optionalText(body.expires_at, 'expiration');
    if (expiresAt && !Number.isFinite(Date.parse(expiresAt)))
      throw new BadRequestException('Invalid expiration');
    await db.query(
      `INSERT INTO banned_users (user_id, community_id, can_post, can_comment, can_vote, can_view, expires_at, banned_by, reason)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (user_id, community_id) DO UPDATE SET
        can_post = EXCLUDED.can_post, can_comment = EXCLUDED.can_comment,
        can_vote = EXCLUDED.can_vote, can_view = EXCLUDED.can_view,
        expires_at = EXCLUDED.expires_at, banned_by = EXCLUDED.banned_by, reason = EXCLUDED.reason`,
      [
        userId,
        communityId,
        body.can_post,
        body.can_comment,
        body.can_vote,
        body.can_view,
        expiresAt,
        actorId,
        optionalText(body.reason, 'reason', 500),
      ],
    );
    return { success: true };
  }

  async remove(actorId: string, userId: string, communityId: string) {
    await this.members.requireOwner(actorId, communityId);
    await db.query(
      'DELETE FROM banned_users WHERE user_id = $1 AND community_id = $2',
      [userId, communityId],
    );
    return { success: true };
  }
}
