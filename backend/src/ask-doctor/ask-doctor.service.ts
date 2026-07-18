import { Injectable, NotFoundException } from '@nestjs/common';
import { QuestionStatus, Prisma } from '@prisma/client';
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

    const searchTerm = query.search?.trim().replace(/\s+/g, ' ');

    const where = {
      status: QuestionStatus.ANSWERED,
      ...(query.category && { category: { equals: query.category, mode: 'insensitive' as const } }),
      ...(searchTerm && {
        OR: [
          { question: { contains: searchTerm, mode: 'insensitive' as const } },
          { answer: { contains: searchTerm, mode: 'insensitive' as const } },
          { category: { contains: searchTerm, mode: 'insensitive' as const } },
          {
            answeredBy: {
              doctorProfile: {
                specialty: { contains: searchTerm, mode: 'insensitive' as const },
              },
            },
          },
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
    if (question.status !== QuestionStatus.APPROVED && question.status !== QuestionStatus.PENDING) {
      throw new NotFoundException('Question is not available for answering');
    }

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

  async findForDoctor(
    doctorUserId: string,
    view: 'new' | 'drafts' | 'answered' | 'rejected',
    query: { page?: number; limit?: number },
  ) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where =
      view === 'new'
        ? { status: QuestionStatus.APPROVED, answerDraft: null }
        : view === 'drafts'
          ? { status: QuestionStatus.APPROVED, answerDraft: { not: null } }
          : view === 'answered'
            ? { status: QuestionStatus.ANSWERED, answeredById: doctorUserId }
            : { status: QuestionStatus.REJECTED };

    const [data, total] = await Promise.all([
      this.prisma.askDoctorQuestion.findMany({
        where,
        skip,
        take: limit,
        orderBy: view === 'answered' ? { answeredAt: 'desc' } : { createdAt: 'desc' },
        include: { answeredBy: { select: answeredBySelect } },
      }),
      this.prisma.askDoctorQuestion.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async saveDraft(questionId: string, draft: string) {
    const question = await this.prisma.askDoctorQuestion.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');

    return this.prisma.askDoctorQuestion.update({
      where: { id: questionId },
      data: { answerDraft: draft || null },
    });
  }

  async reject(questionId: string, doctorUserId: string, reason: string) {
    const question = await this.prisma.askDoctorQuestion.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');

    return this.prisma.askDoctorQuestion.update({
      where: { id: questionId },
      data: {
        status: QuestionStatus.REJECTED,
        rejectReason: reason,
        rejectedAt: new Date(),
        answeredById: doctorUserId,
      },
    });
  }

  async submitForPatient(
    userId: string,
    data: {
      category: string;
      title: string;
      question: string;
      doctorId?: string;
      attachments?: unknown;
      isAnonymous?: boolean;
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.askDoctorQuestion.create({
      data: {
        category: data.category,
        title: data.title,
        question: data.question,
        submitterUserId: userId,
        doctorId: data.doctorId ?? null,
        attachments: data.attachments ? (data.attachments as Prisma.InputJsonValue) : undefined,
        submitterName: data.isAnonymous ? null : `${user.firstName} ${user.lastName}`.trim(),
        isAnonymous: data.isAnonymous ?? false,
        status: QuestionStatus.PENDING,
      },
      include: {
        answeredBy: { select: answeredBySelect },
        doctor: {
          include: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async findForPatient(
    userId: string,
    view: 'pending' | 'answered' | 'rejected',
    query: { page?: number; limit?: number },
  ) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const status =
      view === 'pending'
        ? QuestionStatus.PENDING
        : view === 'answered'
          ? QuestionStatus.ANSWERED
          : QuestionStatus.REJECTED;

    const where = { submitterUserId: userId, status };

    const [data, total] = await Promise.all([
      this.prisma.askDoctorQuestion.findMany({
        where,
        skip,
        take: limit,
        orderBy: view === 'answered' ? { answeredAt: 'desc' } : { createdAt: 'desc' },
        include: {
          answeredBy: { select: answeredBySelect },
          doctor: {
            include: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      }),
      this.prisma.askDoctorQuestion.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPatientQuestionCounts(userId: string) {
    const [pending, answered, rejected] = await Promise.all([
      this.prisma.askDoctorQuestion.count({
        where: {
          submitterUserId: userId,
          status: { in: [QuestionStatus.PENDING, QuestionStatus.APPROVED] },
        },
      }),
      this.prisma.askDoctorQuestion.count({ where: { submitterUserId: userId, status: QuestionStatus.ANSWERED } }),
      this.prisma.askDoctorQuestion.count({ where: { submitterUserId: userId, status: QuestionStatus.REJECTED } }),
    ]);
    return { pending, answered, rejected };
  }

  async findForAdmin(
    view: 'pending' | 'approved' | 'rejected' | 'answered' | 'reports',
    query: {
      page?: number;
      limit?: number;
      search?: string;
      category?: string;
      doctorId?: string;
      from?: string;
      to?: string;
    },
  ) {
    if (view === 'reports') {
      return this.getAdminQuestionReports();
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const status =
      view === 'pending'
        ? QuestionStatus.PENDING
        : view === 'approved'
          ? QuestionStatus.APPROVED
          : view === 'answered'
            ? QuestionStatus.ANSWERED
            : QuestionStatus.REJECTED;

    const where: Prisma.AskDoctorQuestionWhereInput = { status };

    if (query.category) where.category = { equals: query.category, mode: 'insensitive' };
    if (query.doctorId) where.doctorId = query.doctorId;
    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: new Date(query.from) } : {}),
        ...(query.to ? { lte: new Date(`${query.to}T23:59:59.999Z`) } : {}),
      };
    }
    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { question: { contains: term, mode: 'insensitive' } },
        { title: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
        { submitterName: { contains: term, mode: 'insensitive' } },
      ];
    }

    const include = {
      answeredBy: { select: answeredBySelect },
      submitter: { select: { id: true, firstName: true, lastName: true, email: true } },
      doctor: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    } as const;

    const [data, total, stats] = await Promise.all([
      this.prisma.askDoctorQuestion.findMany({
        where,
        skip,
        take: limit,
        orderBy: view === 'answered' ? { answeredAt: 'desc' } : { createdAt: 'desc' },
        include,
      }),
      this.prisma.askDoctorQuestion.count({ where }),
      this.getAdminQuestionStats(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      stats,
    };
  }

  async getAdminQuestionStats() {
    const [pending, approved, answered, rejected] = await Promise.all([
      this.prisma.askDoctorQuestion.count({ where: { status: QuestionStatus.PENDING } }),
      this.prisma.askDoctorQuestion.count({ where: { status: QuestionStatus.APPROVED } }),
      this.prisma.askDoctorQuestion.count({ where: { status: QuestionStatus.ANSWERED } }),
      this.prisma.askDoctorQuestion.count({ where: { status: QuestionStatus.REJECTED } }),
    ]);
    return { pending, approved, answered, rejected };
  }

  async getAdminQuestionReports() {
    const [byCategory, byMonth, totals] = await Promise.all([
      this.prisma.askDoctorQuestion.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { _count: { category: 'desc' } },
      }),
      this.prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
        SELECT to_char("createdAt", 'YYYY-MM') as month, COUNT(*)::bigint as count
        FROM ask_doctor_questions
        GROUP BY 1
        ORDER BY 1 DESC
        LIMIT 12
      `,
      this.getAdminQuestionStats(),
    ]);

    return {
      totals,
      byCategory: byCategory.map((row) => ({ category: row.category, count: row._count._all })),
      byMonth: byMonth.map((row) => ({ month: row.month, count: Number(row.count) })),
    };
  }

  async approveQuestion(questionId: string, doctorId?: string) {
    const question = await this.prisma.askDoctorQuestion.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');
    if (question.status !== QuestionStatus.PENDING) {
      throw new NotFoundException('Only pending questions can be approved');
    }

    return this.prisma.askDoctorQuestion.update({
      where: { id: questionId },
      data: {
        status: QuestionStatus.APPROVED,
        approvedAt: new Date(),
        ...(doctorId ? { doctorId } : {}),
      },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
        submitter: { select: { firstName: true, lastName: true, email: true } },
      },
    });
  }

  async adminRejectQuestion(questionId: string, reason: string) {
    const question = await this.prisma.askDoctorQuestion.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');
    if (question.status === QuestionStatus.ANSWERED) {
      throw new NotFoundException('Answered questions cannot be rejected');
    }

    return this.prisma.askDoctorQuestion.update({
      where: { id: questionId },
      data: {
        status: QuestionStatus.REJECTED,
        rejectReason: reason,
        rejectedAt: new Date(),
      },
    });
  }

  async reassignQuestion(questionId: string, doctorId: string) {
    const question = await this.prisma.askDoctorQuestion.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');

    const doctor = await this.prisma.doctorProfile.findUnique({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.askDoctorQuestion.update({
      where: { id: questionId },
      data: { doctorId },
      include: {
        doctor: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
    });
  }
}
