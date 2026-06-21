import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentStatus, ConsultationType, UserRole } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.PATIENT)
  create(
    @CurrentUser('id') userId: string,
    @Body() body: {
      doctorId: string;
      scheduledAt: string;
      durationMinutes?: number;
      consultationType: ConsultationType;
      reason?: string;
    },
  ) {
    return this.appointmentsService.create(userId, body);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: AppointmentStatus,
  ) {
    return this.appointmentsService.findForUser(userId, role, { page: +page!, limit: +limit!, status });
  }

  @Patch(':id/status')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT)
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body('status') status: AppointmentStatus,
  ) {
    return this.appointmentsService.updateStatus(id, userId, role, status);
  }
}
