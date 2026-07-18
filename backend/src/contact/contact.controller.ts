import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ContactInquiryStatus, UserRole } from '@prisma/client';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ContactService } from './contact.service';

@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Public()
  @Post()
  submit(
    @Body()
    body: {
      name: string;
      email: string;
      phone?: string;
      subject?: string;
      message: string;
      inquiryType?: string;
    },
  ) {
    return this.contactService.submit(body);
  }

  @Public()
  @Post('newsletter')
  subscribe(@Body() body: { email: string; source?: string }) {
    return this.contactService.subscribeNewsletter(body.email, body.source ?? 'website');
  }

  @Get('submissions')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  findSubmissions(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: ContactInquiryStatus,
    @Query('inquiryType') inquiryType?: string,
    @Query('sort') sort?: string,
  ) {
    return this.contactService.findSubmissions({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      status,
      inquiryType,
      sort,
    });
  }

  @Get('submissions/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getSubmission(@Param('id') id: string) {
    return this.contactService.getSubmission(id);
  }

  @Patch('submissions/:id/status')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateSubmissionStatus(
    @Param('id') id: string,
    @Body() body: { status: ContactInquiryStatus },
  ) {
    return this.contactService.updateSubmissionStatus(id, body.status);
  }

  @Patch('submissions/:id/assign')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  assignSubmission(
    @Param('id') id: string,
    @Body() body: { assignedStaffId: string | null },
  ) {
    return this.contactService.assignSubmission(id, body.assignedStaffId);
  }

  @Patch('submissions/:id/read')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }

  @Post('submissions/:id/replies')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  addReply(
    @Param('id') id: string,
    @CurrentUser('id') authorId: string,
    @Body() body: { message: string; isInternal?: boolean },
  ) {
    return this.contactService.addReply(id, authorId, body);
  }

  @Post('submissions/:id/notes')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  addNote(
    @Param('id') id: string,
    @CurrentUser('id') authorId: string,
    @Body() body: { note: string },
  ) {
    return this.contactService.addNote(id, authorId, body.note);
  }

  @Delete('submissions/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deleteSubmission(@Param('id') id: string) {
    return this.contactService.deleteSubmission(id);
  }
}
