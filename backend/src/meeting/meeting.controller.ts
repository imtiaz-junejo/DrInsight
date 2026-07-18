import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { MeetingService } from './meeting.service';
import { LabOrdersService } from './lab-orders.service';
import { WebrtcIceService } from './webrtc-ice.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/auth.decorators';
import {
  AutosaveNoteDto,
  ConnectionLogDto,
  CreateLabOrderDto,
  EndConsultationDto,
  JoinMeetingDto,
  MarkChatSeenDto,
  MeetingChatDto,
  NetworkQualityDto,
  StartConsultationDto,
} from './dto/meeting.dto';
import { ClinicalRecordsService } from '../clinical-records/clinical-records.service';

@ApiTags('meetings')
@ApiBearerAuth()
@Controller('meetings')
export class MeetingController {
  constructor(
    private readonly meetingService: MeetingService,
    private readonly labOrdersService: LabOrdersService,
    private readonly iceService: WebrtcIceService,
    private readonly clinicalRecords: ClinicalRecordsService,
  ) {}

  @Get('ice-config')
  getIceConfig(@CurrentUser('id') userId: string) {
    return {
      iceServers: this.iceService.getIceServers(userId),
      health: this.iceService.healthCheck(),
    };
  }

  @Post('start')
  @Roles(UserRole.DOCTOR)
  startConsultation(
    @CurrentUser('id') userId: string,
    @Body() dto: StartConsultationDto,
  ) {
    return this.meetingService.startConsultation(dto.appointmentId, userId);
  }

  @Post('join')
  joinMeeting(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: JoinMeetingDto,
  ) {
    return this.meetingService.joinMeeting(dto.appointmentId, userId, role, dto.deviceInfo);
  }

  @Post('leave')
  leaveMeeting(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: StartConsultationDto,
  ) {
    return this.meetingService.leaveMeeting(dto.appointmentId, userId, role);
  }

  @Post('end')
  @Roles(UserRole.DOCTOR)
  endConsultation(
    @CurrentUser('id') userId: string,
    @Body() dto: EndConsultationDto,
  ) {
    return this.meetingService.endConsultation(dto.appointmentId, userId);
  }

  @Get('admin/history')
  @Roles(UserRole.ADMIN)
  getHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.meetingService.getMeetingHistory(+(page ?? 1), +(limit ?? 20));
  }

  @Get('admin/:meetingId')
  @Roles(UserRole.ADMIN)
  getMeetingDetail(@Param('meetingId') meetingId: string) {
    return this.meetingService.getMeetingDetail(meetingId);
  }

  @Get(':appointmentId/status')
  getStatus(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.meetingService.getStatus(appointmentId, userId, role);
  }

  @Get(':appointmentId/context')
  getContext(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.meetingService.getConsultationContext(appointmentId, userId, role);
  }

  @Post('chat')
  sendChat(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: MeetingChatDto,
  ) {
    return this.meetingService.saveChatMessage(dto.appointmentId, userId, role, dto.content);
  }

  @Post('chat/seen')
  markChatSeen(
    @CurrentUser('id') userId: string,
    @Body() dto: MarkChatSeenDto,
  ) {
    return this.meetingService.markChatSeen(dto.messageId, userId);
  }

  @Get(':appointmentId/chat')
  getChatHistory(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.meetingService.getChatHistory(appointmentId, userId, role);
  }

  @Post('network-quality')
  recordNetworkQuality(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: NetworkQualityDto,
  ) {
    return this.meetingService.recordNetworkQuality(dto.appointmentId, userId, role, dto);
  }

  @Post('connection-log')
  logConnection(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
    @Body() dto: ConnectionLogDto,
  ) {
    return this.meetingService.logConnection(dto.appointmentId, userId, role, dto);
  }

  @Post('lab-orders')
  @Roles(UserRole.DOCTOR)
  createLabOrder(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLabOrderDto,
  ) {
    return this.labOrdersService.create(userId, dto);
  }

  @Get(':appointmentId/lab-orders')
  listLabOrders(
    @Param('appointmentId') appointmentId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: UserRole,
  ) {
    return this.labOrdersService.listForAppointment(appointmentId, userId, role);
  }

  @Post('notes/autosave')
  @Roles(UserRole.DOCTOR)
  autosaveNote(
    @CurrentUser('id') userId: string,
    @Body() dto: AutosaveNoteDto,
  ) {
    return this.clinicalRecords.upsertConsultationNote(userId, dto);
  }
}
