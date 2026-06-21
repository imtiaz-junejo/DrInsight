import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from '../chat/chat.service';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { MessageType } from '@prisma/client';

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
  namespace: '/realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
    private chatService: ChatService,
    private usersService: UsersService,
    private redis: RedisService,
  ) {}

  async onModuleInit() {
    await this.redis.subscribe('chat:message', (msg) => {
      const { conversationId, message } = JSON.parse(msg);
      this.server.to(`conversation:${conversationId}`).emit('new_message', message);
    });

    await this.redis.subscribe('chat:typing', (msg) => {
      const payload = JSON.parse(msg);
      this.server.to(`conversation:${payload.conversationId}`).emit('typing', payload);
    });

    await this.redis.subscribe('notifications', (msg) => {
      const { userId, notification } = JSON.parse(msg);
      this.server.to(`user:${userId}`).emit('notification', notification);
    });
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwt.verify(token, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
      });

      const userId = payload.sub;
      client.data.userId = userId;

      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      client.join(`user:${userId}`);
      await this.usersService.setOnlineStatus(userId, true);
      this.server.emit('user_online', { userId, isOnline: true });

      this.logger.log(`Client connected: ${userId}`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (!userId) return;

    const sockets = this.userSockets.get(userId);
    sockets?.delete(client.id);

    if (!sockets?.size) {
      this.userSockets.delete(userId);
      await this.usersService.setOnlineStatus(userId, false);
      this.server.emit('user_offline', { userId, isOnline: false, lastSeen: new Date().toISOString() });
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.join(`conversation:${data.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    client.leave(`conversation:${data.conversationId}`);
    return { success: true };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string; type?: MessageType; attachmentUrl?: string },
  ) {
    const message = await this.chatService.sendMessage(
      client.data.userId,
      data.conversationId,
      data.content,
      data.type || MessageType.TEXT,
      data.attachmentUrl,
    );
    return message;
  }

  @SubscribeMessage('typing_start')
  handleTypingStart(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    return this.chatService.setTyping(data.conversationId, client.data.userId, true);
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(@ConnectedSocket() client: Socket, @MessageBody() data: { conversationId: string }) {
    return this.chatService.setTyping(data.conversationId, client.data.userId, false);
  }
}
