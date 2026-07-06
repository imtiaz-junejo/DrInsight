import { Body, Controller, Get, Patch, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AskDoctorService } from './ask-doctor.service';

@ApiTags('ask-doctor')
@Controller('ask-doctor')
export class AskDoctorController {
  constructor(private askDoctorService: AskDoctorService) {}

  @Public()
  @Get()
  findAnswered(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.askDoctorService.findAnswered({
      page: +page! || 1,
      limit: +limit! || 12,
      category,
      search,
    });
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.askDoctorService.getCategories();
  }

  @Public()
  @Post()
  submit(
    @Body()
    body: {
      category: string;
      question: string;
      name?: string;
      isAnonymous?: boolean;
    },
  ) {
    return this.askDoctorService.submit(body);
  }

  @Public()
  @Post(':id/helpful')
  markHelpful(@Param('id') id: string) {
    return this.askDoctorService.markHelpful(id);
  }

  @Get('pending')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  findPending(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.askDoctorService.findPending({ page: +page! || 1, limit: +limit! || 20 });
  }

  @Patch(':id/answer')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  answer(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('answer') answer: string,
  ) {
    return this.askDoctorService.answer(id, userId, answer);
  }
}
