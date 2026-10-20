import { PartialType } from '@nestjs/mapped-types';
import { CreateRedisServiceDto } from './create-redis-service.dto';

export class UpdateRedisServiceDto extends PartialType(CreateRedisServiceDto) {}
