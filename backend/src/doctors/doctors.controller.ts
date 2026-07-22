import { Controller, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorAvailability } from '@prisma/client';
import { DoctorsService } from './doctors.service';
import { Public } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';
import { UserRole } from '@prisma/client';
import { AdminDoctorListQueryDto, AdminUpdateDoctorDto } from './dto/admin-doctor.dto';

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

  @Get('me/profile')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.doctorsService.findByUserId(userId);
  }

  @Get('me/patients')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  getMyPatients(@CurrentUser('id') userId: string) {
    return this.doctorsService.getPatients(userId);
  }

  @Get('me/schedules')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  getMySchedules(@CurrentUser('id') userId: string) {
    return this.doctorsService.getSchedules(userId);
  }

  @Patch('me/schedules')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  updateMySchedules(
    @CurrentUser('id') userId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.doctorsService.updateSchedules(userId, body as Parameters<DoctorsService['updateSchedules']>[1]);
  }

  @Get('manage')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findAllAdmin(@Query() query: AdminDoctorListQueryDto) {
    return this.doctorsService.findAllAdmin(query);
  }

  @Get('manage/:id/content')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getAdminContent(@Param('id') id: string) {
    return this.doctorsService.getAdminContent(id);
  }

  @Get('manage/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findAdminDetail(@Param('id') id: string) {
    return this.doctorsService.findAdminDetail(id);
  }

  @Public()
  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.doctorsService.findBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findById(id);
  }

  @Public()
  @Patch(':id/profile-feedback')
  submitProfileFeedback(
    @Param('id') id: string,
    @Body() body: { helpful: boolean; viewerKey?: string },
  ) {
    return this.doctorsService.submitProfileFeedback(id, body.helpful, body.viewerKey);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR)
  updateProfile(@CurrentUser('id') userId: string, @Body() body: Record<string, unknown>) {
    return this.doctorsService.updateProfile(userId, body as Parameters<DoctorsService['updateProfile']>[1]);
  }

  @Patch(':id/seo')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateDoctorSeo(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.doctorsService.updateAdminSeo(id, body as Parameters<DoctorsService['updateAdminSeo']>[1]);
  }

  @Patch(':id/admin')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateAdminDoctor(
    @Param('id') id: string,
    @CurrentUser('id') actorUserId: string,
    @Body() body: AdminUpdateDoctorDto,
  ) {
    return this.doctorsService.updateAdminDoctor(id, body, actorUserId);
  }

  @Patch(':id/admin/reset-seo')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  resetAdminSeo(@Param('id') id: string) {
    return this.doctorsService.resetAdminSeo(id);
  }
}
