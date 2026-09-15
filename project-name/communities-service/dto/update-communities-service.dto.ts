import { PartialType } from '@nestjs/mapped-types';
import { CreateCommunitiesServiceDto } from './create-communities-service.dto';

export class UpdateCommunitiesServiceDto extends PartialType(CreateCommunitiesServiceDto) {}
