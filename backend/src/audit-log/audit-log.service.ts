import { Injectable } from '@nestjs/common';
import {
  AuditCategory,
  AuditResult,
  AuditSeverity,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type CreateAuditLogInput = {
  actorUserId?: string | null;
  actorName: string;
  actorRole?: string | null;
  actorEmail?: string | null;
  action: string;
  target?: string | null;
  ipAddress?: string | null;
  result?: AuditResult;
  severity?: AuditSeverity;
  category?: AuditCategory;
  details?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(input: CreateAuditLogInput) {
    return this.prisma.auditLogEntry.create({
      data: {
        actorUserId: input.actorUserId ?? null,
        actorName: input.actorName,
        actorRole: input.actorRole ?? null,
        actorEmail: input.actorEmail ?? null,
        action: input.action,
        target: input.target ?? null,
        ipAddress: input.ipAddress ?? null,
        result: input.result ?? AuditResult.SUCCESS,
        severity: input.severity ?? AuditSeverity.INFO,
        category: input.category ?? AuditCategory.ADMIN,
        details: input.details,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: AuditCategory;
    severity?: AuditSeverity;
    result?: AuditResult;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const where = {
      ...(query.category && { category: query.category }),
      ...(query.severity && { severity: query.severity }),
      ...(query.result && { result: query.result }),
    };

    const [
      data,
      total,
      events24h,
      adminActions24h,
      failedLogins24h,
      openAlerts,
      latestCritical,
    ] = await Promise.all([
      this.prisma.auditLogEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLogEntry.count({ where }),
      this.prisma.auditLogEntry.count({ where: { createdAt: { gte: since24h } } }),
      this.prisma.auditLogEntry.count({
        where: { createdAt: { gte: since24h }, category: AuditCategory.ADMIN },
      }),
      this.prisma.auditLogEntry.count({
        where: {
          createdAt: { gte: since24h },
          category: AuditCategory.AUTH,
          result: { in: [AuditResult.FAILED, AuditResult.BLOCKED] },
        },
      }),
      this.prisma.auditLogEntry.count({
        where: {
          severity: { in: [AuditSeverity.CRITICAL, AuditSeverity.WARNING] },
          acknowledgedAt: null,
          result: { in: [AuditResult.FAILED, AuditResult.BLOCKED] },
        },
      }),
      this.prisma.auditLogEntry.findFirst({
        where: {
          severity: { in: [AuditSeverity.CRITICAL, AuditSeverity.WARNING] },
          acknowledgedAt: null,
          result: { in: [AuditResult.FAILED, AuditResult.BLOCKED] },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats: {
        events24h,
        adminActions24h,
        failedLogins24h,
        openAlerts,
        latestCritical,
      },
    };
  }

  async acknowledgeLatestAlert() {
    const alert = await this.prisma.auditLogEntry.findFirst({
      where: {
        severity: { in: [AuditSeverity.CRITICAL, AuditSeverity.WARNING] },
        acknowledgedAt: null,
        result: { in: [AuditResult.FAILED, AuditResult.BLOCKED] },
      },
      orderBy: { createdAt: 'desc' },
    });
    if (!alert) return { success: true, acknowledged: 0 };
    await this.prisma.auditLogEntry.update({
      where: { id: alert.id },
      data: { acknowledgedAt: new Date() },
    });
    return { success: true, acknowledged: 1 };
  }
}
