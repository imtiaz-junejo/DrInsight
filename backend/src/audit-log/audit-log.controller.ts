import { Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditCategory, AuditResult, AuditSeverity, UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/auth.decorators';
import { AuditLogService } from './audit-log.service';

@ApiTags('audit-log')
@ApiBearerAuth()
@Controller('audit-logs')
@Roles(UserRole.ADMIN)
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: AuditCategory,
    @Query('severity') severity?: AuditSeverity,
    @Query('result') result?: AuditResult,
  ) {
    return this.auditLogService.findAll({
      page: +page! || 1,
      limit: +limit! || 20,
      category,
      severity,
      result,
    });
  }

  @Patch('alerts/acknowledge')
  acknowledgeAlert() {
    return this.auditLogService.acknowledgeLatestAlert();
  }
}
