import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, VitalStatus, VitalType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientVitalDto, RecordHealthToolResultDto } from './dto/patient-vital.dto';

const VITAL_LABELS: Record<VitalType, string> = {
  BLOOD_PRESSURE: 'Blood Pressure',
  HEART_RATE: 'Heart Rate',
  OXYGEN_SATURATION: 'Oxygen Sat.',
  BMI: 'BMI',
  BLOOD_SUGAR: 'Blood Sugar',
  TEMPERATURE: 'Temp.',
  WEIGHT: 'Weight',
  HEIGHT: 'Height',
  LDL_CHOLESTEROL: 'LDL Cholesterol',
  STEPS: 'Daily Average',
};

const STATUS_BADGE: Record<VitalStatus, string> = {
  NORMAL: 'vb-n',
  HIGH: 'vb-h',
  LOW: 'vb-l',
  BORDERLINE: 'vb-l',
  GOOD: 'vb-n',
};

const STATUS_LABEL: Record<VitalStatus, string> = {
  NORMAL: 'Normal',
  HIGH: 'High',
  LOW: 'Low',
  BORDERLINE: 'Borderline',
  GOOD: 'Good',
};

@Injectable()
export class PatientHealthService {
  constructor(private prisma: PrismaService) {}

  private async requirePatient(userId: string) {
    let patient = await this.prisma.patientProfile.findUnique({ where: { userId } });
    if (!patient) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      patient = await this.prisma.patientProfile.create({
        data: { userId },
      });
    }
    return patient;
  }

  async getLatestVitals(userId: string) {
    const patient = await this.requirePatient(userId);
    const types = Object.values(VitalType);
    const readings = await Promise.all(
      types.map(async (type) => {
        const row = await this.prisma.patientVitalReading.findFirst({
          where: { patientId: patient.id, type },
          orderBy: { recordedAt: 'desc' },
        });
        return row;
      }),
    );
    return readings.filter(Boolean);
  }

  async getVitalHistory(userId: string, type?: VitalType) {
    const patient = await this.requirePatient(userId);
    return this.prisma.patientVitalReading.findMany({
      where: { patientId: patient.id, ...(type ? { type } : {}) },
      orderBy: { recordedAt: 'desc' },
      take: 50,
    });
  }

  async createVital(userId: string, dto: CreatePatientVitalDto) {
    const patient = await this.requirePatient(userId);
    return this.prisma.patientVitalReading.create({
      data: {
        patientId: patient.id,
        type: dto.type,
        value: dto.value,
        unit: dto.unit ?? null,
        status: dto.status ?? VitalStatus.NORMAL,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : new Date(),
        notes: dto.notes ?? null,
      },
    });
  }

  async getHealthScore(userId: string) {
    const vitals = await this.getLatestVitals(userId);
    if (!vitals.length) {
      return {
        score: 0,
        status: 'No data',
        attentionCount: 0,
        dimensions: [
          { label: 'Heart', value: 0, color: 'var(--gray-400)' },
          { label: 'Metabolic', value: 0, color: 'var(--gray-400)' },
          { label: 'Sleep', value: 0, color: 'var(--gray-400)' },
          { label: 'Activity', value: 0, color: 'var(--gray-400)' },
        ],
      };
    }

    const scoreFor = (status: VitalStatus) => {
      if (status === VitalStatus.NORMAL || status === VitalStatus.GOOD) return 90;
      if (status === VitalStatus.BORDERLINE || status === VitalStatus.LOW) return 65;
      return 45;
    };

    const byType = new Map(vitals.map((v) => [v!.type, v!]));
    const heartTypes: VitalType[] = [VitalType.BLOOD_PRESSURE, VitalType.HEART_RATE];
    const metabolicTypes: VitalType[] = [VitalType.BMI, VitalType.BLOOD_SUGAR, VitalType.LDL_CHOLESTEROL];
    const activityTypes: VitalType[] = [VitalType.STEPS];

    const avg = (types: VitalType[]) => {
      const rows = types.map((t) => byType.get(t)).filter(Boolean);
      if (!rows.length) return 75;
      return Math.round(rows.reduce((sum, r) => sum + scoreFor(r!.status), 0) / rows.length);
    };

    const heart = avg(heartTypes);
    const metabolic = avg(metabolicTypes);
    const activity = avg(activityTypes);
    const sleep = 70;
    const dimensions = [
      { label: 'Heart', value: heart, color: heart >= 80 ? 'var(--green)' : heart >= 65 ? 'var(--amber)' : 'var(--red)' },
      { label: 'Metabolic', value: metabolic, color: metabolic >= 80 ? 'var(--green)' : metabolic >= 65 ? 'var(--amber)' : 'var(--red)' },
      { label: 'Sleep', value: sleep, color: sleep >= 80 ? 'var(--green)' : 'var(--amber)' },
      { label: 'Activity', value: activity, color: activity >= 80 ? 'var(--green)' : activity >= 65 ? 'var(--amber)' : 'var(--red)' },
    ];
    const score = Math.round(dimensions.reduce((s, d) => s + d.value, 0) / dimensions.length);
    const attentionCount = dimensions.filter((d) => d.value < 80).length;

    return {
      score,
      status: score >= 80 ? 'Good 🟢' : score >= 65 ? 'Fair 🟡' : 'Needs attention 🔴',
      attentionCount,
      dimensions,
    };
  }

  formatVitalsForClient(vitals: Awaited<ReturnType<typeof this.getLatestVitals>>) {
    return vitals.map((v) => ({
      id: v!.id,
      val: v!.value,
      unit: v!.unit ?? '',
      label: VITAL_LABELS[v!.type],
      badge: STATUS_BADGE[v!.status],
      badgeLabel: STATUS_LABEL[v!.status],
      recordedAt: v!.recordedAt,
    }));
  }

  async getHealthToolHistory(userId: string, limit = 20) {
    return this.prisma.healthToolUsage.findMany({
      where: { userId },
      include: { tool: { select: { name: true, iconEmoji: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async recordHealthToolResult(userId: string, dto: RecordHealthToolResultDto) {
    const tool = await this.prisma.healthTool.findUnique({ where: { slug: dto.slug } });
    if (!tool) throw new NotFoundException('Health tool not found');

    const [usage] = await this.prisma.$transaction([
      this.prisma.healthToolUsage.create({
        data: {
          toolId: tool.id,
          userId,
          resultSummary: dto.resultSummary,
          notes: dto.notes ?? null,
          resultJson: dto.resultJson ? (dto.resultJson as Prisma.InputJsonValue) : undefined,
        },
        include: { tool: { select: { name: true, iconEmoji: true, slug: true } } },
      }),
      this.prisma.healthTool.update({
        where: { id: tool.id },
        data: { usageCount: { increment: 1 } },
      }),
    ]);

    return usage;
  }

  async getHealthToolsUsedCount(userId: string) {
    return this.prisma.healthToolUsage.count({ where: { userId } });
  }
}
