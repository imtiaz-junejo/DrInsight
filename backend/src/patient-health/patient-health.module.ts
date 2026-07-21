import { Module } from '@nestjs/common';
import { DoctorHealthController, PatientHealthController } from './patient-health.controller';
import { PatientHealthService } from './patient-health.service';

@Module({
  controllers: [PatientHealthController, DoctorHealthController],
  providers: [PatientHealthService],
  exports: [PatientHealthService],
})
export class PatientHealthModule {}
