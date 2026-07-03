import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PrescriptionsService } from './prescriptions.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';

@ApiTags('prescriptions')
@ApiBearerAuth()
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles(UserRole.DOCTOR)
  create(@CurrentUser('id') userId: string, @Body() body: Record<string, unknown>) {
    return this.prescriptionsService.create(userId, body as Parameters<PrescriptionsService['create']>[1]);
  }

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.PATIENT, UserRole.ADMIN)
  findAll(@CurrentUser('id') userId: string, @CurrentUser('role') role: UserRole) {
    return this.prescriptionsService.findForUser(userId, role);
  }
}
