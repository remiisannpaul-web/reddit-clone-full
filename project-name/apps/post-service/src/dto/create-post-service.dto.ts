import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePostServiceDto { 
  @IsString()
  @IsNotEmpty()
  title: string;
  
  @IsString()
  @IsNotEmpty()
  content: string;
}
