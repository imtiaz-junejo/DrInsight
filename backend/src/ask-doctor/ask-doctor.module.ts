import { Module } from '@nestjs/common';
import { AskDoctorService } from './ask-doctor.service';
import { AskDoctorController } from './ask-doctor.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AskDoctorController],
  providers: [AskDoctorService],
  exports: [AskDoctorService],
})
export class AskDoctorModule {}
