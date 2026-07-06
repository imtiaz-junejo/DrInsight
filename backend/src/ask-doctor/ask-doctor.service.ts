import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const answeredBySelect = {
  firstName: true,
  lastName: true,
  role: true,
  avatarUrl: true,
  doctorProfile: {
    select: { specialty: true, credentials: true },
  },
} as const;

@Injectable()
export class AskDoctorService {
  constructor(private prisma: PrismaService) {}

  async findAnswered(query: { page?: number; limit?: number; category?: string; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;

    const where = {
      status: QuestionStatus.ANSWERED,
      ...(query.category && { category: { equals: query.category, mode: 'insensitive' as const } }),
      ...(query.search && {
        OR: [
          { question: { contains: query.search, mode: 'insensitive' as const } },
          { answer: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.askDoctorQuestion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { answeredAt: 'desc' },
        include: {
          answeredBy: { select: answeredBySelect },
        },
      }),
      this.prisma.askDoctorQuestion.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async submit(data: {
    category: string;
    question: string;
    name?: string;
    isAnonymous?: boolean;
  }) {
    return this.prisma.askDoctorQuestion.create({
      data: {
        category: data.category,
        question: data.question,
        submitterName: data.isAnonymous ? null : data.name,
        isAnonymous: data.isAnonymous ?? !data.name,
        status: QuestionStatus.PENDING,
      },
    });
  }

  async findPending(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = { status: QuestionStatus.PENDING };

    const [data, total] = await Promise.all([
      this.prisma.askDoctorQuestion.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.askDoctorQuestion.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async answer(questionId: string, doctorUserId: string, answer: string) {
    const question = await this.prisma.askDoctorQuestion.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');

    return this.prisma.askDoctorQuestion.update({
      where: { id: questionId },
      data: {
        answer,
        status: QuestionStatus.ANSWERED,
        answeredById: doctorUserId,
        answeredAt: new Date(),
      },
      include: {
        answeredBy: { select: answeredBySelect },
      },
    });
  }

  async getCategories() {
    const groups = await this.prisma.askDoctorQuestion.groupBy({
      by: ['category'],
      where: { status: QuestionStatus.ANSWERED },
      _count: { _all: true },
      orderBy: { _count: { category: 'desc' } },
    });

    return groups.map((g) => ({
      name: g.category,
      count: g._count._all,
    }));
  }

  async markHelpful(questionId: string) {
    const question = await this.prisma.askDoctorQuestion.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');

    return this.prisma.askDoctorQuestion.update({
      where: { id: questionId },
      data: { helpfulCount: { increment: 1 } },
      select: { id: true, helpfulCount: true },
    });
  }

  async getCount() {
    return this.prisma.askDoctorQuestion.count({ where: { status: QuestionStatus.ANSWERED } });
  }
}
