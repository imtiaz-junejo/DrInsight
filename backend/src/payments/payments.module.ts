import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { InvoiceService } from './invoice.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [PrismaModule, NotificationsModule, EmailModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, InvoiceService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
