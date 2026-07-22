import { Controller, Get, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PatientsService } from './patients.service';
import { Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AdminPatientListQueryDto, AdminUpdatePatientDto } from './dto/admin-patient.dto';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get('manage')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findAllAdmin(@Query() query: AdminPatientListQueryDto) {
    return this.patientsService.findAllAdmin(query);
  }

  @Get('manage/:id/content')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getAdminContent(@Param('id') id: string) {
    return this.patientsService.getAdminContent(id);
  }

  @Get('manage/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findAdminDetail(@Param('id') id: string) {
    return this.patientsService.findAdminDetail(id);
  }

  @Patch(':id/admin')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateAdminPatient(
    @Param('id') id: string,
    @CurrentUser('id') actorUserId: string,
    @Body() body: AdminUpdatePatientDto,
  ) {
    return this.patientsService.updateAdminPatient(id, body, actorUserId);
  }
}
