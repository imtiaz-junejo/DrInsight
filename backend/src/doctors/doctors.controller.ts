import { Controller, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorAvailability } from '@prisma/client';
import { DoctorsService } from './doctors.service';
import { Public } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';
import { UserRole } from '@prisma/client';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Public()
  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('specialty') specialty?: string,
    @Query('search') search?: string,
    @Query('availability') availability?: DoctorAvailability,
    @Query('minRating') minRating?: number,
  ) {
    return this.doctorsService.findAll({ page: +page!, limit: +limit!, specialty, search, availability, minRating: +minRating! });
  }

  @Public()
  @Get('specialties')
  getSpecialties() {
    return this.doctorsService.getSpecialties();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findById(id);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  updateProfile(@CurrentUser('id') userId: string, @Body() body: Record<string, unknown>) {
    return this.doctorsService.updateProfile(userId, body as Parameters<DoctorsService['updateProfile']>[1]);
  }
}
