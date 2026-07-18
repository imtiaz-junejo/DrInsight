import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AppointmentStatus,
  CallLogAction,
  ConnectionLogState,
  ConsultationType,
  MeetingAuditAction,
  MeetingEventType,
  MeetingParticipantRole,
  MeetingStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WebrtcIceService } from './webrtc-ice.service';
import { buildConsultationWindow, isWithinConsultationWindow } from './utils/consultation-window.util';
import { classifyNetworkQuality } from './utils/network-quality.util';
import { MeetingAccessContext } from './types/meeting.types';
import type { JoinMeetingDto } from './dto/meeting.dto';

const ONLINE_TYPES: ConsultationType[] = [
  ConsultationType.VIDEO,
  ConsultationType.AUDIO,
  ConsultationType.CHAT,
];

const appointmentInclude = {
  doctor: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
  patient: {
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  },
  meeting: {
    include: {
      participants: true,
      chats: { orderBy: { createdAt: 'asc' as const }, take: 100 },
    },
  },
  prescription: true,
} satisfies Prisma.AppointmentInclude;

@Injectable()
export class MeetingService {
  private readonly logger = new Logger(MeetingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly iceService: WebrtcIceService,
    private readonly config: ConfigService,
  ) {}

  async assertMeetingAccess(
    appointmentId: string,
    userId: string,
    role: UserRole,
    options?: { requireDoctor?: boolean; allowEnded?: boolean },
  ): Promise<MeetingAccessContext> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, patient: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const isDoctor = appointment.doctor.userId === userId;
    const isPatient = appointment.patient.userId === userId;
    const isAdmin = role === UserRole.ADMIN;

    if (!isDoctor && !isPatient && !isAdmin) {
      throw new ForbiddenException('You are not allowed to access this consultation');
    }
    if (options?.requireDoctor && !isDoctor && !isAdmin) {
      throw new ForbiddenException('Only the assigned doctor can perform this action');
    }
    if (!ONLINE_TYPES.includes(appointment.consultationType)) {
      throw new BadRequestException('This appointment is not an online consultation');
    }

    const joinableStatuses: AppointmentStatus[] = [AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS];
    if (options?.allowEnded) {
      if (
        appointment.status !== AppointmentStatus.CONFIRMED &&
        appointment.status !== AppointmentStatus.IN_PROGRESS &&
        appointment.status !== AppointmentStatus.COMPLETED
      ) {
        throw new BadRequestException('Appointment is not available');
      }
    } else if (!joinableStatuses.includes(appointment.status)) {
      throw new BadRequestException('Appointment must be confirmed to join consultation');
    }

    if (
      !options?.allowEnded &&
      appointment.meetingStatus !== MeetingStatus.WAITING &&
      appointment.meetingStatus !== MeetingStatus.LIVE &&
      appointment.status !== AppointmentStatus.IN_PROGRESS
    ) {
      throw new BadRequestException(`Consultation is ${appointment.meetingStatus.toLowerCase()}`);
    }

    const participantRole = isDoctor
      ? MeetingParticipantRole.DOCTOR
      : isPatient
        ? MeetingParticipantRole.PATIENT
        : MeetingParticipantRole.OBSERVER;

    return {
      appointmentId,
      roomId: appointment.roomId ?? appointment.meetingRoomId ?? '',
      userId,
      role,
      participantRole,
      meetingStatus: appointment.meetingStatus,
      appointmentStatus: appointment.status,
      consultationType: appointment.consultationType,
    };
  }

  private assertConsultationWindow(appointment: {
    scheduledAt: Date;
    durationMinutes: number;
    meetingStatus?: MeetingStatus;
    status?: AppointmentStatus;
  }) {
    if (appointment.meetingStatus === MeetingStatus.LIVE) return;
    if (appointment.status === AppointmentStatus.IN_PROGRESS) return;

    const graceBefore = Number(this.config.get('CONSULTATION_GRACE_BEFORE_MINUTES', '30'));
    const graceAfter = Number(this.config.get('CONSULTATION_GRACE_AFTER_MINUTES', '120'));
    const window = buildConsultationWindow(
      appointment.scheduledAt,
      appointment.durationMinutes,
      graceBefore,
      graceAfter,
    );
    if (!isWithinConsultationWindow(window)) {
      throw new BadRequestException('Consultation is outside the allowed time window');
    }
  }

  async startConsultation(appointmentId: string, doctorUserId: string) {
    await this.assertMeetingAccess(appointmentId, doctorUserId, UserRole.DOCTOR, { requireDoctor: true });

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, patient: { include: { user: true } } },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    this.assertConsultationWindow(appointment);

    const roomId = appointment.roomId ?? appointment.meetingRoomId ?? this.iceService.generateRoomId();
    const now = new Date();

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.IN_PROGRESS,
          meetingStatus: MeetingStatus.LIVE,
          roomId,
          meetingRoomId: roomId,
          startedAt: now,
          doctorJoinedAt: now,
        },
        include: appointmentInclude,
      });

      const meeting = await tx.meeting.upsert({
        where: { appointmentId },
        create: {
          appointmentId,
          roomId,
          status: MeetingStatus.LIVE,
          startedAt: now,
          createdById: doctorUserId,
        },
        update: {
          status: MeetingStatus.LIVE,
          startedAt: now,
          roomId,
        },
      });

      await tx.meetingParticipant.upsert({
        where: { meetingId_userId: { meetingId: meeting.id, userId: doctorUserId } },
        create: {
          meetingId: meeting.id,
          userId: doctorUserId,
          role: MeetingParticipantRole.DOCTOR,
          joinedAt: now,
          isConnected: true,
        },
        update: { joinedAt: now, isConnected: true, leftAt: null },
      });

      await tx.meetingEvent.create({
        data: {
          meetingId: meeting.id,
          userId: doctorUserId,
          eventType: MeetingEventType.CONSULTATION_STARTED,
        },
      });

      await tx.callLog.create({
        data: { meetingId: meeting.id, userId: doctorUserId, action: CallLogAction.START },
      });

      await tx.meetingAudit.create({
        data: {
          meetingId: meeting.id,
          actorId: doctorUserId,
          action: MeetingAuditAction.MEETING_STARTED,
        },
      });

      return { appointment: updatedAppointment, meeting };
    });

    await this.notifications.create(appointment.patient.user.id, {
      type: 'CONSULTATION',
      title: 'Consultation Started',
      body: 'Your doctor has started the consultation. Join now.',
      data: { appointmentId, roomId, action: 'join_consultation' },
    });

    this.logger.log(`Consultation started: appointment=${appointmentId} room=${roomId}`);
    return {
      appointment: result.appointment,
      meeting: result.meeting,
      iceServers: this.iceService.getIceServers(doctorUserId),
    };
  }

  async joinMeeting(
    appointmentId: string,
    userId: string,
    role: UserRole,
    deviceInfo?: JoinMeetingDto['deviceInfo'],
  ) {
    const access = await this.assertMeetingAccess(appointmentId, userId, role);
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, patient: { include: { user: true } }, meeting: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    this.assertConsultationWindow(appointment);

    const roomId = appointment.roomId ?? appointment.meetingRoomId;
    if (!roomId) throw new BadRequestException('Meeting room has not been created yet');

    const now = new Date();
    const isDoctor = access.participantRole === MeetingParticipantRole.DOCTOR;

    const result = await this.prisma.$transaction(async (tx) => {
      let meeting = appointment.meeting;
      if (!meeting) {
        meeting = await tx.meeting.create({
          data: {
            appointmentId,
            roomId,
            status: MeetingStatus.WAITING,
            createdById: userId,
          },
        });
      }

      const participant = await tx.meetingParticipant.upsert({
        where: { meetingId_userId: { meetingId: meeting.id, userId } },
        create: {
          meetingId: meeting.id,
          userId,
          role: access.participantRole,
          joinedAt: now,
          isConnected: true,
        },
        update: { joinedAt: now, isConnected: true, leftAt: null },
      });

      if (deviceInfo) {
        await tx.deviceInfo.upsert({
          where: { participantId: participant.id },
          create: { participantId: participant.id, ...deviceInfo },
          update: { ...deviceInfo },
        });
      }

      await tx.meetingEvent.create({
        data: {
          meetingId: meeting.id,
          userId,
          eventType: MeetingEventType.PARTICIPANT_JOINED,
        },
      });

      await tx.callLog.create({
        data: { meetingId: meeting.id, userId, action: CallLogAction.JOIN },
      });

      await tx.meetingAudit.create({
        data: {
          meetingId: meeting.id,
          actorId: userId,
          action: MeetingAuditAction.PARTICIPANT_JOINED,
        },
      });

      const appointmentUpdate: Prisma.AppointmentUpdateInput = {};
      if (isDoctor) appointmentUpdate.doctorJoinedAt = now;
      else if (access.participantRole === MeetingParticipantRole.PATIENT) {
        appointmentUpdate.patientJoinedAt = now;
      }

      const updatedAppointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: appointmentUpdate,
        include: appointmentInclude,
      });

      return { meeting, participant, appointment: updatedAppointment };
    });

    if (!isDoctor && appointment.doctor.userId) {
      await this.notifications.create(appointment.doctor.userId, {
        type: 'CONSULTATION',
        title: 'Patient Joined',
        body: 'The patient has joined the consultation.',
        data: { appointmentId, roomId },
      });
    }

    const chats = await this.prisma.meetingChat.findMany({
      where: { meetingId: result.meeting.id },
      orderBy: { createdAt: 'asc' },
      take: 200,
    });

    return {
      roomId,
      meeting: result.meeting,
      appointment: result.appointment,
      participant: result.participant,
      iceServers: this.iceService.getIceServers(userId),
      chats,
    };
  }

  async leaveMeeting(appointmentId: string, userId: string, role: UserRole) {
    const access = await this.assertMeetingAccess(appointmentId, userId, role, { allowEnded: true });
    const meeting = await this.prisma.meeting.findUnique({ where: { appointmentId } });
    if (!meeting) return { success: true };

    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.meetingParticipant.updateMany({
        where: { meetingId: meeting.id, userId },
        data: { isConnected: false, leftAt: now },
      }),
      this.prisma.meetingEvent.create({
        data: {
          meetingId: meeting.id,
          userId,
          eventType: MeetingEventType.PARTICIPANT_LEFT,
        },
      }),
      this.prisma.callLog.create({
        data: { meetingId: meeting.id, userId, action: CallLogAction.LEAVE },
      }),
      this.prisma.meetingAudit.create({
        data: {
          meetingId: meeting.id,
          actorId: userId,
          action: MeetingAuditAction.PARTICIPANT_LEFT,
        },
      }),
    ]);

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, patient: { include: { user: true } } },
    });

    if (appointment) {
      const notifyId =
        access.participantRole === MeetingParticipantRole.DOCTOR
          ? appointment.patient.user.id
          : appointment.doctor.userId;
      await this.notifications.create(notifyId, {
        type: 'CONSULTATION',
        title: access.participantRole === MeetingParticipantRole.DOCTOR ? 'Doctor Left' : 'Patient Left',
        body: `The ${access.participantRole.toLowerCase()} has left the consultation.`,
        data: { appointmentId },
      });
    }

    return { success: true };
  }

  async endConsultation(appointmentId: string, doctorUserId: string) {
    await this.assertMeetingAccess(appointmentId, doctorUserId, UserRole.DOCTOR, {
      requireDoctor: true,
      allowEnded: true,
    });

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: { include: { user: true } }, meeting: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    if (
      appointment.status === AppointmentStatus.COMPLETED &&
      appointment.meetingStatus === MeetingStatus.ENDED
    ) {
      return { success: true, durationSeconds: appointment.durationSeconds, alreadyEnded: true };
    }

    if (
      appointment.status !== AppointmentStatus.CONFIRMED &&
      appointment.status !== AppointmentStatus.IN_PROGRESS
    ) {
      throw new BadRequestException('Consultation cannot be ended in its current state');
    }

    const now = new Date();
    const startedAt = appointment.startedAt ?? appointment.meeting?.startedAt;
    const durationSeconds = startedAt
      ? Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000))
      : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.COMPLETED,
          meetingStatus: MeetingStatus.ENDED,
          endedAt: now,
          durationSeconds,
        },
      });

      if (appointment.meeting) {
        await tx.meeting.update({
          where: { id: appointment.meeting.id },
          data: { status: MeetingStatus.ENDED, endedAt: now, durationSeconds },
        });
        await tx.meetingEvent.create({
          data: {
            meetingId: appointment.meeting.id,
            userId: doctorUserId,
            eventType: MeetingEventType.CONSULTATION_ENDED,
          },
        });
        await tx.callLog.create({
          data: { meetingId: appointment.meeting.id, userId: doctorUserId, action: CallLogAction.END },
        });
        await tx.meetingAudit.create({
          data: {
            meetingId: appointment.meeting.id,
            actorId: doctorUserId,
            action: MeetingAuditAction.MEETING_ENDED,
          },
        });
      }
    });

    await this.notifications.create(appointment.patient.user.id, {
      type: 'CONSULTATION',
      title: 'Consultation Ended',
      body: 'Your consultation has ended. Thank you.',
      data: { appointmentId },
    });

    this.logger.log(`Consultation ended: appointment=${appointmentId} duration=${durationSeconds}s`);
    return { success: true, durationSeconds };
  }

  async getStatus(appointmentId: string, userId: string, role: UserRole) {
    await this.assertMeetingAccess(appointmentId, userId, role, { allowEnded: true });
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: appointmentInclude,
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async saveChatMessage(
    appointmentId: string,
    senderId: string,
    role: UserRole,
    content: string,
    replyToId?: string,
  ) {
    const access = await this.assertMeetingAccess(appointmentId, senderId, role);
    const meeting = await this.ensureMeeting(appointmentId, access.roomId);

    if (replyToId) {
      const parent = await this.prisma.meetingChat.findFirst({
        where: { id: replyToId, meetingId: meeting.id },
      });
      if (!parent) throw new BadRequestException('Reply target message not found');
    }

    const message = await this.prisma.meetingChat.create({
      data: {
        meetingId: meeting.id,
        senderId,
        content,
        replyToId: replyToId ?? null,
        deliveredAt: new Date(),
      },
      include: {
        replyTo: {
          select: { id: true, senderId: true, content: true, createdAt: true },
        },
      },
    });

    await this.prisma.meetingEvent.create({
      data: {
        meetingId: meeting.id,
        userId: senderId,
        eventType: MeetingEventType.CHAT_MESSAGE,
        payload: { messageId: message.id },
      },
    });

    return message;
  }

  async markChatSeen(messageId: string, userId: string) {
    const message = await this.prisma.meetingChat.findUnique({
      where: { id: messageId },
      include: { meeting: { include: { appointment: { include: { doctor: true, patient: true } } } } },
    });
    if (!message) throw new NotFoundException('Message not found');

    const appt = message.meeting.appointment;
    if (appt.doctor.userId !== userId && appt.patient.userId !== userId) {
      throw new ForbiddenException();
    }

    return this.prisma.meetingChat.update({
      where: { id: messageId },
      data: { seenAt: new Date(), seenById: userId },
    });
  }

  async getChatHistory(appointmentId: string, userId: string, role: UserRole) {
    const access = await this.assertMeetingAccess(appointmentId, userId, role, { allowEnded: true });
    const meeting = await this.prisma.meeting.findUnique({ where: { appointmentId } });
    if (!meeting) return [];

    return this.prisma.meetingChat.findMany({
      where: { meetingId: meeting.id },
      orderBy: { createdAt: 'asc' },
    });
  }

  async recordNetworkQuality(
    appointmentId: string,
    userId: string,
    role: UserRole,
    metrics: { packetLoss?: number; latencyMs?: number; bitrateKbps?: number; roundTripMs?: number; jitterMs?: number },
  ) {
    await this.assertMeetingAccess(appointmentId, userId, role, { allowEnded: true });
    const meeting = await this.prisma.meeting.findUnique({ where: { appointmentId } });
    if (!meeting) return null;

    const participant = await this.prisma.meetingParticipant.findUnique({
      where: { meetingId_userId: { meetingId: meeting.id, userId } },
    });
    if (!participant) return null;

    const classified = classifyNetworkQuality(metrics);
    return this.prisma.networkStats.create({
      data: {
        participantId: participant.id,
        quality: classified.quality,
        packetLoss: metrics.packetLoss,
        latencyMs: metrics.latencyMs,
        bitrateKbps: metrics.bitrateKbps,
        roundTripMs: metrics.roundTripMs,
        jitterMs: metrics.jitterMs,
        rawStats: metrics as object,
      },
    });
  }

  async logConnection(
    appointmentId: string,
    userId: string,
    role: UserRole,
    data: {
      state: ConnectionLogState;
      iceState?: string;
      signalingState?: string;
      errorCode?: string;
      errorMessage?: string;
    },
  ) {
    await this.assertMeetingAccess(appointmentId, userId, role, { allowEnded: true });
    const meeting = await this.prisma.meeting.findUnique({ where: { appointmentId } });
    if (!meeting) return null;

    return this.prisma.connectionLog.create({
      data: {
        meetingId: meeting.id,
        userId,
        state: data.state,
        iceState: data.iceState,
        signalingState: data.signalingState,
        errorCode: data.errorCode,
        errorMessage: data.errorMessage,
      },
    });
  }

  async getMeetingHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.meeting.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          appointment: {
            include: {
              doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
              patient: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
          },
          participants: true,
          _count: { select: { connectionLogs: true, callLogs: true } },
        },
      }),
      this.prisma.meeting.count(),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getMeetingDetail(meetingId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        appointment: {
          include: {
            doctor: { include: { user: true } },
            patient: { include: { user: true } },
          },
        },
        participants: { include: { deviceInfo: true, networkStats: { orderBy: { createdAt: 'desc' }, take: 20 } } },
        events: { orderBy: { createdAt: 'desc' }, take: 100 },
        callLogs: { orderBy: { createdAt: 'desc' }, take: 100 },
        connectionLogs: { orderBy: { createdAt: 'desc' }, take: 100 },
        audits: { orderBy: { createdAt: 'desc' }, take: 50 },
        chats: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return meeting;
  }

  async getConsultationContext(appointmentId: string, userId: string, role: UserRole) {
    const appointment = await this.getStatus(appointmentId, userId, role);
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { id: appointment.patientId },
      include: {
        prescriptions: {
          where: { patientId: appointment.patientId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const labOrders = await this.prisma.labOrder.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'desc' },
    });

    const clinicalNotes = await this.prisma.patientClinicalNote.findMany({
      where: { appointmentId, isDraft: false },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return {
      appointment,
      patient: patientProfile,
      labOrders,
      clinicalNotes,
      iceServers: this.iceService.getIceServers(userId),
    };
  }

  private async ensureMeeting(appointmentId: string, roomId: string) {
    return this.prisma.meeting.upsert({
      where: { appointmentId },
      create: { appointmentId, roomId, status: MeetingStatus.WAITING },
      update: {},
    });
  }
}