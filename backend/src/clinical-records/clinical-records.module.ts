import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ClinicalRecordsController } from './clinical-records.controller';
import { PatientClinicalNotesController } from './patient-clinical-notes.controller';
import { ClinicalRecordsService } from './clinical-records.service';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [ClinicalRecordsController, PatientClinicalNotesController],
  providers: [ClinicalRecordsService],
  exports: [ClinicalRecordsService],
})
export class ClinicalRecordsModule {}
