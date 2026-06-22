import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/auth.decorators';
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
}
