import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { AdminPatientListQueryDto, AdminUpdatePatientDto } from './dto/admin-patient.dto';

const adminUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  email: true,
  phone: true,
  status: true,
  isOnline: true,
  createdAt: true,
  lastSeenAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class PatientsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private normalizeAccountStatus(status?: string): UserStatus | undefined {
    if (!status) return undefined;
    const upper = status.toUpperCase();
    if (upper === 'INACTIVE') return undefined;
    if (['ACTIVE', 'SUSPENDED', 'PENDING'].includes(upper)) {
      return upper as UserStatus;
    }
    return undefined;
  }

  private prescriptionLine(items: Prisma.JsonValue) {
    if (!Array.isArray(items) || !items.length) {
      return { medication: null as string | null, dosage: null as string | null };
    }
    const first = items[0] as { medication?: string; dosage?: string; frequency?: string };
    const dosage = [first.dosage, first.frequency].filter(Boolean).join(' — ') || null;
    return {
      medication: first.medication ?? null,
      dosage,
    };
  }

  private bmiCategory(value: number): string {
    if (value < 18.5) return 'Underweight';
    if (value < 25) return 'Normal';
    if (value < 30) return 'Overweight';
    return 'Obese';
  }

  private chronicConditionsFromHistory(medicalHistory?: string | null): string[] {
    if (!medicalHistory?.trim()) return [];
    if (medicalHistory.includes(';')) {
      return medicalHistory
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean);
    }
    const trimmed = medicalHistory.trim();
    if (trimmed.length <= 72) return [trimmed];
    return [`${trimmed.slice(0, 69)}...`];
  }

  async findAllAdmin(query: AdminPatientListQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const order = query.order === 'asc' ? 'asc' : 'desc';
    const userStatusFilter = this.normalizeAccountStatus(query.accountStatus);

    const where: Prisma.PatientProfileWhereInput = {
      user: {
        role: 'PATIENT',
        ...(userStatusFilter && { status: userStatusFilter }),
      },
      ...(query.search && {
        OR: [
          { patientNumber: { contains: query.search, mode: 'insensitive' } },
          { city: { contains: query.search, mode: 'insensitive' } },
          { province: { contains: query.search, mode: 'insensitive' } },
          { country: { contains: query.search, mode: 'insensitive' } },
          { address: { contains: query.search, mode: 'insensitive' } },
          { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
          { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
          { user: { email: { contains: query.search, mode: 'insensitive' } } },
          { user: { phone: { contains: query.search, mode: 'insensitive' } } },
        ],
      }),
    };

    const orderBy: Prisma.PatientProfileOrderByWithRelationInput = (() => {
      switch (query.sort) {
        case 'name':
          return { user: { firstName: order } };
        case 'lastActive':
          return { user: { lastSeenAt: order } };
        case 'createdAt':
        default:
          return { createdAt: order };
      }
    })();

    const [data, total] = await Promise.all([
      this.prisma.patientProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: adminUserSelect },
        },
      }),
      this.prisma.patientProfile.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAdminDetail(patientId: string) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: {
        user: { select: adminUserSelect },
      },
    });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const [appointmentCount, prescriptionCount, questionCount, blogBookmarkCount, publicationBookmarkCount, vitals] =
      await Promise.all([
        this.prisma.appointment.count({ where: { patientId } }),
        this.prisma.prescription.count({ where: { patientId } }),
        this.prisma.askDoctorQuestion.count({ where: { submitterUserId: patient.userId } }),
        this.prisma.blogPostBookmark.count({ where: { userId: patient.userId } }),
        this.prisma.publicationBookmark.count({ where: { userId: patient.userId } }),
        this.prisma.patientVitalReading.findMany({
          where: {
            patientId,
            type: { in: ['HEIGHT', 'WEIGHT', 'BMI'] },
          },
          orderBy: { recordedAt: 'desc' },
          take: 30,
        }),
      ]);

    const latestHeight = vitals.find((item) => item.type === 'HEIGHT');
    const latestWeight = vitals.find((item) => item.type === 'WEIGHT');
    const latestBmi = vitals.find((item) => item.type === 'BMI');
    const heightCm = latestHeight ? Number.parseFloat(latestHeight.value) : NaN;
    const weightKg = latestWeight ? Number.parseFloat(latestWeight.value) : NaN;
    let bmiValue = latestBmi ? Number.parseFloat(latestBmi.value) : NaN;
    if (Number.isNaN(bmiValue) && !Number.isNaN(heightCm) && !Number.isNaN(weightKg) && heightCm > 0) {
      const meters = heightCm / 100;
      bmiValue = weightKg / (meters * meters);
    }

    return {
      ...patient,
      medicalSummary: {
        height: !Number.isNaN(heightCm) ? `${heightCm} cm` : null,
        weight: !Number.isNaN(weightKg) ? `${weightKg} kg` : null,
        bmi: !Number.isNaN(bmiValue) ? bmiValue.toFixed(1) : null,
        bmiTag: !Number.isNaN(bmiValue) ? this.bmiCategory(bmiValue) : null,
        chronicConditions: this.chronicConditionsFromHistory(patient.medicalHistory),
      },
      stats: {
        appointmentCount,
        prescriptionCount,
        questionCount,
        bookmarkCount: blogBookmarkCount + publicationBookmarkCount,
      },
    };
  }

  async getAdminContent(patientId: string) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      select: { id: true, userId: true },
    });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const [appointments, prescriptions, questions, blogBookmarks, publicationBookmarks] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { patientId: patient.id },
        orderBy: { scheduledAt: 'desc' },
        take: 50,
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          consultationType: true,
          reason: true,
          createdAt: true,
          doctor: {
            select: {
              id: true,
              specialty: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.prescription.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          prescriptionNumber: true,
          diagnosis: true,
          status: true,
          items: true,
          issuedAt: true,
          createdAt: true,
          doctor: {
            select: {
              id: true,
              specialty: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.askDoctorQuestion.findMany({
        where: { submitterUserId: patient.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          category: true,
          title: true,
          question: true,
          status: true,
          isAnonymous: true,
          createdAt: true,
          answeredAt: true,
          doctor: {
            select: {
              id: true,
              specialty: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.blogPostBookmark.findMany({
        where: { userId: patient.userId },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        select: {
          id: true,
          readPercent: true,
          createdAt: true,
          updatedAt: true,
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              specialty: true,
              publishedAt: true,
              category: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.publicationBookmark.findMany({
        where: { userId: patient.userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          createdAt: true,
          publication: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              researchCategory: true,
              medicalSpecialty: true,
              publishedAt: true,
            },
          },
        },
      }),
    ]);

    return {
      appointments: appointments.map((appt) => ({
        id: appt.id,
        scheduledAt: appt.scheduledAt,
        status: appt.status,
        consultationType: appt.consultationType,
        reason: appt.reason,
        date: appt.scheduledAt,
        doctorName: appt.doctor
          ? `Dr. ${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`
          : null,
        doctorSpecialty: appt.doctor?.specialty ?? null,
      })),
      prescriptions: prescriptions.map((rx) => {
        const line = this.prescriptionLine(rx.items);
        return {
          id: rx.id,
          prescriptionNumber: rx.prescriptionNumber,
          diagnosis: rx.diagnosis,
          medication: line.medication ?? rx.diagnosis ?? rx.prescriptionNumber,
          dosage: line.dosage,
          status: rx.status,
          date: rx.issuedAt ?? rx.createdAt,
          doctorName: rx.doctor
            ? `Dr. ${rx.doctor.user.firstName} ${rx.doctor.user.lastName}`
            : null,
          doctorSpecialty: rx.doctor?.specialty ?? null,
        };
      }),
      questions: questions.map((q) => ({
        id: q.id,
        category: q.category,
        title: q.title ?? q.question.slice(0, 80),
        status: q.status,
        isAnonymous: q.isAnonymous,
        date: q.createdAt,
        answeredAt: q.answeredAt,
        doctorName: q.doctor
          ? `Dr. ${q.doctor.user.firstName} ${q.doctor.user.lastName}`
          : null,
        doctorSpecialty: q.doctor?.specialty ?? null,
      })),
      bookmarks: [
        ...blogBookmarks.map((b) => ({
          id: b.id,
          type: 'article' as const,
          title: b.post.title,
          slug: b.post.slug,
          status: b.post.status,
          category: b.post.category?.name ?? b.post.specialty ?? 'Article',
          readPercent: b.readPercent,
          date: b.updatedAt ?? b.createdAt,
        })),
        ...publicationBookmarks.map((b) => ({
          id: b.id,
          type: 'publication' as const,
          title: b.publication.title,
          slug: b.publication.slug,
          status: b.publication.status,
          category:
            b.publication.medicalSpecialty ??
            b.publication.researchCategory ??
            'Publication',
          readPercent: null,
          date: b.createdAt,
        })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime()),
    };
  }

  async updateAdminPatient(patientId: string, body: AdminUpdatePatientDto, actorUserId?: string) {
    const patient = await this.prisma.patientProfile.findUnique({
      where: { id: patientId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const {
      firstName,
      lastName,
      phone,
      avatarUrl,
      dateOfBirth,
      allergies,
      healthInterests,
      ...profileFields
    } = body;

    const userUpdate =
      firstName !== undefined || lastName !== undefined || phone !== undefined || avatarUrl !== undefined
        ? {
            ...(firstName !== undefined && { firstName }),
            ...(lastName !== undefined && { lastName }),
            ...(phone !== undefined && { phone }),
            ...(avatarUrl !== undefined && { avatarUrl }),
          }
        : null;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (userUpdate) {
        await tx.user.update({ where: { id: patient.userId }, data: userUpdate });
      }

      return tx.patientProfile.update({
        where: { id: patientId },
        data: {
          ...profileFields,
          ...(dateOfBirth !== undefined && {
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          }),
          ...(allergies !== undefined && { allergies }),
          ...(healthInterests !== undefined && { healthInterests }),
        },
        include: {
          user: { select: adminUserSelect },
        },
      });
    });

    if (actorUserId && patient.userId !== actorUserId) {
      await this.notifications.create(patient.userId, {
        type: 'SYSTEM',
        title: 'Profile updated',
        body: 'Your DrInsight patient profile was updated by an administrator.',
      });
    }

    return updated;
  }
}
