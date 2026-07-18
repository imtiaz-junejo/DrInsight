import {
  AppointmentStatus,
  ConsultationType,
  MeetingParticipantRole,
  MeetingStatus,
  NetworkQuality,
  UserRole,
} from '@prisma/client';

export interface MeetingAccessContext {
  appointmentId: string;
  roomId: string;
  userId: string;
  role: UserRole;
  participantRole: MeetingParticipantRole;
  meetingStatus: MeetingStatus;
  appointmentStatus: AppointmentStatus;
  consultationType: ConsultationType;
}

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface WebRtcConfig {
  iceServers: IceServerConfig[];
  iceTransportPolicy?: 'all' | 'relay';
}

export interface NetworkQualityMetrics {
  quality: NetworkQuality;
  packetLoss?: number;
  latencyMs?: number;
  bitrateKbps?: number;
  roundTripMs?: number;
  jitterMs?: number;
}

export interface ConsultationWindow {
  startsAt: Date;
  endsAt: Date;
  graceMinutesBefore: number;
  graceMinutesAfter: number;
}
