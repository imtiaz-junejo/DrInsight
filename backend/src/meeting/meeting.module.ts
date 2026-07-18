import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { MeetingController } from './meeting.controller';
import { MeetingService } from './meeting.service';
import { LabOrdersService } from './lab-orders.service';
import { WebrtcIceService } from './webrtc-ice.service';
import { ConsultationGateway } from './consultation.gateway';
import { NotificationsModule } from '../notifications/notifications.module';
import { ClinicalRecordsModule } from '../clinical-records/clinical-records.module';
import { RedisModule } from '../redis/redis.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [JwtModule, ConfigModule, NotificationsModule, RedisModule, forwardRef(() => ClinicalRecordsModule), UsersModule],
  controllers: [MeetingController],
  providers: [MeetingService, LabOrdersService, WebrtcIceService, ConsultationGateway],
  exports: [MeetingService, WebrtcIceService],
})
export class MeetingModule {}
