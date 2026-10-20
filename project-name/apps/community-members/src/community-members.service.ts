import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { db } from '../../../lib/db';

@Injectable()
export class CommunityMembersService {
  async getRole(userId: string | null, communityId: string) {
    if (!userId) return null;
    const result = await db.query(
      'SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2',
      [communityId, userId],
    );
    return result.rows[0] ?? null;
  }

  async requireOwner(actorId: string, communityId: string) {
    if ((await this.getRole(actorId, communityId))?.role !== 'Owner')
      throw new ForbiddenException('Community owner required');
  }

  async getOwner(communityId: string) {
    const result = await db.query(
      "SELECT user_id FROM community_members WHERE community_id = $1 AND role = 'Owner'",
      [communityId],
    );
    return result.rows[0] ?? null;
  }

  async list(communityId: string, actorId: string) {
    await this.requireOwner(actorId, communityId);
    const result = await db.query(
      `
      SELECT u.id, u.name, c.role,
        b.can_post AS ban_can_post, b.can_comment AS ban_can_comment,
        b.can_vote AS ban_can_vote, b.can_view AS ban_can_view,
        b.expires_at AS ban_expires_at, b.reason AS ban_reason,
        (b.user_id IS NOT NULL AND (b.expires_at IS NULL OR b.expires_at > NOW())) AS is_banned
      FROM "user" u JOIN community_members c ON u.id = c.user_id
      LEFT JOIN banned_users b ON b.user_id = u.id AND b.community_id = c.community_id
      WHERE c.community_id = $1`,
      [communityId],
    );
    return result.rows;
  }

  async removeMember(actorId: string, userId: string, communityId: string) {
    await this.requireOwner(actorId, communityId);
    const result = await db.query(
      "DELETE FROM community_members WHERE user_id = $1 AND community_id = $2 AND role = 'Member'",
      [userId, communityId],
    );
    if (!result.rowCount) throw new NotFoundException('Member not found');
    return { success: true };
  }

  async setModerator(
    actorId: string,
    userId: string,
    communityId: string,
    promote: boolean,
  ) {
    await this.requireOwner(actorId, communityId);
    const result = await db.query(
      'UPDATE community_members SET role = $3 WHERE user_id = $1 AND community_id = $2 AND role = $4',
      [
        userId,
        communityId,
        promote ? 'Moderator' : 'Member',
        promote ? 'Member' : 'Moderator',
      ],
    );
    if (!result.rowCount)
      throw new NotFoundException('Member with the required role not found');
    return { success: true };
  }
}
