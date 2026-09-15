import { Injectable } from '@nestjs/common';
import { db } from '../../lib/db';

@Injectable()
export class UserRepository {
  async findOne(id: string) {
    const result = await db.query(
      'SELECT id, name, email, image, display_name, bio, karma FROM "user" WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  }

  async updateName(newName: string, userId: string): Promise<number> {
    const result = await db.query(
      `
        UPDATE "user"
        SET name = $1
        WHERE id = $2
      `,
      [newName, userId],
    );

    return result.rowCount ?? 0;
  }

  async updateDisplayName(
    newDisplayName: string,
    userId: string,
  ): Promise<number> {
    const result = await db.query(
      `
        UPDATE "user"
        SET display_name = $1
        WHERE id = $2
      `,
      [newDisplayName, userId],
    );

    return result.rowCount ?? 0;
  }
}
