import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContactInquiryStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async submit(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    inquiryType?: string;
  }) {
    return this.prisma.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        inquiryType: data.inquiryType ?? 'GENERAL',
      },
    });
  }

  async subscribeNewsletter(email: string, source = 'website') {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new BadRequestException('Invalid email address');
    }

    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email: normalized },
    });

    if (existing?.isActive) {
      return {
        subscriber: existing,
        alreadySubscribed: true,
        message: 'Email already exist',
      };
    }

    const subscriber = await this.prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      update: { isActive: true, source },
      create: { email: normalized, source, isActive: true },
    });

    return {
      subscriber,
      alreadySubscribed: false,
      message: 'Subscribed successfully',
    };
  }

  async findSubmissions(query?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ContactInquiryStatus;
    inquiryType?: string;
    sort?: string;
  }) {
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;
    const where: Prisma.ContactSubmissionWhereInput = {
      ...(query?.status && { status: query.status }),
      ...(query?.inquiryType && { inquiryType: query.inquiryType }),
      ...(query?.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { subject: { contains: query.search, mode: 'insensitive' } },
          { message: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };
    const orderBy =
      query?.sort === 'oldest' ? { createdAt: 'asc' as const } : { createdAt: 'desc' as const };

    const [data, total] = await Promise.all([
      this.prisma.contactSubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignedStaff: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      this.prisma.contactSubmission.count({ where }),
    ]);

    if (!query?.page) return data;
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getSubmission(id: string) {
    const submission = await this.prisma.contactSubmission.findUnique({
      where: { id },
      include: {
        assignedStaff: { select: { id: true, firstName: true, lastName: true, email: true } },
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
        },
        notes: {
          orderBy: { createdAt: 'asc' },
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
    if (!submission) throw new NotFoundException('Inquiry not found');
    return submission;
  }

  async updateSubmissionStatus(id: string, status: ContactInquiryStatus) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: {
        status,
        isRead: status === 'RESOLVED' || status === 'ARCHIVED' || status === 'IN_PROGRESS',
        ...(status === 'ARCHIVED' && { archivedAt: new Date() }),
      },
    });
  }

  async assignSubmission(id: string, assignedStaffId: string | null) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: {
        assignedStaffId,
        status: 'IN_PROGRESS',
        isRead: true,
      },
      include: {
        assignedStaff: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async addReply(
    id: string,
    authorId: string,
    data: { message: string; isInternal?: boolean },
  ) {
    await this.getSubmission(id);
    const reply = await this.prisma.contactInquiryReply.create({
      data: {
        inquiryId: id,
        authorId,
        message: data.message,
        isInternal: data.isInternal ?? false,
      },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!data.isInternal) {
      await this.prisma.contactSubmission.update({
        where: { id },
        data: { status: 'IN_PROGRESS', isRead: true },
      });
    }
    return reply;
  }

  async addNote(id: string, authorId: string, note: string) {
    await this.getSubmission(id);
    return this.prisma.contactInquiryNote.create({
      data: { inquiryId: id, authorId, note },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async deleteSubmission(id: string) {
    return this.prisma.contactSubmission.delete({ where: { id } });
  }

  async markAsRead(id: string) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
