jest.mock('../db', () => ({
  db: { query: jest.fn(), end: jest.fn() },
}));
jest.mock('../redis', () => ({ redis: {}, connectRedis: jest.fn() }));

import { Test } from '@nestjs/testing';
import { DATABASE_POOL } from './database.module';
import { db } from '../db';
import { BansService } from '../../apps/bans-service/src/bans.service';
import { CommunityMembersService } from '../../apps/community-members/src/community-members.service';
import { CommunityServiceModule } from '../../apps/community-service/src/community-service.module';
import { ContentServiceModule } from '../../apps/content-service/src/content-service.module';
import { CommunitiesRepository } from '../../apps/communities-service/src/repositories/communities.repository';
import { PostRepository } from '../../apps/post-service/src/repositories/post.repository';
import { CommentsRepository } from '../../apps/comments-service/src/repositories/comments.repository';
import { UserRepository } from '../../apps/user-service/src/repositories/user.repository';

describe('global DatabaseModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(db.query).mockResolvedValue({ rows: [] } as never);
  });

  it.each([CommunityServiceModule, ContentServiceModule])(
    'injects the shared db throughout %p and closes it once',
    async (rootModule) => {
      const app = await Test.createTestingModule({
        imports: [rootModule],
      }).compile();

      try {
        expect(app.get(DATABASE_POOL)).toBe(db);
        await app.get(BansService).getActiveBan('user-1', 'community-1');
        await app.get(CommunityMembersService).getRole('user-1', 'community-1');

        if (rootModule === CommunityServiceModule) {
          await app.get(CommunitiesRepository).findAll();
          expect(db.query).toHaveBeenCalledTimes(3);
        } else {
          await app.get(PostRepository).getOnePost('post-1', 'user-1');
          await app.get(CommentsRepository).forPost('user-1', 'post-1');
          await app.get(UserRepository).findOne('user-1');
          expect(db.query).toHaveBeenCalledTimes(5);
        }
      } finally {
        await app.close();
      }

      expect(db.end).toHaveBeenCalledTimes(1);
    },
  );
});
