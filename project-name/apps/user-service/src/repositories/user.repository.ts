import { Inject, Injectable } from '@nestjs/common';
import {
  DATABASE_POOL,
  type DatabasePool,
} from '../../../../lib/database/database.module';

@Injectable()
export class UserRepository {
  constructor(@Inject(DATABASE_POOL) private readonly db: DatabasePool) {}

  async findOne(id: string) {
    const result = await this.db.query(
      'SELECT id, name, email, image, display_name, bio, karma FROM "user" WHERE id = $1',
      [id],
    );
    return result.rows[0] ?? null;
  }

  async updateName(newName: string, userId: string): Promise<number> {
    const result = await this.db.query(
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
    const result = await this.db.query(
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
