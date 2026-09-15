import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentsServiceDto } from './create-comments-service.dto';

export class UpdateCommentsServiceDto extends PartialType(CreateCommentsServiceDto) {}
