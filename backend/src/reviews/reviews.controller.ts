import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ReviewsService } from './reviews.service';
import { Public } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  create(@CurrentUser('id') userId: string, @Body() body: { doctorId: string; appointmentId?: string; rating: number; comment?: string }) {
    return this.reviewsService.create(userId, body);
  }

  @Public()
  @Get('recent')
  findRecent(@Query('limit') limit?: number) {
    return this.reviewsService.findRecent(+limit! || 6);
  }

  @Public()
  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.reviewsService.findByDoctor(doctorId, +page! || 1, +limit! || 10);
  }
}
