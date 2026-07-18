import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';
import { MeetingService } from './meeting.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';

interface SignalingPayload {
  appointmentId: string;
  targetUserId?: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  enabled?: boolean;
  content?: string;
  replyToId?: string;
  state?: string;
  metrics?: Record<string, number>;
}

type AckCallback = (response: { success: boolean; error?: string; data?: unknown }) => void;

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
  namespace: '/consultation',
})
export class ConsultationGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server!: Namespace;

  private readonly logger = new Logger(ConsultationGateway.name);
  private readonly roomSockets = new Map<string, Set<string>>();
  private readonly socketRooms = new Map<string, string>();
  private readonly heartbeats = new Map<string, NodeJS.Timeout>();
  private cleanupInterval!: NodeJS.Timeout;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly meetingService: MeetingService,
    private readonly usersService: UsersService,
    private readonly redis: RedisService,
  ) {}

  onModuleInit() {
    this.cleanupInterval = setInterval(() => this.cleanupStaleSockets(), 60_000);
  }

  onModuleDestroy() {
    clearInterval(this.cleanupInterval);
    this.heartbeats.forEach((t) => clearInterval(t));
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization as string | undefined)?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwt.verify(token, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (user.status !== 'ACTIVE') {
        client.disconnect();
        return;
      }

      client.data.userId = user.id;
      client.data.role = user.role as UserRole;
      client.join(`user:${user.id}`);

      this.startHeartbeat(client);
      this.logger.log(`Consultation client connected: ${user.id}`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.stopHeartbeat(client.id);
    const roomKey = this.socketRooms.get(client.id);
    if (roomKey) {
      await this.handleLeaveRoomInternal(client, { appointmentId: roomKey });
    }
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: string },
    ack?: AckCallback,
  ) {
    try {
      const result = await this.meetingService.joinMeeting(
        data.appointmentId,
        client.data.userId,
        client.data.role,
      );
      const roomName = `consultation:${data.appointmentId}`;
      await client.join(roomName);
      this.trackSocketInRoom(client.id, data.appointmentId);

      const peers = this.getPeerUserIdsInRoom(data.appointmentId, client.id);
      client.emit('room-peers', { appointmentId: data.appointmentId, peers });

      client.to(roomName).emit('user-joined', {
        userId: client.data.userId,
        appointmentId: data.appointmentId,
        roomId: result.roomId,
      });

      ack?.({ success: true, data: { ...result, peers } });
      return { success: true, data: { ...result, peers } };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Join failed';
      ack?.({ success: false, error: message });
      return { success: false, error: message };
    }
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: string },
    ack?: AckCallback,
  ) {
    return this.handleLeaveRoomInternal(client, data, ack);
  }

  @SubscribeMessage('start-consultation')
  async handleStartConsultation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: string },
    ack?: AckCallback,
  ) {
    try {
      const result = await this.meetingService.startConsultation(data.appointmentId, client.data.userId);
      const roomName = `consultation:${data.appointmentId}`;
      await client.join(roomName);
      this.trackSocketInRoom(client.id, data.appointmentId);

      const peers = this.getPeerUserIdsInRoom(data.appointmentId, client.id);
      client.emit('room-peers', { appointmentId: data.appointmentId, peers });

      client.to(roomName).emit('user-joined', {
        userId: client.data.userId,
        appointmentId: data.appointmentId,
        roomId: result.meeting.roomId,
      });

      const patientUserId = result.appointment.patient.user.id;
      this.server.to(`user:${patientUserId}`).emit('appointment-status', {
        appointmentId: data.appointmentId,
        meetingStatus: 'LIVE',
        action: 'doctor_started',
        roomId: result.meeting.roomId,
        message: 'Doctor has started your consultation. Join Now.',
      });

      ack?.({ success: true, data: result });
      return { success: true, data: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Start failed';
      ack?.({ success: false, error: message });
      return { success: false, error: message };
    }
  }

  @SubscribeMessage('end-consultation')
  async handleEndConsultation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { appointmentId: string },
    ack?: AckCallback,
  ) {
    try {
      const result = await this.meetingService.endConsultation(data.appointmentId, client.data.userId);
      const roomName = `consultation:${data.appointmentId}`;
      this.server.to(roomName).emit('appointment-status', {
        appointmentId: data.appointmentId,
        meetingStatus: 'ENDED',
        action: 'consultation_ended',
      });
      ack?.({ success: true, data: result });
      return { success: true, data: result };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'End failed';
      ack?.({ success: false, error: message });
      return { success: false, error: message };
    }
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SignalingPayload,
  ) {
    this.relaySignaling(client, data, 'offer', { sdp: data.sdp, fromUserId: client.data.userId });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SignalingPayload,
  ) {
    this.relaySignaling(client, data, 'answer', { sdp: data.sdp, fromUserId: client.data.userId });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SignalingPayload,
  ) {
    this.relaySignaling(client, data, 'ice-candidate', {
      candidate: data.candidate,
      fromUserId: client.data.userId,
    });
  }

  @SubscribeMessage('toggle-camera')
  handleToggleCamera(@ConnectedSocket() client: Socket, @MessageBody() data: SignalingPayload) {
    this.broadcastToRoom(client, data.appointmentId, 'toggle-camera', {
      userId: client.data.userId,
      enabled: data.enabled,
    });
  }

  @SubscribeMessage('toggle-mic')
  handleToggleMic(@ConnectedSocket() client: Socket, @MessageBody() data: SignalingPayload) {
    this.broadcastToRoom(client, data.appointmentId, 'toggle-mic', {
      userId: client.data.userId,
      enabled: data.enabled,
    });
  }

  @SubscribeMessage('network-quality')
  async handleNetworkQuality(@ConnectedSocket() client: Socket, @MessageBody() data: SignalingPayload) {
    if (data.metrics) {
      await this.meetingService.recordNetworkQuality(
        data.appointmentId,
        client.data.userId,
        client.data.role,
        data.metrics,
      );
    }
    this.broadcastToRoom(client, data.appointmentId, 'network-quality', {
      userId: client.data.userId,
      metrics: data.metrics,
    });
  }

  @SubscribeMessage('chat-message')
  async handleChatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SignalingPayload,
    ack?: AckCallback,
  ) {
    try {
      if (!data.content?.trim()) throw new Error('Empty message');
      const message = await this.meetingService.saveChatMessage(
        data.appointmentId,
        client.data.userId,
        client.data.role,
        data.content,
        data.replyToId,
      );
      const payload = { message, fromUserId: client.data.userId };
      this.broadcastToRoom(client, data.appointmentId, 'chat-message', payload);
      client.emit('chat-message', { appointmentId: data.appointmentId, ...payload });
      ack?.({ success: true, data: message });
      return { success: true, data: message };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Chat failed';
      ack?.({ success: false, error: message });
      return { success: false, error: message };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() data: SignalingPayload) {
    client.to(`consultation:${data.appointmentId}`).emit('typing', {
      userId: client.data.userId,
      appointmentId: data.appointmentId,
    });
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(@ConnectedSocket() client: Socket) {
    client.data.lastHeartbeat = Date.now();
    return { success: true, ts: Date.now() };
  }

  @SubscribeMessage('connection-state')
  async handleConnectionState(@ConnectedSocket() client: Socket, @MessageBody() data: SignalingPayload) {
    await this.meetingService.logConnection(data.appointmentId, client.data.userId, client.data.role, {
      state: (data.state as 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED' | 'RECONNECTING') ?? 'CONNECTING',
    });
    this.broadcastToRoom(client, data.appointmentId, 'connection-state', {
      userId: client.data.userId,
      state: data.state,
    });
  }

  private async handleLeaveRoomInternal(client: Socket, data: { appointmentId: string }, ack?: AckCallback) {
    try {
      await this.meetingService.leaveMeeting(data.appointmentId, client.data.userId, client.data.role);
      const roomName = `consultation:${data.appointmentId}`;
      client.leave(roomName);
      this.untrackSocket(client.id, data.appointmentId);
      client.to(roomName).emit('user-left', { userId: client.data.userId, appointmentId: data.appointmentId });
      ack?.({ success: true });
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Leave failed';
      ack?.({ success: false, error: message });
      return { success: false, error: message };
    }
  }

  private relaySignaling(client: Socket, data: SignalingPayload, event: string, payload: Record<string, unknown>) {
    if (data.targetUserId) {
      this.server.to(`user:${data.targetUserId}`).emit(event, { appointmentId: data.appointmentId, ...payload });
    } else {
      client.to(`consultation:${data.appointmentId}`).emit(event, { appointmentId: data.appointmentId, ...payload });
    }
  }

  private broadcastToRoom(client: Socket, appointmentId: string, event: string, payload: Record<string, unknown>) {
    client.to(`consultation:${appointmentId}`).emit(event, { appointmentId, ...payload });
  }

  private getPeerUserIdsInRoom(appointmentId: string, excludeSocketId: string): string[] {
    const socketIds = this.roomSockets.get(appointmentId);
    if (!socketIds) return [];
    const userIds: string[] = [];
    for (const socketId of socketIds) {
      if (socketId === excludeSocketId) continue;
      const peer = this.server.sockets.get(socketId);
      const userId = peer?.data?.userId as string | undefined;
      if (userId) userIds.push(userId);
    }
    return userIds;
  }

  private trackSocketInRoom(socketId: string, appointmentId: string) {
    if (!this.roomSockets.has(appointmentId)) {
      this.roomSockets.set(appointmentId, new Set());
    }
    this.roomSockets.get(appointmentId)!.add(socketId);
    this.socketRooms.set(socketId, appointmentId);
  }

  private untrackSocket(socketId: string, appointmentId: string) {
    this.roomSockets.get(appointmentId)?.delete(socketId);
    this.socketRooms.delete(socketId);
  }

  private startHeartbeat(client: Socket) {
    client.data.lastHeartbeat = Date.now();
    const interval = setInterval(() => {
      const last = client.data.lastHeartbeat as number | undefined;
      if (last && Date.now() - last > 90_000) {
        this.logger.warn(`Stale socket disconnected: ${client.id}`);
        client.disconnect();
      }
    }, 30_000);
    this.heartbeats.set(client.id, interval);
  }

  private stopHeartbeat(socketId: string) {
    const interval = this.heartbeats.get(socketId);
    if (interval) {
      clearInterval(interval);
      this.heartbeats.delete(socketId);
    }
  }

  private cleanupStaleSockets() {
    const sockets = this.server?.sockets;
    if (!sockets) return;
    sockets.forEach((socket: Socket) => {
      const last = socket.data.lastHeartbeat as number | undefined;
      if (last && Date.now() - last > 120_000) {
        socket.disconnect();
      }
    });
  }
}

// Browser WebRTC types for signaling payloads
type RTCSessionDescriptionInit = { type?: string; sdp?: string };
type RTCIceCandidateInit = { candidate?: string; sdpMid?: string | null; sdpMLineIndex?: number | null };
