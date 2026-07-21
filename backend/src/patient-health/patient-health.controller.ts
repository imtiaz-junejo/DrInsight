import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole, VitalType } from '@prisma/client';
import { Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreatePatientVitalDto, RecordHealthToolResultDto } from './dto/patient-vital.dto';
import { PatientHealthService } from './patient-health.service';

function healthRoutes(service: PatientHealthService, userId: string) {
  return {
    getVitals: async () => {
      const vitals = await service.getLatestVitals(userId);
      return {
        data: service.formatVitalsForClient(vitals),
        lastRecordedAt: vitals[0]?.recordedAt ?? null,
      };
    },
    getVitalHistory: (type?: VitalType) => service.getVitalHistory(userId, type),
    createVital: (dto: CreatePatientVitalDto) => service.createVital(userId, dto),
    getHealthScore: () => service.getHealthScore(userId),
    getToolHistory: (limit?: number) => service.getHealthToolHistory(userId, +limit! || 20),
    recordToolResult: (dto: RecordHealthToolResultDto) => service.recordHealthToolResult(userId, dto),
  };
}

@ApiTags('patient-health')
@ApiBearerAuth()
@Controller('patients/me/health')
@Roles(UserRole.PATIENT)
export class PatientHealthController {
  constructor(private patientHealthService: PatientHealthService) {}

  @Get('vitals')
  async getVitals(@CurrentUser('id') userId: string) {
    return healthRoutes(this.patientHealthService, userId).getVitals();
  }

  @Get('vitals/history')
  getVitalHistory(@CurrentUser('id') userId: string, @Query('type') type?: VitalType) {
    return healthRoutes(this.patientHealthService, userId).getVitalHistory(type);
  }

  @Post('vitals')
  createVital(@CurrentUser('id') userId: string, @Body() dto: CreatePatientVitalDto) {
    return healthRoutes(this.patientHealthService, userId).createVital(dto);
  }

  @Get('score')
  getHealthScore(@CurrentUser('id') userId: string) {
    return healthRoutes(this.patientHealthService, userId).getHealthScore();
  }

  @Get('tools/history')
  getToolHistory(@CurrentUser('id') userId: string, @Query('limit') limit?: number) {
    return healthRoutes(this.patientHealthService, userId).getToolHistory(limit);
  }

  @Post('tools/results')
  recordToolResult(@CurrentUser('id') userId: string, @Body() dto: RecordHealthToolResultDto) {
    return healthRoutes(this.patientHealthService, userId).recordToolResult(dto);
  }
}

@ApiTags('doctor-health')
@ApiBearerAuth()
@Controller('doctors/me/health')
@Roles(UserRole.DOCTOR)
export class DoctorHealthController {
  constructor(private patientHealthService: PatientHealthService) {}

  @Get('vitals')
  async getVitals(@CurrentUser('id') userId: string) {
    return healthRoutes(this.patientHealthService, userId).getVitals();
  }

  @Get('vitals/history')
  getVitalHistory(@CurrentUser('id') userId: string, @Query('type') type?: VitalType) {
    return healthRoutes(this.patientHealthService, userId).getVitalHistory(type);
  }

  @Post('vitals')
  createVital(@CurrentUser('id') userId: string, @Body() dto: CreatePatientVitalDto) {
    return healthRoutes(this.patientHealthService, userId).createVital(dto);
  }

  @Get('score')
  getHealthScore(@CurrentUser('id') userId: string) {
    return healthRoutes(this.patientHealthService, userId).getHealthScore();
  }

  @Get('tools/history')
  getToolHistory(@CurrentUser('id') userId: string, @Query('limit') limit?: number) {
    return healthRoutes(this.patientHealthService, userId).getToolHistory(limit);
  }

  @Post('tools/results')
  recordToolResult(@CurrentUser('id') userId: string, @Body() dto: RecordHealthToolResultDto) {
    return healthRoutes(this.patientHealthService, userId).recordToolResult(dto);
  }
}
