import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public, Roles } from '../common/decorators/auth.decorators';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  AdminToggleSubscriptionDto,
  SubscribeWomensHealthReminderDto,
  ToggleWomensHealthReminderDto,
  UpdateWomensHealthSettingsDto,
  UpsertPregnancyScheduleDto,
  WhrLogsQueryDto,
} from './dto/womens-health-reminder.dto';
import { WomensHealthRemindersService } from './womens-health-reminders.service';

@ApiTags('womens-health-reminders')
@Controller()
export class WomensHealthRemindersController {
  constructor(private whrService: WomensHealthRemindersService) {}

  @Public()
  @Post('public/womens-health-reminders/subscribe')
  subscribePublic(@Body() dto: SubscribeWomensHealthReminderDto) {
    return this.whrService.subscribe(dto);
  }

  @Public()
  @Post('public/womens-health-reminders/unsubscribe')
  unsubscribePublic(@Body() body: { email: string; tool: SubscribeWomensHealthReminderDto['tool'] }) {
    return this.whrService.unsubscribe(body.email, body.tool);
  }

  @Public()
  @Get('public/womens-health-reminders/status')
  getPublicStatus(@Query('email') email: string) {
    return this.whrService.getPublicStatus(email);
  }

  @ApiBearerAuth()
  @Get('me/womens-health-reminders')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  getMySubscriptions(@CurrentUser() user: { id: string; email: string }) {
    return this.whrService.getUserSubscriptions(user.id, user.email);
  }

  @ApiBearerAuth()
  @Patch('me/womens-health-reminders/toggle')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  toggleMySubscription(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: ToggleWomensHealthReminderDto,
  ) {
    return this.whrService.toggleUserSubscription(user.id, user.email, dto);
  }

  @ApiBearerAuth()
  @Post('me/womens-health-reminders/subscribe')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  subscribeAuthenticated(
    @CurrentUser() user: { id: string; email: string },
    @Body() dto: SubscribeWomensHealthReminderDto,
  ) {
    return this.whrService.subscribe({ ...dto, email: dto.email || user.email }, user.id);
  }
}

@ApiTags('admin-womens-health-reminders')
@ApiBearerAuth()
@Controller('site-admin/womens-health-reminders')
@Roles(UserRole.ADMIN)
export class AdminWomensHealthRemindersController {
  constructor(private whrService: WomensHealthRemindersService) {}

  @Get('dashboard')
  getDashboard() {
    return this.whrService.getDashboardStats();
  }

  @Get('subscriptions')
  listSubscriptions() {
    return this.whrService.listSubscriptions();
  }

  @Patch('subscriptions/toggle')
  toggleSubscription(@Body() dto: AdminToggleSubscriptionDto) {
    return this.whrService.adminToggleSubscription(dto);
  }

  @Get('settings')
  getSettings() {
    return this.whrService.getSettings();
  }

  @Patch('settings')
  updateSettings(@Body() dto: UpdateWomensHealthSettingsDto) {
    return this.whrService.updateSettings(dto);
  }

  @Get('schedules')
  listSchedules() {
    return this.whrService.listSchedules();
  }

  @Post('schedules')
  createSchedule(@Body() dto: UpsertPregnancyScheduleDto) {
    return this.whrService.createSchedule(dto);
  }

  @Patch('schedules/:id')
  updateSchedule(@Param('id') id: string, @Body() dto: UpsertPregnancyScheduleDto) {
    return this.whrService.updateSchedule(id, dto);
  }

  @Patch('schedules/:id/toggle')
  toggleSchedule(@Param('id') id: string) {
    return this.whrService.toggleSchedule(id);
  }

  @Delete('schedules/:id')
  deleteSchedule(@Param('id') id: string) {
    return this.whrService.deleteSchedule(id);
  }

  @Get('templates')
  getTemplates() {
    return this.whrService.getTemplates();
  }

  @Put('templates/ovulation')
  saveOvulationTemplate(@Body() body: { subject: string; body: string }) {
    return this.whrService.saveOvulationTemplate(body.subject, body.body);
  }

  @Put('templates/period')
  savePeriodTemplate(@Body() body: { subject: string; body: string }) {
    return this.whrService.savePeriodTemplate(body.subject, body.body);
  }

  @Put('templates/schedules/:id')
  saveScheduleTemplate(
    @Param('id') id: string,
    @Body() body: { subject: string; bodyHtml: string },
  ) {
    return this.whrService.saveScheduleTemplate(id, body.subject, body.bodyHtml);
  }

  @Get('logs')
  listLogs(@Query() query: WhrLogsQueryDto) {
    return this.whrService.listLogs(query);
  }

  @Post('logs/:id/retry')
  retryLog(@Param('id') id: string) {
    return this.whrService.retryLog(id);
  }

  @Post('scheduler/run')
  runScheduler() {
    return this.whrService.runScheduler();
  }

  @Get('badge-count')
  badgeCount() {
    return this.whrService.getAdminBadgeCount();
  }
}
