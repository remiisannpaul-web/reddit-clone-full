import { PartialType } from '@nestjs/mapped-types';
import { CreatePostServiceDto } from './create-post-service.dto';

export class UpdatePostServiceDto extends PartialType(CreatePostServiceDto) {}
