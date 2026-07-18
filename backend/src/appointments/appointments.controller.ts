import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentStatus, ConsultationType, UserRole } from '@prisma/client';
import { AppointmentsService } from './appointments.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';
import {
  CreateManualAppointmentDto,
  RescheduleAppointmentDto,
  UpdateAppointmentStatusDto,
} from './dto/doctor-appointment.dto';

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
    @Query('kind') kind?: 'PHYSICAL' | 'ONLINE',
    @Query('range') range?: 'today' | 'upcoming' | 'past',
    @Query('manualOnly') manualOnly?: string,
    @Query('search') search?: string,
  ) {
    return this.appointmentsService.findForUser(userId, role, {
      page: +page!,
      limit: +limit!,
      status,
      kind,
      range,
      manualOnly: manualOnly === 'true',
      search,
    });
  }

  @Get('doctor/counts')
  @Roles(UserRole.DOCTOR)
  getDoctorCounts(@CurrentUser('id') userId: string) {
    return this.appointmentsService.getDoctorCounts(userId);
  }

  @Get('patient/counts')
  @Roles(UserRole.PATIENT)
  getPatientCounts(@CurrentUser('id') userId: string) {
    return this.appointmentsService.getPatientCounts(userId);
  }

  @Post('manual')
  @Roles(UserRole.DOCTOR)
  createManual(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateManualAppointmentDto,
  ) {
    return this.appointmentsService.createManual(userId, dto);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.appointmentsService.findById(id, role);
  }

  @Patch(':id/status')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT)
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: UpdateAppointmentStatusDto,
  ) {
    return this.appointmentsService.updateStatus(id, userId, role, dto.status, dto.cancelReason);
  }

  @Patch(':id/reschedule')
  @Roles(UserRole.DOCTOR, UserRole.ADMIN, UserRole.PATIENT)
  reschedule(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.reschedule(id, userId, role, dto.scheduledAt, dto.reason);
  }
}
