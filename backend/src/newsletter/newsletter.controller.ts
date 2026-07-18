import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NewsletterCampaignStatus, UserRole } from '@prisma/client';
import type { Response } from 'express';
import { Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NewsletterService } from './newsletter.service';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {}

  @Get('stats')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getStats() {
    return this.newsletterService.getStats();
  }

  @Get('subscribers')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  listSubscribers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('status') status?: 'active' | 'inactive' | 'all',
  ) {
    return this.newsletterService.listSubscribers({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      search,
      status: status ?? 'all',
    });
  }

  @Get('subscribers/export')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @Header('Content-Type', 'text/csv')
  async exportSubscribers(@Res() res: Response) {
    const csv = await this.newsletterService.exportSubscribersCsv();
    res.setHeader('Content-Disposition', 'attachment; filename="drinsight-subscribers.csv"');
    res.send(csv);
  }

  @Get('subscribers/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getSubscriber(@Param('id') id: string) {
    return this.newsletterService.getSubscriber(id);
  }

  @Post('subscribers')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  addSubscriber(@Body() body: { email: string; source?: string }) {
    return this.newsletterService.addSubscriber(body.email, body.source ?? 'admin');
  }

  @Delete('subscribers/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deleteSubscriber(@Param('id') id: string) {
    return this.newsletterService.deleteSubscriber(id);
  }

  @Get('campaigns')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  listCampaigns(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: NewsletterCampaignStatus,
  ) {
    return this.newsletterService.listCampaigns({
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      status,
    });
  }

  @Get('campaigns/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  getCampaign(@Param('id') id: string) {
    return this.newsletterService.getCampaign(id);
  }

  @Post('campaigns')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  createCampaign(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      subject: string;
      previewText?: string;
      bodyHtml: string;
      bodyText?: string;
      articleLink?: string;
      audience?: 'ALL' | 'ACTIVE';
      status?: NewsletterCampaignStatus;
      scheduledAt?: string;
    },
  ) {
    return this.newsletterService.createCampaign(body, userId);
  }

  @Patch('campaigns/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  updateCampaign(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      subject: string;
      previewText: string;
      bodyHtml: string;
      bodyText: string;
      articleLink: string;
      audience: 'ALL' | 'ACTIVE';
      status: NewsletterCampaignStatus;
      scheduledAt: string | null;
    }>,
  ) {
    return this.newsletterService.updateCampaign(id, body);
  }

  @Delete('campaigns/:id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  deleteCampaign(@Param('id') id: string) {
    return this.newsletterService.deleteCampaign(id);
  }

  @Post('campaigns/:id/send')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  sendCampaign(@Param('id') id: string) {
    return this.newsletterService.sendCampaignNow(id);
  }

  @Post('campaigns/:id/schedule')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  scheduleCampaign(@Param('id') id: string, @Body() body: { scheduledAt: string }) {
    return this.newsletterService.scheduleCampaign(id, body.scheduledAt);
  }

  @Post('campaigns/process-scheduled')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  processScheduledCampaigns() {
    return this.newsletterService.processDueScheduledCampaigns();
  }
}
