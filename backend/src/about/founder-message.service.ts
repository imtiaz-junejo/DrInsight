import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertFounderMessageDto } from './dto/founder-message.dto';

@Injectable()
export class FounderMessageService {
  constructor(private prisma: PrismaService) {}

  async findPublic() {
    const message = await this.prisma.founderMessage.findUnique({ where: { id: 'default' } });
    if (!message || !message.isActive) return null;
    return message;
  }

  async findAdmin() {
    const message = await this.prisma.founderMessage.findUnique({ where: { id: 'default' } });
    if (!message) {
      return {
        id: 'default',
        founderName: '',
        designation: '',
        imageUrl: null,
        headline: '',
        messageHtml: '',
        signatureImageUrl: null,
        videoUrl: null,
        isActive: false,
        eyebrow: null,
        subline: null,
        badgeText: null,
        credentials: [],
        tags: [],
        signatureName: null,
        signatureTitle: null,
        locationLine: null,
        updatedAt: new Date().toISOString(),
      };
    }
    return message;
  }

  async upsert(dto: UpsertFounderMessageDto) {
    const data: Prisma.FounderMessageUncheckedCreateInput = {
      id: 'default',
      founderName: dto.founderName,
      designation: dto.designation,
      imageUrl: dto.imageUrl,
      headline: dto.headline,
      messageHtml: dto.messageHtml,
      signatureImageUrl: dto.signatureImageUrl,
      videoUrl: dto.videoUrl,
      isActive: dto.isActive ?? true,
      eyebrow: dto.eyebrow,
      subline: dto.subline,
      badgeText: dto.badgeText,
      credentials: dto.credentials as Prisma.InputJsonValue | undefined,
      tags: dto.tags ?? [],
      signatureName: dto.signatureName,
      signatureTitle: dto.signatureTitle,
      locationLine: dto.locationLine,
    };

    return this.prisma.founderMessage.upsert({
      where: { id: 'default' },
      create: data,
      update: data,
    });
  }
}
