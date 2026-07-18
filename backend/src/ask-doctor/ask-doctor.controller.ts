import { Body, Controller, Get, Patch, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AskDoctorService } from './ask-doctor.service';

@ApiTags('ask-doctor')
@Controller('ask-doctor')
export class AskDoctorController {
  constructor(private askDoctorService: AskDoctorService) {}

  @Public()
  @Get()
  findAnswered(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.askDoctorService.findAnswered({
      page: +page! || 1,
      limit: +limit! || 12,
      category,
      search,
    });
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.askDoctorService.getCategories();
  }

  @Public()
  @Post()
  submit(
    @Body()
    body: {
      category: string;
      question: string;
      name?: string;
      isAnonymous?: boolean;
    },
  ) {
    return this.askDoctorService.submit(body);
  }

  @Public()
  @Post(':id/helpful')
  markHelpful(@Param('id') id: string) {
    return this.askDoctorService.markHelpful(id);
  }

  @Get('pending')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  findPending(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.askDoctorService.findPending({ page: +page! || 1, limit: +limit! || 20 });
  }

  @Patch(':id/answer')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  answer(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('answer') answer: string,
  ) {
    return this.askDoctorService.answer(id, userId, answer);
  }

  @Get('doctor/questions')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  findForDoctor(
    @CurrentUser('id') userId: string,
    @Query('view') view?: 'new' | 'drafts' | 'answered' | 'rejected',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.askDoctorService.findForDoctor(userId, view || 'new', {
      page: +page! || 1,
      limit: +limit! || 20,
    });
  }

  @Patch(':id/draft')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  saveDraft(@Param('id') id: string, @Body('draft') draft: string) {
    return this.askDoctorService.saveDraft(id, draft);
  }

  @Patch(':id/reject')
  @ApiBearerAuth()
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  reject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason: string,
  ) {
    return this.askDoctorService.reject(id, userId, reason);
  }

  @Get('patient/my')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  findForPatient(
    @CurrentUser('id') userId: string,
    @Query('view') view?: 'pending' | 'answered' | 'rejected',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.askDoctorService.findForPatient(userId, view || 'pending', {
      page: +page! || 1,
      limit: +limit! || 20,
    });
  }

  @Post('patient')
  @ApiBearerAuth()
  @Roles(UserRole.PATIENT)
  submitForPatient(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      category: string;
      title: string;
      question: string;
      doctorId?: string;
      attachments?: unknown;
      isAnonymous?: boolean;
    },
  ) {
    return this.askDoctorService.submitForPatient(userId, body);
  }

  @Get('admin')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findForAdmin(
    @Query('view') view?: 'pending' | 'approved' | 'rejected' | 'answered' | 'reports',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('doctorId') doctorId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.askDoctorService.findForAdmin(view || 'pending', {
      page: +page! || 1,
      limit: +limit! || 20,
      search,
      category,
      doctorId,
      from,
      to,
    });
  }

  @Patch(':id/approve')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: string, @Body('doctorId') doctorId?: string) {
    return this.askDoctorService.approveQuestion(id, doctorId);
  }

  @Patch(':id/admin-reject')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  adminReject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.askDoctorService.adminRejectQuestion(id, reason);
  }

  @Patch(':id/reassign')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  reassign(@Param('id') id: string, @Body('doctorId') doctorId: string) {
    return this.askDoctorService.reassignQuestion(id, doctorId);
  }
}
