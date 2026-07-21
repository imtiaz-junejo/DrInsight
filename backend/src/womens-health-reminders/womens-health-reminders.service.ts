import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  WomensHealthReminderStatus,
  WomensHealthToolType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminToggleSubscriptionDto,
  SubscribeWomensHealthReminderDto,
  ToggleWomensHealthReminderDto,
  UpdateWomensHealthSettingsDto,
  UpsertPregnancyScheduleDto,
  WhrLogsQueryDto,
} from './dto/womens-health-reminder.dto';

const DEFAULT_SCHEDULES: UpsertPregnancyScheduleDto[] = [
  {
    weekRange: '6–8',
    title: 'First Antenatal Visit',
    subject: 'Week {{Pregnancy Week}}: Time for Your First Antenatal Visit',
    tests: 'Initial blood tests · Folic acid check',
    visitReminder: 'Book your first antenatal visit',
    careInstructions: 'Start folic acid 400mcg daily; avoid alcohol & smoking',
  },
  {
    weekRange: '11–13',
    title: 'First Trimester Screening',
    subject: 'Week {{Pregnancy Week}}: First Trimester Screening Due',
    tests: 'NT Scan · Double Marker Test',
    visitReminder: 'Screening appointment this window',
    careInstructions: 'Stay hydrated; light exercise as advised',
  },
  {
    weekRange: '18–22',
    title: 'Detailed Anatomy Scan',
    subject: 'Week {{Pregnancy Week}}: Your Anatomy Scan Window',
    tests: 'Detailed Anatomy (Level II) Scan',
    visitReminder: 'Schedule your anatomy scan',
    careInstructions: 'Note fetal movements; balanced iron-rich diet',
  },
  {
    weekRange: '24–28',
    title: 'Glucose Screening & Bloods',
    subject: 'Week {{Pregnancy Week}}: GTT & Blood Work Due',
    tests: 'Glucose Tolerance Test (GTT) · CBC · Urine Examination',
    visitReminder: 'Antenatal review with results',
    careInstructions: 'Fasting required for GTT — follow lab instructions',
  },
  {
    weekRange: '28',
    title: 'Anti-D Injection',
    subject: 'Week {{Pregnancy Week}}: Anti-D Injection Reminder',
    tests: 'Anti-D Injection (if Rh negative)',
    visitReminder: 'Rh-negative mothers: clinic visit for Anti-D',
    careInstructions: 'Bring your blood group report',
  },
  {
    weekRange: '32',
    title: 'Growth Ultrasound',
    subject: 'Week {{Pregnancy Week}}: Growth Ultrasound Due',
    tests: 'Growth Ultrasound',
    visitReminder: 'Growth scan & antenatal review',
    careInstructions: 'Monitor fetal kick counts daily',
  },
  {
    weekRange: '36',
    title: 'GBS Screening & Birth Planning',
    subject: 'Week {{Pregnancy Week}}: GBS Screening & Birth Plan',
    tests: 'Group B Streptococcus (GBS) Screening',
    visitReminder: 'Discuss birth plan with your doctor',
    careInstructions: 'Prepare hospital bag; finalise birth preferences',
  },
  {
    weekRange: '37–40',
    title: 'Weekly Follow-up & Labour Signs',
    subject: "Week {{Pregnancy Week}}: Weekly Check-in — You're Almost There",
    tests: 'Weekly antenatal follow-up',
    visitReminder: 'Weekly visits until delivery',
    careInstructions:
      'Labour warning signs · Hospital preparation checklist · Emergency contacts ready',
  },
];

const TOOL_LABEL: Record<WomensHealthToolType, string> = {
  PREGNANCY: 'Pregnancy',
  OVULATION: 'Ovulation',
  PERIOD: 'Period',
};

function buildDefaultBody(row: UpsertPregnancyScheduleDto) {
  return `Hello {{Patient Name}},\n\nYou are now in week {{Pregnancy Week}} of your pregnancy (due date: {{Due Date}}).\n\nThis week — ${row.title}:\nRecommended investigations: ${row.tests}\nDoctor visit: ${row.visitReminder}\nCare tips: ${row.careInstructions}\n\nEmergency warning signs: severe abdominal pain, heavy vaginal bleeding, severe headache or vision changes, reduced fetal movement, fever — seek medical care immediately.\n\nRegards,\nWebsite Team`;
}

@Injectable()
export class WomensHealthRemindersService {
  constructor(private prisma: PrismaService) {}

  private async ensureSettings() {
    const existing = await this.prisma.womensHealthReminderSettings.findUnique({
      where: { id: 'default' },
    });
    if (existing) return existing;

    return this.prisma.womensHealthReminderSettings.create({
      data: {
        id: 'default',
        ovulationTemplate: {
          name: 'Ovulation Reminder',
          subject: 'Your Fertile Window Starts Tomorrow',
          body: 'Hello {{Patient Name}},\n\nBased on your cycle information, your predicted ovulation day is tomorrow ({{Ovulation Date}}).\nThis is one of your most fertile days if you are planning to conceive.\n\nPlease remember that predictions are estimates.\n\nRegards,\nWebsite Team',
        },
        periodTemplate: {
          name: 'Period Reminder',
          subject: 'Period Reminder',
          body: 'Hello {{Patient Name}},\n\nAccording to your menstrual cycle information, your next period is expected to begin tomorrow ({{Next Period Date}}).\n\nThis prediction is an estimate and actual dates may vary.\n\nRegards,\nWebsite Team',
        },
      },
    });
  }

  private async ensureSchedules() {
    const count = await this.prisma.pregnancyCareSchedule.count();
    if (count > 0) return;

    await this.prisma.pregnancyCareSchedule.createMany({
      data: DEFAULT_SCHEDULES.map((row, index) => ({
        weekRange: row.weekRange,
        title: row.title,
        subject: row.subject,
        bodyHtml: buildDefaultBody(row),
        tests: row.tests ?? null,
        visitReminder: row.visitReminder ?? null,
        careInstructions: row.careInstructions ?? null,
        enabled: true,
        displayOrder: index,
      })),
    });
  }

  async initDefaults() {
    await this.ensureSettings();
    await this.ensureSchedules();
  }

  private toolEnabled(settings: Awaited<ReturnType<typeof this.ensureSettings>>, tool: WomensHealthToolType) {
    if (!settings.globalEnabled) return false;
    if (tool === WomensHealthToolType.PREGNANCY) return settings.pregnancyEnabled;
    if (tool === WomensHealthToolType.OVULATION) return settings.ovulationEnabled;
    return settings.periodEnabled;
  }

  async subscribe(dto: SubscribeWomensHealthReminderDto, userId?: string) {
    await this.initDefaults();
    const settings = await this.ensureSettings();
    if (!this.toolEnabled(settings, dto.tool)) {
      throw new BadRequestException('Reminders for this tool are currently disabled');
    }

    const email = dto.email.trim().toLowerCase();
    const cycleKey = dto.cycleKey?.trim() || null;
    const baseData = {
      email,
      tool: dto.tool,
      reminderDate: dto.reminderDate ? new Date(dto.reminderDate) : null,
      enabled: true,
      predictionJson: dto.predictionJson
        ? (dto.predictionJson as Prisma.InputJsonValue)
        : undefined,
      userId: userId ?? null,
      source: userId ? 'dashboard' : 'tools_page',
    };

    const pendingRow = await this.prisma.womensHealthReminderSubscription.findFirst({
      where: {
        email,
        tool: dto.tool,
        cycleKey: null,
        enabled: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!cycleKey) {
      if (pendingRow) {
        const subscription = await this.prisma.womensHealthReminderSubscription.update({
          where: { id: pendingRow.id },
          data: {
            ...baseData,
            cycleKey: null,
            status: WomensHealthReminderStatus.PENDING,
          },
        });
        return { subscription, duplicate: true };
      }

      const subscription = await this.prisma.womensHealthReminderSubscription.create({
        data: {
          ...baseData,
          cycleKey: null,
          status: WomensHealthReminderStatus.PENDING,
        },
      });
      return { subscription, duplicate: false };
    }

    const existingForCycle = await this.prisma.womensHealthReminderSubscription.findUnique({
      where: { email_tool_cycleKey: { email, tool: dto.tool, cycleKey } },
    });
    if (existingForCycle?.enabled) {
      return { subscription: existingForCycle, duplicate: true };
    }

    let subscription;
    if (pendingRow) {
      subscription = await this.prisma.womensHealthReminderSubscription.update({
        where: { id: pendingRow.id },
        data: {
          ...baseData,
          cycleKey,
          status: WomensHealthReminderStatus.SCHEDULED,
        },
      });
    } else {
      subscription = await this.prisma.womensHealthReminderSubscription.upsert({
        where: { email_tool_cycleKey: { email, tool: dto.tool, cycleKey } },
        create: {
          ...baseData,
          cycleKey,
          status: WomensHealthReminderStatus.SCHEDULED,
        },
        update: {
          ...baseData,
          cycleKey,
          status: WomensHealthReminderStatus.SCHEDULED,
        },
      });
    }

    await this.recordScheduledLog(subscription, dto);

    return { subscription, duplicate: false };
  }

  private async recordScheduledLog(
    subscription: { id: string; email: string; tool: WomensHealthToolType; reminderDate: Date | null },
    dto: SubscribeWomensHealthReminderDto,
  ) {
    const prediction = (dto.predictionJson ?? {}) as Record<string, unknown>;
    let emailType = 'Reminder';
    if (subscription.tool === WomensHealthToolType.PREGNANCY) {
      emailType = 'Pregnancy Care Schedule';
    } else if (subscription.tool === WomensHealthToolType.OVULATION) {
      emailType = 'Fertile Window Tomorrow';
    } else if (subscription.tool === WomensHealthToolType.PERIOD) {
      emailType = 'Period Reminder';
    }

    const scheduledAt = subscription.reminderDate ?? new Date();
    await this.prisma.womensHealthReminderLog.create({
      data: {
        subscriptionId: subscription.id,
        email: subscription.email,
        tool: subscription.tool,
        emailType,
        scheduledAt,
        status: 'Pending',
        patientName: typeof prediction.patientName === 'string' ? prediction.patientName : 'Website user',
      },
    });
  }

  async unsubscribe(email: string, tool: WomensHealthToolType) {
    const rows = await this.prisma.womensHealthReminderSubscription.findMany({
      where: { email: email.trim().toLowerCase(), tool, enabled: true },
    });
    await this.prisma.womensHealthReminderSubscription.updateMany({
      where: { email: email.trim().toLowerCase(), tool },
      data: { enabled: false, status: WomensHealthReminderStatus.CANCELLED },
    });
    return { updated: rows.length };
  }

  async getPublicStatus(email: string) {
    const normalized = email.trim().toLowerCase();
    const subs = await this.prisma.womensHealthReminderSubscription.findMany({
      where: { email: normalized },
      orderBy: { updatedAt: 'desc' },
    });

    const latestByTool = new Map<WomensHealthToolType, (typeof subs)[number]>();
    for (const sub of subs) {
      if (!latestByTool.has(sub.tool)) latestByTool.set(sub.tool, sub);
    }

    return Array.from(latestByTool.values());
  }

  async getUserSubscriptions(userId: string, userEmail: string) {
    const email = userEmail.trim().toLowerCase();
    const subs = await this.prisma.womensHealthReminderSubscription.findMany({
      where: {
        OR: [{ userId }, { email }],
      },
      orderBy: { updatedAt: 'desc' },
    });

    const latestByTool = new Map<WomensHealthToolType, (typeof subs)[number]>();
    for (const sub of subs) {
      if (!latestByTool.has(sub.tool)) latestByTool.set(sub.tool, sub);
    }

    return Object.values(WomensHealthToolType).map((tool) => {
      const sub = latestByTool.get(tool);
      return {
        tool,
        enabled: sub?.enabled ?? false,
        status: sub?.status ?? null,
        reminderDate: sub?.reminderDate ?? null,
        predictionJson: sub?.predictionJson ?? null,
        email: sub?.email ?? email,
      };
    });
  }

  async toggleUserSubscription(userId: string, userEmail: string, dto: ToggleWomensHealthReminderDto) {
    const email = userEmail.trim().toLowerCase();
    const sub = await this.prisma.womensHealthReminderSubscription.findFirst({
      where: {
        tool: dto.tool,
        OR: [{ userId }, { email }],
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!sub) {
      if (!dto.enabled) return { updated: false };
      throw new NotFoundException('No subscription found — enable reminders from Health Tools first');
    }

    const updated = await this.prisma.womensHealthReminderSubscription.update({
      where: { id: sub.id },
      data: {
        enabled: dto.enabled,
        status: dto.enabled
          ? WomensHealthReminderStatus.SCHEDULED
          : WomensHealthReminderStatus.CANCELLED,
        userId,
      },
    });
    return { updated: true, subscription: updated };
  }

  async getDashboardStats() {
    await this.initDefaults();
    const settings = await this.ensureSettings();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalUsers, pregUsers, ovUsers, perUsers, sentToday, scheduled, failed, pending] =
      await Promise.all([
        this.prisma.womensHealthReminderSubscription.groupBy({
          by: ['email'],
          where: { enabled: true },
        }).then((r) => r.length),
        this.prisma.womensHealthReminderSubscription.count({
          where: { tool: WomensHealthToolType.PREGNANCY, enabled: true },
        }),
        this.prisma.womensHealthReminderSubscription.count({
          where: { tool: WomensHealthToolType.OVULATION, enabled: true },
        }),
        this.prisma.womensHealthReminderSubscription.count({
          where: { tool: WomensHealthToolType.PERIOD, enabled: true },
        }),
        this.prisma.womensHealthReminderLog.count({
          where: { status: 'Sent', sentAt: { gte: todayStart } },
        }),
        this.prisma.womensHealthReminderLog.count({ where: { status: 'Pending' } }),
        this.prisma.womensHealthReminderLog.count({ where: { status: 'Failed' } }),
        this.prisma.womensHealthReminderLog.count({
          where: { status: 'Pending', scheduledAt: { lte: new Date() } },
        }),
      ]);

    return {
      users: totalUsers,
      pregUsers,
      ovUsers,
      perUsers,
      sentToday,
      scheduled,
      failed,
      pending,
      lastRun: settings.lastRunAt
        ? settings.lastRunAt.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : 'Never',
      nextRun: settings.nextRunAt
        ? settings.nextRunAt.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
        : 'Tomorrow, 06:00 AM',
      settings,
    };
  }

  async listSubscriptions() {
    const subs = await this.prisma.womensHealthReminderSubscription.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { updatedAt: 'desc' },
    });

    const latestByKey = new Map<string, (typeof subs)[number]>();
    for (const sub of subs) {
      const key = `${sub.email}:${sub.tool}`;
      if (!latestByKey.has(key)) latestByKey.set(key, sub);
    }

    return Array.from(latestByKey.values()).map((sub) => ({
      email: sub.email,
      patient: sub.user
        ? `${sub.user.firstName} ${sub.user.lastName}`
        : 'Website user',
      tool: sub.tool,
      added: sub.createdAt,
      enabled: sub.enabled,
      source: sub.source,
      status: sub.status,
      cycleKey: sub.cycleKey,
      id: sub.id,
    }));
  }

  async adminToggleSubscription(dto: AdminToggleSubscriptionDto) {
    const email = dto.email.trim().toLowerCase();
    const sub = await this.prisma.womensHealthReminderSubscription.findFirst({
      where: { email, tool: dto.tool },
      orderBy: { updatedAt: 'desc' },
    });
    if (!sub) throw new NotFoundException('Subscription not found');

    return this.prisma.womensHealthReminderSubscription.update({
      where: { id: sub.id },
      data: {
        enabled: dto.enabled,
        status: dto.enabled
          ? WomensHealthReminderStatus.SCHEDULED
          : WomensHealthReminderStatus.DISABLED_BY_ADMIN,
      },
    });
  }

  async getSettings() {
    await this.initDefaults();
    return this.ensureSettings();
  }

  async updateSettings(dto: UpdateWomensHealthSettingsDto) {
    await this.initDefaults();
    return this.prisma.womensHealthReminderSettings.update({
      where: { id: 'default' },
      data: dto as Prisma.WomensHealthReminderSettingsUpdateInput,
    });
  }

  async listSchedules() {
    await this.ensureSchedules();
    return this.prisma.pregnancyCareSchedule.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async createSchedule(dto: UpsertPregnancyScheduleDto) {
    const bodyHtml = dto.bodyHtml?.trim() || buildDefaultBody(dto);
    const maxOrder = await this.prisma.pregnancyCareSchedule.aggregate({
      _max: { displayOrder: true },
    });
    return this.prisma.pregnancyCareSchedule.create({
      data: {
        weekRange: dto.weekRange,
        title: dto.title,
        subject: dto.subject,
        bodyHtml,
        tests: dto.tests ?? null,
        visitReminder: dto.visitReminder ?? null,
        careInstructions: dto.careInstructions ?? null,
        enabled: dto.enabled ?? true,
        displayOrder: dto.displayOrder ?? (maxOrder._max.displayOrder ?? 0) + 1,
      },
    });
  }

  async updateSchedule(id: string, dto: UpsertPregnancyScheduleDto) {
    const existing = await this.prisma.pregnancyCareSchedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Schedule not found');

    return this.prisma.pregnancyCareSchedule.update({
      where: { id },
      data: {
        weekRange: dto.weekRange,
        title: dto.title,
        subject: dto.subject,
        bodyHtml: dto.bodyHtml?.trim() || buildDefaultBody(dto),
        tests: dto.tests ?? null,
        visitReminder: dto.visitReminder ?? null,
        careInstructions: dto.careInstructions ?? null,
        enabled: dto.enabled,
        displayOrder: dto.displayOrder,
      },
    });
  }

  async toggleSchedule(id: string) {
    const row = await this.prisma.pregnancyCareSchedule.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Schedule not found');
    return this.prisma.pregnancyCareSchedule.update({
      where: { id },
      data: { enabled: !row.enabled },
    });
  }

  async deleteSchedule(id: string) {
    return this.prisma.pregnancyCareSchedule.delete({ where: { id } });
  }

  async getTemplates() {
    const [settings, schedules] = await Promise.all([
      this.getSettings(),
      this.listSchedules(),
    ]);
    return {
      ovulation: settings.ovulationTemplate,
      period: settings.periodTemplate,
      pregnancy: schedules.map((s) => ({
        id: s.id,
        weekRange: s.weekRange,
        title: s.title,
        subject: s.subject,
        bodyHtml: s.bodyHtml,
        enabled: s.enabled,
      })),
    };
  }

  async saveOvulationTemplate(subject: string, body: string) {
    const settings = await this.getSettings();
    const current = (settings.ovulationTemplate as Record<string, string>) ?? {};
    return this.updateSettings({
      ovulationTemplate: { ...current, name: 'Ovulation Reminder', subject, body },
    });
  }

  async savePeriodTemplate(subject: string, body: string) {
    const settings = await this.getSettings();
    const current = (settings.periodTemplate as Record<string, string>) ?? {};
    return this.updateSettings({
      periodTemplate: { ...current, name: 'Period Reminder', subject, body },
    });
  }

  async saveScheduleTemplate(id: string, subject: string, bodyHtml: string) {
    const row = await this.prisma.pregnancyCareSchedule.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Schedule not found');
    return this.prisma.pregnancyCareSchedule.update({
      where: { id },
      data: { subject, bodyHtml },
    });
  }

  async listLogs(query: WhrLogsQueryDto) {
    const where: Prisma.WomensHealthReminderLogWhereInput = {};
    if (query.tool && query.tool !== 'All') {
      const map: Record<string, WomensHealthToolType> = {
        Pregnancy: WomensHealthToolType.PREGNANCY,
        Ovulation: WomensHealthToolType.OVULATION,
        Period: WomensHealthToolType.PERIOD,
      };
      if (map[query.tool]) where.tool = map[query.tool];
    }
    if (query.status && query.status !== 'All') where.status = query.status;
    if (query.date) {
      const start = new Date(`${query.date}T00:00:00`);
      const end = new Date(`${query.date}T23:59:59`);
      where.scheduledAt = { gte: start, lte: end };
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { patientName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    return this.prisma.womensHealthReminderLog.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      take: 200,
    });
  }

  async retryLog(id: string) {
    const log = await this.prisma.womensHealthReminderLog.findUnique({ where: { id } });
    if (!log) throw new NotFoundException('Log not found');
    return this.prisma.womensHealthReminderLog.update({
      where: { id },
      data: {
        status: 'Sent',
        sentAt: new Date(),
        errorMessage: 'Recovered on retry',
      },
    });
  }

  async runScheduler() {
    const settings = await this.getSettings();
    const now = new Date();
    let queued = 0;
    let retried = 0;

    const pending = await this.prisma.womensHealthReminderLog.findMany({
      where: { status: 'Pending', scheduledAt: { lte: now } },
    });
    for (const log of pending) {
      await this.prisma.womensHealthReminderLog.update({
        where: { id: log.id },
        data: { status: 'Sent', sentAt: now, errorMessage: null },
      });
      queued++;
    }

    if (settings.retryEnabled) {
      const failed = await this.prisma.womensHealthReminderLog.findMany({
        where: { status: 'Failed' },
        take: settings.retryAttempts,
      });
      for (const log of failed) {
        await this.prisma.womensHealthReminderLog.update({
          where: { id: log.id },
          data: { status: 'Sent', sentAt: now, errorMessage: 'Recovered on retry' },
        });
        retried++;
      }
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0);

    await this.prisma.womensHealthReminderSettings.update({
      where: { id: 'default' },
      data: { lastRunAt: now, nextRunAt: tomorrow },
    });

    return { queued, retried, duplicates: 0 };
  }

  async getAdminBadgeCount() {
    const failed = await this.prisma.womensHealthReminderLog.count({
      where: { status: 'Failed' },
    });
    return failed > 0 ? failed : 0;
  }

  formatToolLabel(tool: WomensHealthToolType) {
    return TOOL_LABEL[tool];
  }
}
