import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TemplateStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEmailTemplateDto,
  PreviewEmailTemplateDto,
  UpdateEmailTemplateDto,
} from './dto/email-template.dto';
import { applyTemplateVariables, extractTemplateVariables } from './template-variables.util';

const DEFAULT_EMAIL_TEMPLATES = [
  {
    name: 'Welcome / Registration',
    icon: '👋',
    category: 'Onboarding',
    subject: 'Welcome to {{hospitalName}}, {{patientName}}!',
    bodyHtml:
      '<p>Hi {{patientName}},</p><p>Welcome to {{hospitalName}}. Your account has been created successfully.</p>',
    status: TemplateStatus.ACTIVE,
  },
  {
    name: 'Email Verification',
    icon: '✅',
    category: 'Security',
    subject: 'Verify your email address',
    bodyHtml:
      '<p>Hi {{patientName}},</p><p>Your verification code is <strong>{{verificationCode}}</strong>.</p>',
    status: TemplateStatus.ACTIVE,
  },
  {
    name: 'Password Reset',
    icon: '🔑',
    category: 'Security',
    subject: 'Reset your password',
    bodyHtml:
      '<p>Hi {{patientName}},</p><p>Click <a href="{{resetLink}}">here</a> to reset your password.</p>',
    status: TemplateStatus.ACTIVE,
  },
  {
    name: 'Appointment Confirmation',
    icon: '📅',
    category: 'Appointments',
    subject: 'Appointment confirmed with {{doctorName}}',
    bodyHtml:
      '<p>Hi {{patientName}},</p><p>Your appointment with {{doctorName}} is confirmed for {{appointmentDate}} at {{appointmentTime}}.</p>',
    status: TemplateStatus.ACTIVE,
  },
  {
    name: 'Appointment Reminder (24h)',
    icon: '⏰',
    category: 'Appointments',
    subject: 'Reminder: consultation tomorrow',
    bodyHtml:
      '<p>Hi {{patientName}},</p><p>This is a reminder for your consultation with {{doctorName}} on {{appointmentDate}} at {{appointmentTime}}.</p>',
    status: TemplateStatus.ACTIVE,
  },
  {
    name: 'Appointment Cancelled',
    icon: '❌',
    category: 'Appointments',
    subject: 'Appointment cancelled',
    bodyHtml:
      '<p>Hi {{patientName}},</p><p>Your appointment with {{doctorName}} on {{appointmentDate}} has been cancelled.</p>',
    status: TemplateStatus.ACTIVE,
  },
  {
    name: 'Article Approved',
    icon: '📰',
    category: 'Editorial',
    subject: 'Your article has been approved',
    bodyHtml:
      '<p>Hi {{doctorName}},</p><p>Your article has been approved and published on {{hospitalName}}.</p>',
    status: TemplateStatus.ACTIVE,
  },
  {
    name: 'Article Rejected',
    icon: '📝',
    category: 'Editorial',
    subject: 'Article requires revisions',
    bodyHtml:
      '<p>Hi {{doctorName}},</p><p>Your article requires revisions before it can be published.</p>',
    status: TemplateStatus.ACTIVE,
  },
  {
    name: 'Doctor Account Verified',
    icon: '🩺',
    category: 'Onboarding',
    subject: 'Your physician account is verified',
    bodyHtml:
      '<p>Hi {{doctorName}},</p><p>Your physician account on {{hospitalName}} has been verified.</p>',
    status: TemplateStatus.ACTIVE,
  },
  {
    name: 'Weekly Newsletter',
    icon: '📧',
    category: 'Marketing',
    subject: 'Your weekly health digest from {{hospitalName}}',
    bodyHtml:
      '<p>Hi {{patientName}},</p><p>Here is your weekly health digest from {{hospitalName}}.</p>',
    status: TemplateStatus.DRAFT,
  },
];

@Injectable()
export class EmailTemplatesService {
  constructor(private prisma: PrismaService) {}

  async ensureDefaults() {
    const count = await this.prisma.emailTemplate.count();
    if (count > 0) return;

    await this.prisma.emailTemplate.createMany({
      data: DEFAULT_EMAIL_TEMPLATES.map((template) => ({
        ...template,
        variables: extractTemplateVariables(template.subject, template.bodyHtml),
        isEnabled: true,
      })),
    });
  }

  private creatorSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
  } as const;

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'active' | 'draft';
  }) {
    await this.ensureDefaults();

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EmailTemplateWhereInput = {
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { subject: { contains: query.search, mode: 'insensitive' } },
          { category: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.status === 'active' && { status: TemplateStatus.ACTIVE }),
      ...(query.status === 'draft' && { status: TemplateStatus.DRAFT }),
    };

    const [data, total] = await Promise.all([
      this.prisma.emailTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ updatedAt: 'desc' }],
        include: { createdBy: { select: this.creatorSelect } },
      }),
      this.prisma.emailTemplate.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  }

  async findOne(id: string) {
    await this.ensureDefaults();
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
      include: { createdBy: { select: this.creatorSelect } },
    });
    if (!template) throw new NotFoundException('Email template not found');
    return template;
  }

  async create(dto: CreateEmailTemplateDto, createdById?: string) {
    const variables =
      dto.variables ?? extractTemplateVariables(dto.subject, dto.bodyHtml);

    return this.prisma.emailTemplate.create({
      data: {
        name: dto.name,
        subject: dto.subject,
        category: dto.category,
        bodyHtml: dto.bodyHtml,
        variables,
        status: dto.status ?? TemplateStatus.DRAFT,
        isEnabled: dto.isEnabled ?? true,
        icon: dto.icon,
        createdById,
      },
      include: { createdBy: { select: this.creatorSelect } },
    });
  }

  async update(id: string, dto: UpdateEmailTemplateDto) {
    const existing = await this.findOne(id);
    const subject = dto.subject ?? existing.subject;
    const bodyHtml = dto.bodyHtml ?? existing.bodyHtml;
    const variables =
      dto.variables ?? extractTemplateVariables(subject, bodyHtml);

    return this.prisma.emailTemplate.update({
      where: { id },
      data: { ...dto, variables },
      include: { createdBy: { select: this.creatorSelect } },
    });
  }

  async setStatus(id: string, isEnabled: boolean) {
    await this.findOne(id);
    return this.prisma.emailTemplate.update({
      where: { id },
      data: { isEnabled },
      include: { createdBy: { select: this.creatorSelect } },
    });
  }

  async duplicate(id: string, createdById?: string) {
    const template = await this.findOne(id);
    return this.prisma.emailTemplate.create({
      data: {
        name: `${template.name} (Copy)`,
        subject: template.subject,
        category: template.category,
        bodyHtml: template.bodyHtml,
        variables: template.variables,
        status: TemplateStatus.DRAFT,
        isEnabled: false,
        icon: template.icon,
        createdById,
      },
      include: { createdBy: { select: this.creatorSelect } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.emailTemplate.delete({ where: { id } });
    return { success: true };
  }

  preview(dto: PreviewEmailTemplateDto) {
    const subject = applyTemplateVariables(dto.subject ?? '', dto.variables);
    const bodyHtml = applyTemplateVariables(dto.bodyHtml ?? '', dto.variables);
    return { subject, bodyHtml };
  }
}
