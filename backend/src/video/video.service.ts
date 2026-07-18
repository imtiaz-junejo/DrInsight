import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VideoProvider } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { WebrtcIceService } from '../meeting/webrtc-ice.service';

export interface VideoTokenResult {
  provider: VideoProvider;
  token: string;
  roomId: string;
  expiresAt: string;
  config?: Record<string, unknown>;
}

@Injectable()
export class VideoService {
  private provider: VideoProvider;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
    private iceService: WebrtcIceService,
  ) {
    this.provider = (this.config.get('VIDEO_PROVIDER') as VideoProvider) || VideoProvider.WEBRTC;
  }

  async generateToken(roomId: string, userId: string, role: 'host' | 'guest' = 'guest'): Promise<VideoTokenResult> {
    await this.assertRoomAccess(roomId, userId);

    switch (this.provider) {
      case VideoProvider.AGORA:
        return this.generateAgoraToken(roomId, userId);
      case VideoProvider.TWILIO:
        return this.generateTwilioToken(roomId, userId);
      case VideoProvider.DAILY:
        return this.generateDailyToken(roomId, userId);
      default:
        return this.generateWebRtcToken(roomId, userId, role);
    }
  }

  private generateWebRtcToken(roomId: string, userId: string, role: string): VideoTokenResult {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    return {
      provider: VideoProvider.WEBRTC,
      token,
      roomId,
      expiresAt: expiresAt.toISOString(),
      config: {
        iceServers: this.iceService.getIceServers(userId),
        userId,
        role,
      },
    };
  }

  private generateAgoraToken(roomId: string, userId: string): VideoTokenResult {
    const appId = this.config.get('AGORA_APP_ID', '');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    return {
      provider: VideoProvider.AGORA,
      token: randomBytes(32).toString('hex'),
      roomId,
      expiresAt: expiresAt.toISOString(),
      config: { appId, uid: userId, channel: roomId },
    };
  }

  private generateTwilioToken(roomId: string, userId: string): VideoTokenResult {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    return {
      provider: VideoProvider.TWILIO,
      token: randomBytes(32).toString('hex'),
      roomId,
      expiresAt: expiresAt.toISOString(),
      config: {
        accountSid: this.config.get('TWILIO_ACCOUNT_SID'),
        apiKey: this.config.get('TWILIO_API_KEY'),
        identity: userId,
        room: roomId,
      },
    };
  }

  private generateDailyToken(roomId: string, userId: string): VideoTokenResult {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);

    return {
      provider: VideoProvider.DAILY,
      token: randomBytes(32).toString('hex'),
      roomId,
      expiresAt: expiresAt.toISOString(),
      config: {
        apiKey: this.config.get('DAILY_API_KEY'),
        userId,
        roomName: roomId,
      },
    };
  }

  private async assertRoomAccess(roomId: string, userId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        OR: [{ meetingRoomId: roomId }, { roomId: roomId }],
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        meetingStatus: { in: ['WAITING', 'LIVE'] },
      },
      include: { patient: true, doctor: true },
    });
    if (!appointment) throw new NotFoundException('Active appointment room not found');

    if (appointment.patient.userId !== userId && appointment.doctor.userId !== userId) {
      throw new ForbiddenException('You are not allowed to join this appointment room');
    }
  }
}
