import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { PrescriptionStatus, UserRole } from '@prisma/client';

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



  @Get('stats')

  @Roles(UserRole.DOCTOR)

  getStats(@CurrentUser('id') userId: string) {

    return this.prescriptionsService.getDoctorStats(userId);

  }



  @Get('list')

  @Roles(UserRole.DOCTOR)

  findDoctorList(

    @CurrentUser('id') userId: string,

    @Query('search') search?: string,

    @Query('status') status?: PrescriptionStatus,

    @Query('page') page?: string,

    @Query('limit') limit?: string,

    @Query('sort') sort?: 'newest' | 'oldest' | 'patient',

  ) {

    return this.prescriptionsService.findForDoctorList(userId, {

      search,

      status,

      page: page ? Number(page) : undefined,

      limit: limit ? Number(limit) : undefined,

      sort,

    });

  }



  @Get()

  @Roles(UserRole.DOCTOR, UserRole.PATIENT, UserRole.ADMIN)

  findAll(

    @CurrentUser('id') userId: string,

    @CurrentUser('role') role: UserRole,

    @Query('patientId') patientId?: string,

  ) {

    return this.prescriptionsService.findForUser(userId, role, patientId);

  }



  @Get('draft/:patientId')

  @Roles(UserRole.DOCTOR)

  getDraft(@CurrentUser('id') userId: string, @Param('patientId') patientId: string) {

    return this.prescriptionsService.getDraft(userId, patientId);

  }



  @Post('draft/:patientId')

  @Roles(UserRole.DOCTOR)

  saveDraft(

    @CurrentUser('id') userId: string,

    @Param('patientId') patientId: string,

    @Body() body: Record<string, unknown>,

  ) {

    return this.prescriptionsService.saveDraft(userId, patientId, body as Parameters<

      PrescriptionsService['saveDraft']

    >[2]);

  }



  @Post('issue/:patientId')

  @Roles(UserRole.DOCTOR)

  issueFromDraft(

    @CurrentUser('id') userId: string,

    @Param('patientId') patientId: string,

    @Body() body: Record<string, unknown>,

  ) {

    return this.prescriptionsService.issueFromDraft(userId, patientId, body as Parameters<

      PrescriptionsService['issueFromDraft']

    >[2]);

  }



  @Post(':id/duplicate')

  @Roles(UserRole.DOCTOR)

  duplicate(@CurrentUser('id') userId: string, @Param('id') id: string) {

    return this.prescriptionsService.duplicatePrescription(userId, id);

  }



  @Post(':id/complete')

  @Roles(UserRole.DOCTOR)

  markCompleted(@CurrentUser('id') userId: string, @Param('id') id: string) {

    return this.prescriptionsService.markCompleted(userId, id);

  }



  @Get(':id')

  @Roles(UserRole.DOCTOR, UserRole.PATIENT, UserRole.ADMIN)

  findOne(

    @CurrentUser('id') userId: string,

    @CurrentUser('role') role: UserRole,

    @Param('id') id: string,

  ) {

    return this.prescriptionsService.findOne(userId, role, id);

  }



  @Patch(':id')

  @Roles(UserRole.DOCTOR)

  update(

    @CurrentUser('id') userId: string,

    @Param('id') id: string,

    @Body() body: Record<string, unknown>,

  ) {

    return this.prescriptionsService.updatePrescription(

      userId,

      id,

      body as Parameters<PrescriptionsService['updatePrescription']>[2],

    );

  }



  @Delete(':id')

  @Roles(UserRole.DOCTOR)

  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {

    return this.prescriptionsService.deletePrescription(userId, id);

  }

}


