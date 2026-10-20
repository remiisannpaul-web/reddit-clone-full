import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RateLimitService } from './rate-limit.service';
import { CreateRateLimitDto } from './dto/create-rate-limit.dto';
import { UpdateRateLimitDto } from './dto/update-rate-limit.dto';

@Controller('rate-limit')
export class RateLimitController {
  constructor(private readonly rateLimitService: RateLimitService) {}
}
