import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditCategory, AuditSeverity, UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auditLogService: AuditLogService,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        avatarUrl: true,
        phone: true,
        emailVerified: true,
        isOnline: true,
        lastSeenAt: true,
        createdAt: true,
        doctorProfile: true,
        patientProfile: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAdminProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        doctorProfile: {
          include: {
            reviews: {
              take: 10,
              orderBy: { createdAt: 'desc' },
              include: {
                patient: {
                  include: {
                    user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
                  },
                },
              },
            },
          },
        },
        patientProfile: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const userTag = `#USR-${user.id.slice(-4)}`;
    const doctorId = user.doctorProfile?.id;
    const patientId = user.patientProfile?.id;

    const [
      appointmentCount,
      completedAppointments,
      upcomingAppointments,
      blogPostCount,
      publicationCount,
      publicationBookmarkCount,
      recentAppointments,
      recentBlogPosts,
      recentPublications,
      auditLogs,
    ] = await Promise.all([
      doctorId
        ? this.prisma.appointment.count({ where: { doctorId } })
        : patientId
          ? this.prisma.appointment.count({ where: { patientId } })
          : 0,
      doctorId
        ? this.prisma.appointment.count({ where: { doctorId, status: 'COMPLETED' } })
        : patientId
          ? this.prisma.appointment.count({ where: { patientId, status: 'COMPLETED' } })
          : 0,
      doctorId
        ? this.prisma.appointment.count({
            where: { doctorId, status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } },
          })
        : patientId
          ? this.prisma.appointment.count({
              where: { patientId, status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] } },
            })
          : 0,
      user.role === 'DOCTOR' ? this.prisma.blogPost.count({ where: { authorId: id } }) : 0,
      doctorId ? this.prisma.publication.count({ where: { doctorId } }) : 0,
      this.prisma.publicationBookmark.count({ where: { userId: id } }),
      doctorId
        ? this.prisma.appointment.findMany({
            where: { doctorId },
            take: 10,
            orderBy: { scheduledAt: 'desc' },
            include: {
              patient: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } } },
              payment: { select: { status: true, amountCents: true, currency: true } },
            },
          })
        : patientId
          ? this.prisma.appointment.findMany({
              where: { patientId },
              take: 10,
              orderBy: { scheduledAt: 'desc' },
              include: {
                doctor: {
                  include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } } },
                },
                payment: { select: { status: true, amountCents: true, currency: true } },
              },
            })
          : [],
      user.role === 'DOCTOR'
        ? this.prisma.blogPost.findMany({
            where: { authorId: id },
            take: 10,
            orderBy: { updatedAt: 'desc' },
            include: { category: true },
          })
        : [],
      doctorId
        ? this.prisma.publication.findMany({
            where: { doctorId },
            take: 10,
            orderBy: { updatedAt: 'desc' },
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              publicationType: true,
              publicationDate: true,
              submittedAt: true,
              viewCount: true,
              downloadCount: true,
              citationCount: true,
            },
          })
        : [],
      this.prisma.auditLogEntry.findMany({
        where: {
          OR: [
            { actorUserId: id },
            { target: { contains: userTag, mode: 'insensitive' } },
            { target: { contains: user.email, mode: 'insensitive' } },
            {
              target: {
                contains: `${user.firstName} ${user.lastName}`,
                mode: 'insensitive',
              },
            },
          ],
        },
        take: 15,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      ...user,
      stats: {
        appointmentCount,
        completedAppointments,
        upcomingAppointments,
        blogPostCount,
        publicationCount,
        publicationBookmarkCount,
      },
      recentAppointments,
      recentBlogPosts,
      recentPublications,
      auditLogs,
    };
  }

  async findAll(query: { role?: UserRole; page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.role && { role: query.role }),
      ...(query.search && {
        OR: [
          { firstName: { contains: query.search, mode: 'insensitive' as const } },
          { lastName: { contains: query.search, mode: 'insensitive' as const } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          avatarUrl: true,
          phone: true,
          createdAt: true,
          doctorProfile: { select: { specialty: true, licenseNumber: true } },
          patientProfile: { select: { dateOfBirth: true, gender: true, bloodGroup: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updatePatientProfile(
    userId: string,
    data: {
      dateOfBirth?: string;
      gender?: string;
      bloodGroup?: string;
      allergies?: string[];
      medicalHistory?: string;
      emergencyContact?: string;
    },
  ) {
    const profile = await this.prisma.patientProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Patient profile not found');

    return this.prisma.patientProfile.update({
      where: { userId },
      data: {
        ...(data.dateOfBirth && { dateOfBirth: new Date(data.dateOfBirth) }),
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        allergies: data.allergies,
        medicalHistory: data.medicalHistory,
        emergencyContact: data.emergencyContact,
      },
    });
  }

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        phone: true,
      },
    });
  }

  async setUserStatus(userId: string, status: UserStatus, actor?: { id: string; firstName: string; lastName: string; role: string }) {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    if (actor) {
      await this.auditLogService.log({
        actorUserId: actor.id,
        actorName: `${actor.firstName} ${actor.lastName}`,
        actorRole: actor.role,
        action:
          status === UserStatus.ACTIVE && existing.status === UserStatus.PENDING
            ? 'Verified user'
            : status === UserStatus.SUSPENDED
              ? 'Suspended user'
              : status === UserStatus.ACTIVE
                ? 'Reactivated user'
                : 'Updated user status',
        target: `${existing.firstName} ${existing.lastName} (#USR-${existing.id.slice(-4)})`,
        severity: status === UserStatus.SUSPENDED ? AuditSeverity.SENSITIVE : AuditSeverity.INFO,
        category: AuditCategory.ADMIN,
        details: { previousStatus: existing.status, newStatus: status },
      });
    }

    return updated;
  }

  async findPending() {
    return this.prisma.user.findMany({
      where: { status: 'PENDING' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
        doctorProfile: { select: { specialty: true, licenseNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setOnlineStatus(userId: string, isOnline: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isOnline, lastSeenAt: new Date() },
    });
  }
}
