import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  NewsletterAudience,
  NewsletterCampaignStatus,
  Prisma,
} from '@prisma/client';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getStats() {
    const [total, active, inactive, campaignsSent, lastCampaign] = await Promise.all([
      this.prisma.newsletterSubscriber.count(),
      this.prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      this.prisma.newsletterSubscriber.count({ where: { isActive: false } }),
      this.prisma.newsletterCampaign.count({ where: { status: 'SENT' } }),
      this.prisma.newsletterCampaign.findFirst({
        where: { status: 'SENT' },
        orderBy: { sentAt: 'desc' },
        select: { sentAt: true, subject: true, recipientCount: true },
      }),
    ]);

    return {
      total,
      active,
      inactive,
      campaignsSent,
      lastCampaign,
    };
  }

  async listSubscribers(query?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'all';
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.NewsletterSubscriberWhereInput = {
      ...(query?.search && {
        email: { contains: query.search, mode: 'insensitive' },
      }),
      ...(query?.status === 'active' && { isActive: true }),
      ...(query?.status === 'inactive' && { isActive: false }),
    };

    const [data, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSubscriber(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({ where: { id } });
    if (!subscriber) throw new NotFoundException('Subscriber not found');
    return subscriber;
  }

  async addSubscriber(email: string, source = 'admin') {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new BadRequestException('Invalid email address');
    }
    return this.prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      update: { isActive: true, source },
      create: { email: normalized, source, isActive: true },
    });
  }

  async deleteSubscriber(id: string) {
    return this.prisma.newsletterSubscriber.delete({ where: { id } });
  }

  async exportSubscribersCsv(): Promise<string> {
    const subs = await this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'asc' },
    });
    const header = 'Email,Source,Status,Subscribed At';
    const rows = subs.map((s) =>
      [
        s.email,
        s.source ?? '',
        s.isActive ? 'active' : 'inactive',
        s.createdAt.toISOString(),
      ].join(','),
    );
    return [header, ...rows].join('\n');
  }

  async listCampaigns(query?: { page?: number; limit?: number; status?: NewsletterCampaignStatus }) {
    const page = query?.page || 1;
    const limit = query?.limit || 20;
    const skip = (page - 1) * limit;
    const where: Prisma.NewsletterCampaignWhereInput = query?.status ? { status: query.status } : {};

    const [data, total] = await Promise.all([
      this.prisma.newsletterCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.newsletterCampaign.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getCampaign(id: string) {
    const campaign = await this.prisma.newsletterCampaign.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async createCampaign(
    data: {
      subject: string;
      previewText?: string;
      bodyHtml: string;
      bodyText?: string;
      articleLink?: string;
      audience?: NewsletterAudience;
      status?: NewsletterCampaignStatus;
      scheduledAt?: string;
    },
    createdById?: string,
  ) {
    return this.prisma.newsletterCampaign.create({
      data: {
        subject: data.subject,
        previewText: data.previewText,
        bodyHtml: data.bodyHtml,
        bodyText: data.bodyText,
        articleLink: data.articleLink,
        audience: data.audience ?? 'ACTIVE',
        status: data.status ?? 'DRAFT',
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        createdById,
      },
    });
  }

  async updateCampaign(
    id: string,
    data: Partial<{
      subject: string;
      previewText: string;
      bodyHtml: string;
      bodyText: string;
      articleLink: string;
      audience: NewsletterAudience;
      status: NewsletterCampaignStatus;
      scheduledAt: string | null;
    }>,
  ) {
    const existing = await this.getCampaign(id);
    if (existing.status === 'SENT') {
      throw new BadRequestException('Sent campaigns cannot be edited');
    }
    return this.prisma.newsletterCampaign.update({
      where: { id },
      data: {
        ...data,
        scheduledAt:
          data.scheduledAt === null
            ? null
            : data.scheduledAt
              ? new Date(data.scheduledAt)
              : undefined,
      },
    });
  }

  async deleteCampaign(id: string) {
    const existing = await this.getCampaign(id);
    if (existing.status === 'SENT') {
      throw new BadRequestException('Sent campaigns cannot be deleted');
    }
    return this.prisma.newsletterCampaign.delete({ where: { id } });
  }

  async sendCampaignNow(id: string) {
    const campaign = await this.getCampaign(id);
    if (campaign.status === 'SENT') {
      throw new BadRequestException('Campaign already sent');
    }

    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where: campaign.audience === 'ALL' ? {} : { isActive: true },
      select: { email: true },
    });

    if (!subscribers.length) {
      throw new BadRequestException('No subscribers to send to');
    }

    const html = this.buildCampaignHtml(campaign);
    const text =
      campaign.bodyText ||
      this.stripHtml(campaign.bodyHtml) +
        (campaign.articleLink ? `\n\nRead more: ${campaign.articleLink}` : '');

    let sent = 0;
    for (const sub of subscribers) {
      try {
        await this.emailService.sendCustomEmail(sub.email, campaign.subject, html, text);
        sent += 1;
      } catch {
        // continue sending to remaining subscribers
      }
    }

    return this.prisma.newsletterCampaign.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
        recipientCount: sent,
        scheduledAt: null,
      },
    });
  }

  async scheduleCampaign(id: string, scheduledAt: string) {
    const existing = await this.getCampaign(id);
    if (existing.status === 'SENT') {
      throw new BadRequestException('Campaign already sent');
    }
    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
      throw new BadRequestException('Scheduled time must be in the future');
    }
    return this.prisma.newsletterCampaign.update({
      where: { id },
      data: { status: 'SCHEDULED', scheduledAt: when },
    });
  }

  async processDueScheduledCampaigns() {
    const due = await this.prisma.newsletterCampaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { lte: new Date() },
      },
    });
    for (const campaign of due) {
      await this.sendCampaignNow(campaign.id);
    }
    return { processed: due.length };
  }

  private buildCampaignHtml(campaign: {
    subject: string;
    previewText?: string | null;
    bodyHtml: string;
    articleLink?: string | null;
  }) {
    const cta = campaign.articleLink
      ? `<p style="margin-top:20px"><a href="${campaign.articleLink}" style="display:inline-block;background:#1a56a0;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700">Read the full article →</a></p>`
      : '';
    const preview = campaign.previewText
      ? `<div style="display:none;max-height:0;overflow:hidden">${campaign.previewText}</div>`
      : '';
    return `${preview}<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#374151;line-height:1.6">${campaign.bodyHtml}${cta}</div>`;
  }

  private stripHtml(html: string) {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
