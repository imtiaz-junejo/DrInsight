import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommunicationController } from './communication.controller';
import { EmailTemplatesService } from './email-templates.service';
import { NotificationCampaignsService } from './notification-campaigns.service';
import { OtpTemplatesService } from './otp-templates.service';

@Module({
  imports: [EmailModule, NotificationsModule],
  controllers: [CommunicationController],
  providers: [EmailTemplatesService, OtpTemplatesService, NotificationCampaignsService],
})
export class CommunicationModule {}
