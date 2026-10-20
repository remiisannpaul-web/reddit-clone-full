import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BansService } from '../../bans-service/src/bans.service';
import { CommunitiesRepository } from './repositories/communities.repository';
import { CommunityMembersService } from '../../community-members/src/community-members.service';
import { optionalText, requiredText } from '../../../lib/validation';

@Injectable()
export class CommunitiesServiceService {
  constructor(
    private readonly bansService: BansService,
    private readonly communitiesRepository: CommunitiesRepository,
    private readonly members: CommunityMembersService,
  ) {}

  create(userId: string, body: Record<string, unknown>) {
    return this.communitiesRepository.create(
      userId,
      requiredText(body.name, 'name', 100),
      optionalText(body.description, 'description'),
      optionalText(body.banner_url, 'banner URL', 2048),
      optionalText(body.icon_url, 'icon URL', 2048),
    );
  }

  findAll() {
    return this.communitiesRepository.findAll();
  }

  async findOne(id: string, userId: string | null = null) {
    const community = await this.communitiesRepository.findOne(id);
    if (!community) throw new NotFoundException('Community not found');
    if (userId) await this.bansService.banPermissions(userId, id, 'view');
    return community;
  }

  async isMember(userId: string | null, communityId: string) {
    return userId
      ? this.communitiesRepository.findMember(communityId, userId)
      : false;
  }

  async regularJoinCommunity(userId: string, communityId: string) {
    await this.findOne(communityId, userId);
    await this.communitiesRepository.addMember(userId, communityId);
    return { success: true };
  }

  async leaveCommunity(userId: string, communityId: string) {
    if ((await this.members.getRole(userId, communityId))?.role === 'Owner')
      throw new ForbiddenException('The owner cannot leave their community');
    await this.communitiesRepository.removeMember(userId, communityId);
    return { success: true };
  }
}
