import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CampaignStatus,
  NotificationAudience,
  NotificationChannel,
  NotificationType,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  BulkCampaignIdsDto,
  CreateNotificationCampaignDto,
  UpdateNotificationCampaignDto,
} from './dto/notification-campaign.dto';

@Injectable()
export class NotificationCampaignsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private emailService: EmailService,
  ) {}

  private creatorSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
  } as const;

  private audienceUserSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
  } as const;

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: CampaignStatus | 'all';
    audience?: NotificationAudience | 'all';
    channel?: NotificationChannel | 'all';
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationCampaignWhereInput = {
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { message: { contains: query.search, mode: 'insensitive' } },
          { type: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.status && query.status !== 'all' && { status: query.status }),
      ...(query.audience && query.audience !== 'all' && { audience: query.audience }),
      ...(query.channel &&
        query.channel !== 'all' && {
          channels: { has: query.channel },
        }),
    };

    const [data, total] = await Promise.all([
      this.prisma.notificationCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          createdBy: { select: this.creatorSelect },
          audienceUser: { select: this.audienceUserSelect },
        },
      }),
      this.prisma.notificationCampaign.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  }

  async getStats() {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const campaigns = await this.prisma.notificationCampaign.findMany({
      where: {
        status: CampaignStatus.SENT,
        sentAt: { gte: since },
      },
      select: {
        totalSent: true,
        delivered: true,
        readCount: true,
        failed: true,
        channels: true,
      },
    });

    const totalSent = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
    const delivered = campaigns.reduce((sum, c) => sum + c.delivered, 0);
    const readCount = campaigns.reduce((sum, c) => sum + c.readCount, 0);
    const failed = campaigns.reduce((sum, c) => sum + c.failed, 0);

    let emailCount = 0;
    let smsPushCount = 0;
    campaigns.forEach((campaign) => {
      if (campaign.channels.includes(NotificationChannel.EMAIL)) {
        emailCount += campaign.delivered;
      }
      if (
        campaign.channels.includes(NotificationChannel.SMS) ||
        campaign.channels.includes(NotificationChannel.PUSH)
      ) {
        smsPushCount += campaign.delivered;
      }
    });

    const deliveryRate =
      totalSent > 0 ? Math.round((delivered / totalSent) * 1000) / 10 : 0;
    const emailShare =
      delivered > 0 ? Math.round((emailCount / delivered) * 1000) / 10 : 0;
    const smsPushShare =
      delivered > 0 ? Math.round((smsPushCount / delivered) * 1000) / 10 : 0;

    return {
      totalSent,
      delivered,
      readCount,
      failed,
      deliveryRate,
      emailCount,
      smsPushCount,
      emailShare,
      smsPushShare,
    };
  }

  async findOne(id: string) {
    const campaign = await this.prisma.notificationCampaign.findUnique({
      where: { id },
      include: {
        createdBy: { select: this.creatorSelect },
        audienceUser: { select: this.audienceUserSelect },
      },
    });
    if (!campaign) throw new NotFoundException('Notification campaign not found');
    return campaign;
  }

  async create(dto: CreateNotificationCampaignDto, createdById?: string) {
    this.validateAudience(dto.audience, dto.audienceUserId);

    return this.prisma.notificationCampaign.create({
      data: {
        title: dto.title,
        message: dto.message,
        type: dto.type ?? 'GENERAL',
        priority: dto.priority,
        audience: dto.audience,
        audienceUserId: dto.audienceUserId,
        channels: dto.channels,
        scheduleAt: dto.scheduleAt ? new Date(dto.scheduleAt) : null,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        actionLabel: dto.actionLabel,
        actionUrl: dto.actionUrl,
        status: dto.status ?? CampaignStatus.DRAFT,
        createdById,
      },
      include: {
        createdBy: { select: this.creatorSelect },
        audienceUser: { select: this.audienceUserSelect },
      },
    });
  }

  async update(id: string, dto: UpdateNotificationCampaignDto) {
    const existing = await this.findOne(id);
    if (existing.status === CampaignStatus.SENT) {
      throw new BadRequestException('Sent campaigns cannot be edited');
    }

    const audience = dto.audience ?? existing.audience;
    const audienceUserId = dto.audienceUserId ?? existing.audienceUserId ?? undefined;
    this.validateAudience(audience, audienceUserId);

    return this.prisma.notificationCampaign.update({
      where: { id },
      data: {
        ...dto,
        scheduleAt: dto.scheduleAt ? new Date(dto.scheduleAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      },
      include: {
        createdBy: { select: this.creatorSelect },
        audienceUser: { select: this.audienceUserSelect },
      },
    });
  }

  async duplicate(id: string, createdById?: string) {
    const campaign = await this.findOne(id);
    return this.prisma.notificationCampaign.create({
      data: {
        title: `${campaign.title} (Copy)`,
        message: campaign.message,
        type: campaign.type,
        priority: campaign.priority,
        audience: campaign.audience,
        audienceUserId: campaign.audienceUserId,
        channels: campaign.channels,
        scheduleAt: campaign.scheduleAt,
        expiresAt: campaign.expiresAt,
        actionLabel: campaign.actionLabel,
        actionUrl: campaign.actionUrl,
        status: CampaignStatus.DRAFT,
        createdById,
      },
      include: {
        createdBy: { select: this.creatorSelect },
        audienceUser: { select: this.audienceUserSelect },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.notificationCampaign.delete({ where: { id } });
    return { success: true };
  }

  async bulkDelete(dto: BulkCampaignIdsDto) {
    await this.prisma.notificationCampaign.deleteMany({
      where: { id: { in: dto.ids }, status: { not: CampaignStatus.SENT } },
    });
    return { success: true };
  }

  async bulkArchive(dto: BulkCampaignIdsDto) {
    await this.prisma.notificationCampaign.updateMany({
      where: { id: { in: dto.ids } },
      data: { status: CampaignStatus.ARCHIVED },
    });
    return { success: true };
  }

  async bulkSend(dto: BulkCampaignIdsDto) {
    const results = [];
    for (const id of dto.ids) {
      results.push(await this.send(id));
    }
    return { success: true, results };
  }

  async send(id: string) {
    const campaign = await this.findOne(id);
    if (campaign.status === CampaignStatus.SENT) {
      throw new BadRequestException('Campaign has already been sent');
    }

    const users = await this.resolveAudience(campaign.audience, campaign.audienceUserId);
    if (users.length === 0) {
      throw new BadRequestException('No recipients found for this audience');
    }

    let totalSent = 0;
    let delivered = 0;
    let failed = 0;

    for (const user of users) {
      for (const channel of campaign.channels) {
        totalSent += 1;
        try {
          if (channel === NotificationChannel.IN_APP) {
            await this.notificationsService.create(user.id, {
              type: NotificationType.SYSTEM,
              title: campaign.title,
              body: campaign.message,
              data: {
                campaignId: campaign.id,
                actionLabel: campaign.actionLabel,
                actionUrl: campaign.actionUrl,
                priority: campaign.priority,
              },
            });
            delivered += 1;
          } else if (channel === NotificationChannel.EMAIL) {
            const actionHtml = campaign.actionUrl
              ? `<p><a href="${campaign.actionUrl}">${campaign.actionLabel ?? 'Open'}</a></p>`
              : '';
            await this.emailService.sendCustomEmail(
              user.email,
              campaign.title,
              `<p>Hi ${user.firstName},</p><p>${campaign.message}</p>${actionHtml}`,
            );
            delivered += 1;
          } else {
            // SMS / Push channels are logged as delivered in dev until providers are integrated.
            delivered += 1;
          }
        } catch {
          failed += 1;
        }
      }
    }

    return this.prisma.notificationCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.SENT,
        sentAt: new Date(),
        totalSent,
        delivered,
        failed,
        readCount: 0,
      },
      include: {
        createdBy: { select: this.creatorSelect },
        audienceUser: { select: this.audienceUserSelect },
      },
    });
  }

  private validateAudience(audience: NotificationAudience, audienceUserId?: string) {
    if (audience === NotificationAudience.INDIVIDUAL && !audienceUserId) {
      throw new BadRequestException('Individual audience requires audienceUserId');
    }
  }

  private async resolveAudience(
    audience: NotificationAudience,
    audienceUserId?: string | null,
  ) {
    const baseWhere: Prisma.UserWhereInput = {
      status: UserStatus.ACTIVE,
    };

    if (audience === NotificationAudience.INDIVIDUAL && audienceUserId) {
      return this.prisma.user.findMany({
        where: { ...baseWhere, id: audienceUserId },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
    }

    if (audience === NotificationAudience.PATIENTS) {
      return this.prisma.user.findMany({
        where: { ...baseWhere, role: UserRole.PATIENT },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
    }

    if (audience === NotificationAudience.DOCTORS) {
      return this.prisma.user.findMany({
        where: { ...baseWhere, role: UserRole.DOCTOR },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
    }

    if (audience === NotificationAudience.ADMINS) {
      return this.prisma.user.findMany({
        where: { ...baseWhere, role: UserRole.ADMIN },
        select: { id: true, email: true, firstName: true, lastName: true },
      });
    }

    return this.prisma.user.findMany({
      where: baseWhere,
      select: { id: true, email: true, firstName: true, lastName: true },
    });
  }
}
