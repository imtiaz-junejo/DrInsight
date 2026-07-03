import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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

  async setUserStatus(userId: string, status: UserStatus) {
    return this.prisma.user.update({
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
