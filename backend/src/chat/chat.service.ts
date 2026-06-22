import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MessageType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getConversations(userId: string, role: UserRole) {
    let where = {};
    if (role === UserRole.PATIENT) {
      const patient = await this.prisma.patientProfile.findUnique({ where: { userId } });
      if (!patient) return [];
      where = { patientId: patient.id };
    } else if (role === UserRole.DOCTOR) {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId } });
      if (!doctor) return [];
      where = { doctorId: doctor.id };
    }

    return this.prisma.conversation.findMany({
      where,
      include: {
        messages: { take: 1, orderBy: { createdAt: 'desc' } },
        patient: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, isOnline: true } } } },
        doctor: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, isOnline: true } } } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });
  }

  async getOrCreateConversation(patientUserId: string, doctorId: string) {
    const patient = await this.prisma.patientProfile.findUnique({ where: { userId: patientUserId } });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        doctorId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'] },
      },
      orderBy: { scheduledAt: 'desc' },
    });
    if (!appointment) {
      throw new ForbiddenException('A confirmed appointment is required before starting chat');
    }

    let conversation = await this.prisma.conversation.findUnique({
      where: { patientId_doctorId: { patientId: patient.id, doctorId } },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { patientId: patient.id, doctorId, appointmentId: appointment.id },
      });
    }

    return conversation;
  }

  async getMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { patient: true, doctor: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const hasAccess =
      conversation.patient.userId === userId ||
      conversation.doctor.userId === userId;
    if (!hasAccess) throw new ForbiddenException();

    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    return { data: messages, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async sendMessage(senderId: string, conversationId: string, content: string, type: MessageType = MessageType.TEXT, attachmentUrl?: string) {
    await this.assertConversationAccess(conversationId, senderId);

    const message = await this.prisma.message.create({
      data: { conversationId, senderId, content, type, attachmentUrl },
      include: { sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    await this.redis.publish('chat:message', JSON.stringify({ conversationId, message }));

    return message;
  }

  async markAsRead(conversationId: string, userId: string) {
    await this.assertConversationAccess(conversationId, userId);

    await this.prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
  }

  async setTyping(conversationId: string, userId: string, isTyping: boolean) {
    await this.assertConversationAccess(conversationId, userId);
    await this.redis.publish('chat:typing', JSON.stringify({ conversationId, userId, isTyping }));
  }

  async assertConversationAccess(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { patient: true, doctor: true, appointment: true },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const hasAccess =
      conversation.patient.userId === userId ||
      conversation.doctor.userId === userId;
    const hasValidRelationship =
      !!conversation.appointment &&
      ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(conversation.appointment.status);

    if (!hasAccess || !hasValidRelationship) {
      throw new ForbiddenException('You are not allowed to access this conversation');
    }

    return conversation;
  }
}
