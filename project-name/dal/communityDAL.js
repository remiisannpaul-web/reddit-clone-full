import { db } from "../lib/db";

export async function removeModerator({ moderatorId, communityId, actorId }) {
    const result = await db.query(
        `
        UPDATE community_members AS target
        SET role = 'Member'
        WHERE target.community_id = $1
          AND target.user_id = $2
          AND target.role = 'Moderator'
          AND EXISTS (
              SELECT 1
              FROM community_members owner
              WHERE owner.community_id = target.community_id
                AND owner.user_id = $3
                AND owner.role = 'Owner'
          )
        RETURNING *
        `,
        [communityId, moderatorId, actorId]
    );

    if (result.rowCount === 0) {
        throw new Error("Forbidden");
    }
}