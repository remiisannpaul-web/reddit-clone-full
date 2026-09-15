import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RedisServiceService } from './redis-service.service';
import { CreateRedisServiceDto } from './dto/create-redis-service.dto';
import { UpdateRedisServiceDto } from './dto/update-redis-service.dto';

@Controller('redis-service')
export class RedisServiceController {
  constructor(private readonly redisServiceService: RedisServiceService) {}

  @Post()
  create(@Body() createRedisServiceDto: CreateRedisServiceDto) {
    return this.redisServiceService.create(createRedisServiceDto);
  }

  @Get()
  findAll() {
    return this.redisServiceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.redisServiceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRedisServiceDto: UpdateRedisServiceDto) {
    return this.redisServiceService.update(+id, updateRedisServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.redisServiceService.remove(+id);
  }
}
