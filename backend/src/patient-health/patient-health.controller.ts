import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole, VitalType } from '@prisma/client';
import { Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreatePatientVitalDto, RecordHealthToolResultDto } from './dto/patient-vital.dto';
import { PatientHealthService } from './patient-health.service';

@ApiTags('patient-health')
@ApiBearerAuth()
@Controller('patients/me/health')
@Roles(UserRole.PATIENT)
export class PatientHealthController {
  constructor(private patientHealthService: PatientHealthService) {}

  @Get('vitals')
  async getVitals(@CurrentUser('id') userId: string) {
    const vitals = await this.patientHealthService.getLatestVitals(userId);
    return {
      data: this.patientHealthService.formatVitalsForClient(vitals),
      lastRecordedAt: vitals[0]?.recordedAt ?? null,
    };
  }

  @Get('vitals/history')
  getVitalHistory(@CurrentUser('id') userId: string, @Query('type') type?: VitalType) {
    return this.patientHealthService.getVitalHistory(userId, type);
  }

  @Post('vitals')
  createVital(@CurrentUser('id') userId: string, @Body() dto: CreatePatientVitalDto) {
    return this.patientHealthService.createVital(userId, dto);
  }

  @Get('score')
  getHealthScore(@CurrentUser('id') userId: string) {
    return this.patientHealthService.getHealthScore(userId);
  }

  @Get('tools/history')
  getToolHistory(@CurrentUser('id') userId: string, @Query('limit') limit?: number) {
    return this.patientHealthService.getHealthToolHistory(userId, +limit! || 20);
  }

  @Post('tools/results')
  recordToolResult(@CurrentUser('id') userId: string, @Body() dto: RecordHealthToolResultDto) {
    return this.patientHealthService.recordHealthToolResult(userId, dto);
  }
}
