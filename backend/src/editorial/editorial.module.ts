import { Module } from '@nestjs/common';
import { EditorialController } from './editorial.controller';
import { EditorialService } from './editorial.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuditLogModule, NotificationsModule],
  controllers: [EditorialController],
  providers: [EditorialService],
  exports: [EditorialService],
})
export class EditorialModule {}
