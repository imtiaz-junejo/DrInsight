import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { SiteAdminController } from './site-admin.controller';
import { SiteCmsService } from './site-cms.service';
import { SiteConfigurationService } from './site-configuration.service';
import { TrafficAnalyticsService } from './traffic-analytics.service';
import { ConsultationAnalyticsService } from './consultation-analytics.service';

@Module({
  imports: [PrismaModule, AuditLogModule, NewsletterModule],
  controllers: [SiteAdminController],
  providers: [
    SiteCmsService,
    SiteConfigurationService,
    TrafficAnalyticsService,
    ConsultationAnalyticsService,
  ],
  exports: [
    SiteCmsService,
    SiteConfigurationService,
    TrafficAnalyticsService,
    ConsultationAnalyticsService,
  ],
})
export class SiteAdminModule {}