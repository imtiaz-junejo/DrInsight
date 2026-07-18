import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ClinicalNoteAuthorType,
  ClinicalNotePriority,
  PatientAlertSeverity,
  UserRole,
} from '@prisma/client';
import { Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ClinicalRecordsService } from './clinical-records.service';

@ApiTags('clinical-records')
@ApiBearerAuth()
@Controller('doctors/me/patients')
@Roles(UserRole.DOCTOR)
export class ClinicalRecordsController {
  constructor(private clinicalRecordsService: ClinicalRecordsService) {}

  @Get(':patientId')
  getPatientDetail(
    @CurrentUser('id') userId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.clinicalRecordsService.getPatientDetail(userId, patientId);
  }

  @Get(':patientId/notes/draft')
  getNoteDraft(
    @CurrentUser('id') userId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.clinicalRecordsService.getNoteDraft(userId, patientId);
  }

  @Post(':patientId/notes/draft')
  saveNoteDraft(
    @CurrentUser('id') userId: string,
    @Param('patientId') patientId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.clinicalRecordsService.upsertNoteDraft(userId, patientId, body as Parameters<
      ClinicalRecordsService['upsertNoteDraft']
    >[2]);
  }

  @Get(':patientId/notes')
  listNotes(
    @CurrentUser('id') userId: string,
    @Param('patientId') patientId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('priority') priority?: ClinicalNotePriority,
    @Query('authorType') authorType?: ClinicalNoteAuthorType,
    @Query('appointmentId') appointmentId?: string,
    @Query('readStatus') readStatus?: 'read' | 'unread',
    @Query('sortBy') sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'priority',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.clinicalRecordsService.listNotes(userId, patientId, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      category,
      priority,
      authorType,
      appointmentId,
      readStatus,
      sortBy,
      sortOrder,
    });
  }

  @Get(':patientId/notes/:noteId')
  getNote(
    @CurrentUser('id') userId: string,
    @Param('patientId') patientId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.clinicalRecordsService.getNoteForDoctor(userId, patientId, noteId);
  }

  @Post(':patientId/notes')
  createNote(
    @CurrentUser('id') userId: string,
    @Param('patientId') patientId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.clinicalRecordsService.createNote(userId, patientId, body as Parameters<
      ClinicalRecordsService['createNote']
    >[2]);
  }

  @Patch('notes/:noteId/read')
  markNoteRead(@CurrentUser('id') userId: string, @Param('noteId') noteId: string) {
    return this.clinicalRecordsService.markNoteReadForDoctor(userId, noteId);
  }

  @Patch('notes/:noteId')
  updateNote(
    @CurrentUser('id') userId: string,
    @Param('noteId') noteId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.clinicalRecordsService.updateNote(userId, noteId, body as Parameters<
      ClinicalRecordsService['updateNote']
    >[2]);
  }

  @Delete('notes/:noteId')
  deleteNote(@CurrentUser('id') userId: string, @Param('noteId') noteId: string) {
    return this.clinicalRecordsService.deleteNote(userId, noteId);
  }

  @Get(':patientId/alerts')
  listAlerts(
    @CurrentUser('id') userId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.clinicalRecordsService.listAlerts(userId, patientId);
  }

  @Post(':patientId/alerts')
  createAlert(
    @CurrentUser('id') userId: string,
    @Param('patientId') patientId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.clinicalRecordsService.createAlert(userId, patientId, {
      ...(body as Omit<Parameters<ClinicalRecordsService['createAlert']>[2], 'severity'>),
      severity: (body.severity as PatientAlertSeverity) ?? PatientAlertSeverity.CRITICAL,
    });
  }

  @Patch('alerts/:alertId/resolve')
  resolveAlert(
    @CurrentUser('id') userId: string,
    @Param('alertId') alertId: string,
    @Body() body: { details?: string },
  ) {
    return this.clinicalRecordsService.resolveAlert(userId, alertId, body.details);
  }

  @Patch('alerts/:alertId/remove')
  removeAlert(
    @CurrentUser('id') userId: string,
    @Param('alertId') alertId: string,
    @Body() body: { details?: string },
  ) {
    return this.clinicalRecordsService.removeAlert(userId, alertId, body.details);
  }
}
