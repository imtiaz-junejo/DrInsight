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
import { OtpPurpose, UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';
import {
  CreateEmailTemplateDto,
  PreviewEmailTemplateDto,
  UpdateEmailTemplateDto,
  UpdateEmailTemplateStatusDto,
} from './dto/email-template.dto';
import {
  CreateOtpTemplateDto,
  PreviewOtpTemplateDto,
  TestSendOtpTemplateDto,
  UpdateOtpTemplateDto,
  UpdateOtpTemplateStatusDto,
} from './dto/otp-template.dto';
import {
  BulkCampaignIdsDto,
  CreateNotificationCampaignDto,
  UpdateNotificationCampaignDto,
} from './dto/notification-campaign.dto';
import { EmailTemplatesService } from './email-templates.service';
import { OtpTemplatesService } from './otp-templates.service';
import { NotificationCampaignsService } from './notification-campaigns.service';

@ApiTags('communication')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller('communication')
export class CommunicationController {
  constructor(
    private emailTemplatesService: EmailTemplatesService,
    private otpTemplatesService: OtpTemplatesService,
    private notificationCampaignsService: NotificationCampaignsService,
  ) {}

  @Get('email-templates')
  findEmailTemplates(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: 'all' | 'active' | 'draft',
  ) {
    return this.emailTemplatesService.findAll({
      page: +page! || 1,
      limit: +limit! || 20,
      search,
      status: status || 'all',
    });
  }

  @Get('email-templates/:id')
  findEmailTemplate(@Param('id') id: string) {
    return this.emailTemplatesService.findOne(id);
  }

  @Post('email-templates')
  createEmailTemplate(
    @Body() body: CreateEmailTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.emailTemplatesService.create(body, userId);
  }

  @Post('email-templates/preview')
  previewEmailTemplate(@Body() body: PreviewEmailTemplateDto) {
    return this.emailTemplatesService.preview(body);
  }

  @Post('email-templates/:id/duplicate')
  duplicateEmailTemplate(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.emailTemplatesService.duplicate(id, userId);
  }

  @Patch('email-templates/:id/status')
  setEmailTemplateStatus(
    @Param('id') id: string,
    @Body() body: UpdateEmailTemplateStatusDto,
  ) {
    return this.emailTemplatesService.setStatus(id, body.isEnabled);
  }

  @Patch('email-templates/:id')
  updateEmailTemplate(@Param('id') id: string, @Body() body: UpdateEmailTemplateDto) {
    return this.emailTemplatesService.update(id, body);
  }

  @Delete('email-templates/:id')
  removeEmailTemplate(@Param('id') id: string) {
    return this.emailTemplatesService.remove(id);
  }

  @Get('otp-templates/stats')
  otpStats() {
    return this.otpTemplatesService.getStats();
  }

  @Get('otp-templates')
  findOtpTemplates(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: 'all' | 'active' | 'draft',
    @Query('purpose') purpose?: OtpPurpose,
  ) {
    return this.otpTemplatesService.findAll({
      page: +page! || 1,
      limit: +limit! || 20,
      search,
      status: status || 'all',
      purpose,
    });
  }

  @Get('otp-templates/:id')
  findOtpTemplate(@Param('id') id: string) {
    return this.otpTemplatesService.findOne(id);
  }

  @Post('otp-templates')
  createOtpTemplate(
    @Body() body: CreateOtpTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.otpTemplatesService.create(body, userId);
  }

  @Post('otp-templates/:id/preview')
  previewOtpTemplate(@Param('id') id: string, @Body() body: PreviewOtpTemplateDto) {
    return this.otpTemplatesService.preview(id, body);
  }

  @Post('otp-templates/:id/test-send')
  testSendOtpTemplate(@Param('id') id: string, @Body() body: TestSendOtpTemplateDto) {
    return this.otpTemplatesService.testSend(id, body);
  }

  @Patch('otp-templates/:id/status')
  setOtpTemplateStatus(
    @Param('id') id: string,
    @Body() body: UpdateOtpTemplateStatusDto,
  ) {
    return this.otpTemplatesService.setStatus(id, body.isEnabled);
  }

  @Patch('otp-templates/:id')
  updateOtpTemplate(@Param('id') id: string, @Body() body: UpdateOtpTemplateDto) {
    return this.otpTemplatesService.update(id, body);
  }

  @Delete('otp-templates/:id')
  removeOtpTemplate(@Param('id') id: string) {
    return this.otpTemplatesService.remove(id);
  }

  @Get('notification-campaigns/stats')
  notificationStats() {
    return this.notificationCampaignsService.getStats();
  }

  @Get('notification-campaigns')
  findNotificationCampaigns(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('audience') audience?: string,
    @Query('channel') channel?: string,
  ) {
    return this.notificationCampaignsService.findAll({
      page: +page! || 1,
      limit: +limit! || 20,
      search,
      status: (status as never) || 'all',
      audience: (audience as never) || 'all',
      channel: (channel as never) || 'all',
    });
  }

  @Get('notification-campaigns/:id')
  findNotificationCampaign(@Param('id') id: string) {
    return this.notificationCampaignsService.findOne(id);
  }

  @Post('notification-campaigns')
  createNotificationCampaign(
    @Body() body: CreateNotificationCampaignDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationCampaignsService.create(body, userId);
  }

  @Post('notification-campaigns/bulk-delete')
  bulkDeleteNotificationCampaigns(@Body() body: BulkCampaignIdsDto) {
    return this.notificationCampaignsService.bulkDelete(body);
  }

  @Post('notification-campaigns/bulk-archive')
  bulkArchiveNotificationCampaigns(@Body() body: BulkCampaignIdsDto) {
    return this.notificationCampaignsService.bulkArchive(body);
  }

  @Post('notification-campaigns/bulk-send')
  bulkSendNotificationCampaigns(@Body() body: BulkCampaignIdsDto) {
    return this.notificationCampaignsService.bulkSend(body);
  }

  @Post('notification-campaigns/:id/duplicate')
  duplicateNotificationCampaign(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationCampaignsService.duplicate(id, userId);
  }

  @Post('notification-campaigns/:id/send')
  sendNotificationCampaign(@Param('id') id: string) {
    return this.notificationCampaignsService.send(id);
  }

  @Patch('notification-campaigns/:id')
  updateNotificationCampaign(
    @Param('id') id: string,
    @Body() body: UpdateNotificationCampaignDto,
  ) {
    return this.notificationCampaignsService.update(id, body);
  }

  @Delete('notification-campaigns/:id')
  removeNotificationCampaign(@Param('id') id: string) {
    return this.notificationCampaignsService.remove(id);
  }
}
