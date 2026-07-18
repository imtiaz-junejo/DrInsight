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
  UserRole,
} from '@prisma/client';
import { Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ClinicalRecordsService } from './clinical-records.service';

@ApiTags('patient-clinical-notes')
@ApiBearerAuth()
@Controller('patients/me/notes')
@Roles(UserRole.PATIENT)
export class PatientClinicalNotesController {
  constructor(private clinicalRecordsService: ClinicalRecordsService) {}

  @Get()
  listNotes(
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('priority') priority?: ClinicalNotePriority,
    @Query('authorType') authorType?: ClinicalNoteAuthorType,
    @Query('appointmentId') appointmentId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('readStatus') readStatus?: 'read' | 'unread',
    @Query('sortBy') sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'priority',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.clinicalRecordsService.listPatientNotes(userId, {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      category,
      priority,
      authorType,
      appointmentId,
      doctorId,
      readStatus,
      sortBy,
      sortOrder,
    });
  }

  @Get(':noteId')
  getNote(@CurrentUser('id') userId: string, @Param('noteId') noteId: string) {
    return this.clinicalRecordsService.getNoteForPatient(userId, noteId);
  }

  @Post()
  createNote(@CurrentUser('id') userId: string, @Body() body: Record<string, unknown>) {
    return this.clinicalRecordsService.createPatientNote(userId, body as Parameters<
      ClinicalRecordsService['createPatientNote']
    >[1]);
  }

  @Patch(':noteId/read')
  markNoteRead(@CurrentUser('id') userId: string, @Param('noteId') noteId: string) {
    return this.clinicalRecordsService.markNoteReadForPatient(userId, noteId);
  }

  @Patch(':noteId')
  updateNote(
    @CurrentUser('id') userId: string,
    @Param('noteId') noteId: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.clinicalRecordsService.updatePatientNote(userId, noteId, body as Parameters<
      ClinicalRecordsService['updatePatientNote']
    >[2]);
  }

  @Delete(':noteId')
  deleteNote(@CurrentUser('id') userId: string, @Param('noteId') noteId: string) {
    return this.clinicalRecordsService.deletePatientNote(userId, noteId);
  }
}
