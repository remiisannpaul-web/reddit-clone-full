import { Injectable } from '@nestjs/common';
import { db } from '../../../../lib/db';

type Community = {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
};

@Injectable()
export class CommunitiesRepository {
  async create(
    userId: string,
    name: string,
    description: string | null,
    bannerUrl: string | null,
    iconUrl: string | null,
  ) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const result = await client.query(
        `INSERT INTO communities (name, description, banner_url, icon_url, creator_id)
        VALUES ($1,$2,$3,$4,$5) RETURNING id, name`,
        [name, description, bannerUrl, iconUrl, userId],
      );
      const community = result.rows[0];
      await client.query(
        "INSERT INTO community_members (user_id, community_id, role) VALUES ($1,$2,'Owner')",
        [userId, community.id],
      );
      await client.query('COMMIT');
      return community;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAll(): Promise<Community[]> {
    const result = await db.query<Community>(
      'SELECT id, name, description, icon_url FROM communities ORDER BY created_at DESC',
    );

    return result.rows;
  }

  async findOne(id: string): Promise<Community | undefined> {
    const result = await db.query<Community>(
      'SELECT id, name, description, banner_url, icon_url, created_at FROM communities WHERE id = $1',
      [id],
    );

    return result.rows[0];
  }

  async findMember(communityId: string, userId: string): Promise<boolean> {
    const result = await db.query(
      `
				SELECT 1
				FROM community_members
				WHERE community_id = $1 AND user_id = $2
			`,
      [communityId, userId],
    );

    return result.rows.length > 0;
  }

  async addMember(userId: string, communityId: string): Promise<void> {
    await db.query(
      `
				INSERT INTO community_members (
					user_id,
					community_id,
					role
				)
				VALUES ($1, $2, $3)
                ON CONFLICT (user_id, community_id) DO NOTHING
			`,
      [userId, communityId, 'Member'],
    );
  }

  async removeMember(userId: string, communityId: string): Promise<void> {
    await db.query(
      `
				DELETE FROM community_members
				WHERE community_id = $1 AND user_id = $2
			`,
      [communityId, userId],
    );
  }
}
