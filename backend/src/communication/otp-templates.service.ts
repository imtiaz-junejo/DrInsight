import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  OtpDeliveryChannel,
  OtpDeliveryStatus,
  OtpPurpose,
  Prisma,
  TemplateStatus,
} from '@prisma/client';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateOtpTemplateDto,
  PreviewOtpTemplateDto,
  TestSendOtpTemplateDto,
  UpdateOtpTemplateDto,
} from './dto/otp-template.dto';
import { applyTemplateVariables, extractTemplateVariables, generateOtp } from './template-variables.util';

const DEFAULT_OTP_TEMPLATES: Array<{
  name: string;
  purpose: OtpPurpose;
  subject: string;
  message: string;
}> = [
  {
    name: 'Login OTP',
    purpose: OtpPurpose.LOGIN,
    subject: 'Your DrInsight login code',
    message:
      'Hi {{userName}}, your DrInsight login code is {{otp}}. It expires in {{expiry}}.',
  },
  {
    name: 'Registration OTP',
    purpose: OtpPurpose.REGISTRATION,
    subject: 'Verify your DrInsight registration',
    message:
      'Welcome {{userName}}! Your registration code is {{otp}}. Valid for {{expiry}}.',
  },
  {
    name: 'Email Verification',
    purpose: OtpPurpose.EMAIL_VERIFICATION,
    subject: 'Verify your email address',
    message:
      'Your DrInsight verification code is {{otp}}. This code expires in {{expiry}}.',
  },
  {
    name: 'Phone Verification',
    purpose: OtpPurpose.PHONE_VERIFICATION,
    subject: 'Phone verification code',
    message: 'DrInsight code: {{otp}} (valid {{expiry}}). Do not share this code.',
  },
  {
    name: 'Password Reset',
    purpose: OtpPurpose.PASSWORD_RESET,
    subject: 'Password reset verification code',
    message:
      'Your password reset code is {{otp}}. It expires in {{expiry}}. If you did not request this, ignore this email.',
  },
  {
    name: 'Two-Factor Authentication',
    purpose: OtpPurpose.TWO_FACTOR,
    subject: 'Your 2FA verification code',
    message: 'Your DrInsight 2FA code is {{otp}}. Expires in {{expiry}}.',
  },
];

@Injectable()
export class OtpTemplatesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async ensureDefaults() {
    const count = await this.prisma.otpTemplate.count();
    if (count > 0) return;

    await this.prisma.otpTemplate.createMany({
      data: DEFAULT_OTP_TEMPLATES.map((template) => ({
        ...template,
        status: TemplateStatus.ACTIVE,
        isEnabled: true,
        expiryMinutes: 10,
        otpLength: 6,
        senderName: 'DrInsight',
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
    purpose?: OtpPurpose;
  }) {
    await this.ensureDefaults();

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.OtpTemplateWhereInput = {
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { message: { contains: query.search, mode: 'insensitive' } },
          { subject: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.status === 'active' && { status: TemplateStatus.ACTIVE }),
      ...(query.status === 'draft' && { status: TemplateStatus.DRAFT }),
      ...(query.purpose && { purpose: query.purpose }),
    };

    const [data, total] = await Promise.all([
      this.prisma.otpTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ updatedAt: 'desc' }],
        include: { createdBy: { select: this.creatorSelect } },
      }),
      this.prisma.otpTemplate.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  }

  async getStats() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const logs = await this.prisma.otpDeliveryLog.findMany({
      where: { createdAt: { gte: since } },
      select: { channel: true, status: true },
    });

    const emailSent = logs.filter(
      (log) => log.channel === OtpDeliveryChannel.EMAIL && log.status === OtpDeliveryStatus.SENT,
    ).length;
    const smsSent = logs.filter(
      (log) => log.channel === OtpDeliveryChannel.SMS && log.status === OtpDeliveryStatus.SENT,
    ).length;
    const total = logs.length;
    const verified = logs.filter((log) => log.status === OtpDeliveryStatus.VERIFIED).length;
    const successRate = total > 0 ? Math.round((verified / total) * 1000) / 10 : 0;

    return {
      emailSent,
      smsSent,
      successRate,
      total,
    };
  }

  async findOne(id: string) {
    await this.ensureDefaults();
    const template = await this.prisma.otpTemplate.findUnique({
      where: { id },
      include: { createdBy: { select: this.creatorSelect } },
    });
    if (!template) throw new NotFoundException('OTP template not found');
    return template;
  }

  async create(dto: CreateOtpTemplateDto, createdById?: string) {
    return this.prisma.otpTemplate.create({
      data: {
        name: dto.name,
        purpose: dto.purpose,
        subject: dto.subject,
        message: dto.message,
        expiryMinutes: dto.expiryMinutes ?? 10,
        otpLength: dto.otpLength ?? 6,
        senderName: dto.senderName ?? 'DrInsight',
        status: dto.status ?? TemplateStatus.DRAFT,
        isEnabled: dto.isEnabled ?? true,
        createdById,
      },
      include: { createdBy: { select: this.creatorSelect } },
    });
  }

  async update(id: string, dto: UpdateOtpTemplateDto) {
    await this.findOne(id);
    return this.prisma.otpTemplate.update({
      where: { id },
      data: dto,
      include: { createdBy: { select: this.creatorSelect } },
    });
  }

  async setStatus(id: string, isEnabled: boolean) {
    await this.findOne(id);
    return this.prisma.otpTemplate.update({
      where: { id },
      data: { isEnabled, ...(isEnabled ? { status: TemplateStatus.ACTIVE } : {}) },
      include: { createdBy: { select: this.creatorSelect } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.otpTemplate.delete({ where: { id } });
    return { success: true };
  }

  preview(id: string, dto: PreviewOtpTemplateDto) {
    const message = dto.message ?? '';
    const variables = {
      '{{otp}}': '482916',
      '{{otp_code}}': '482916',
      '{{userName}}': 'Ahmed Raza',
      '{{expiry}}': '10 minutes',
      ...dto.variables,
    };
    return { message: applyTemplateVariables(message, variables) };
  }

  async testSend(id: string, dto: TestSendOtpTemplateDto) {
    const template = await this.findOne(id);
    const otp = generateOtp(template.otpLength);
    const expiry = `${template.expiryMinutes} minutes`;
    const variables = {
      '{{otp}}': otp,
      '{{otp_code}}': otp,
      '{{userName}}': dto.userName ?? 'Test User',
      '{{expiry}}': expiry,
    };
    const message = applyTemplateVariables(template.message, variables);
    const subject = applyTemplateVariables(
      template.subject ?? `${template.senderName} verification code`,
      variables,
    );

    try {
      await this.emailService.sendCustomEmail(
        dto.email,
        subject,
        `<p>${message}</p>`,
        message,
      );

      await this.prisma.otpDeliveryLog.create({
        data: {
          templateId: template.id,
          channel: OtpDeliveryChannel.EMAIL,
          status: OtpDeliveryStatus.SENT,
          recipient: dto.email,
        },
      });

      return { success: true, message: 'Test OTP email sent', preview: message };
    } catch {
      await this.prisma.otpDeliveryLog.create({
        data: {
          templateId: template.id,
          channel: OtpDeliveryChannel.EMAIL,
          status: OtpDeliveryStatus.FAILED,
          recipient: dto.email,
        },
      });
      throw new BadRequestException('Failed to send test OTP email');
    }
  }
}
