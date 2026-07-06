import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import type { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private transporterVerified = false;

  constructor(private config: ConfigService) {}

  private resolveSmtpPort(): number {
    return Number(this.config.get('SMTP_PORT', 587));
  }

  private resolveSmtpSecure(port: number): boolean {
    const explicit = this.config.get<string>('SMTP_SECURE');
    if (explicit !== undefined && explicit !== '') {
      return explicit === 'true';
    }
    return port === 465;
  }

  private normalizeSmtpPassword(raw: string | undefined): string {
    return (raw ?? '').replace(/\s+/g, '');
  }

  private getSmtpConfig() {
    const host = this.config.get<string>('SMTP_HOST')?.trim() ?? '';
    const port = this.resolveSmtpPort();
    const user = this.config.get<string>('SMTP_USER')?.trim() ?? '';
    const passRaw = this.config.get<string>('SMTP_PASS') ?? '';
    const pass = this.normalizeSmtpPassword(passRaw);
    const from =
      this.config.get<string>('SMTP_FROM')?.trim() ||
      user ||
      'noreply@drinsight.org';
    const secure = this.resolveSmtpSecure(port);

    return { host, port, user, pass, passRaw, from, secure };
  }

  private isSmtpConfigured(): boolean {
    const { host, port, user, pass } = this.getSmtpConfig();
    return Boolean(host && port && user && pass);
  }

  private logSmtpEnvironment(): void {
    const { host, port, user, passRaw, from, secure } = this.getSmtpConfig();

    this.logger.log('SMTP environment (password omitted):');
    this.logger.log(`  SMTP_HOST=${host || '(empty)'}`);
    this.logger.log(`  SMTP_PORT=${port}`);
    this.logger.log(`  SMTP_USER=${user || '(empty)'}`);
    this.logger.log(`  SMTP_FROM=${from || '(empty)'}`);
    this.logger.log(`  SMTP_SECURE=${secure} (port ${port} -> ${port === 465 ? 'secure true' : port === 587 ? 'secure false' : 'auto from explicit/env'})`);
    this.logger.log(`  SMTP_PASS length=${passRaw.length}, containsSpaces=${/\s/.test(passRaw)}, normalizedLength=${this.normalizeSmtpPassword(passRaw).length}`);
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      const { host, port, user, pass, secure } = this.getSmtpConfig();

      this.logger.log(`Creating Nodemailer transporter (host=${host}, port=${port}, secure=${secure})`);

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
      } satisfies SMTPTransport.Options);
    }
    return this.transporter;
  }

  private async verifyTransporter(transporter: Transporter): Promise<void> {
    if (this.transporterVerified) return;

    this.logger.log('Verifying SMTP transporter with transporter.verify()...');
    try {
      await transporter.verify();
      this.transporterVerified = true;
      this.logger.log('✓ SMTP transporter verified successfully');
    } catch (error) {
      this.logSmtpError('SMTP transporter.verify() failed', error);
      throw error;
    }
  }

  private logSmtpError(context: string, error: unknown): void {
    if (error instanceof Error) {
      this.logger.error(`${context}: ${error.message}`, error.stack);
      const nodemailerError = error as Error & {
        code?: string;
        response?: string;
        responseCode?: number;
        command?: string;
      };
      if (nodemailerError.code) {
        this.logger.error(`  Nodemailer code: ${nodemailerError.code}`);
      }
      if (nodemailerError.responseCode) {
        this.logger.error(`  SMTP response code: ${nodemailerError.responseCode}`);
      }
      if (nodemailerError.response) {
        this.logger.error(`  SMTP response: ${nodemailerError.response}`);
      }
      if (nodemailerError.command) {
        this.logger.error(`  SMTP command: ${nodemailerError.command}`);
      }
      return;
    }

    this.logger.error(`${context}: ${String(error)}`);
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    this.logger.log(`sendPasswordResetEmail() started for recipient=${to}`);
    this.logSmtpEnvironment();

    if (!this.isSmtpConfigured()) {
      this.logger.warn(
        'SMTP not fully configured — skipping sendMail(), logging reset URL to console instead',
      );
      this.logger.log(`[DEV] Password reset link for ${to}: ${resetUrl}`);
      this.logger.log('sendPasswordResetEmail() finished (dev console fallback)');
      return;
    }

    const { from } = this.getSmtpConfig();
    const transporter = this.getTransporter();

    try {
      await this.verifyTransporter(transporter);

      this.logger.log(`Calling sendMail() -> from=${from}, to=${to}`);

      const info = await transporter.sendMail({
        from,
        to,
        subject: 'Reset your DrInsight password',
        text: [
          'You requested a password reset for your DrInsight account.',
          '',
          'Reset your password using this link (expires in 1 hour):',
          resetUrl,
          '',
          'If you did not request this, you can safely ignore this email.',
        ].join('\n'),
        html: `
          <p>You requested a password reset for your DrInsight account.</p>
          <p><a href="${resetUrl}">Reset your password</a></p>
          <p>This link expires in 1 hour and can only be used once.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `,
      });

      this.logger.log('✓ Email successfully sent');
      this.logger.log(`  Message ID: ${info.messageId ?? '(none)'}`);
      this.logger.log(`  Recipient: ${to}`);
      this.logger.log('sendPasswordResetEmail() finished');
    } catch (error) {
      this.logSmtpError('sendMail() failed', error);
      this.logger.error('sendPasswordResetEmail() failed — rethrowing error');
      throw error;
    }
  }

  async sendPaymentConfirmation(
    to: string,
    data: {
      patientName: string;
      doctorName: string;
      specialty: string;
      scheduledAt: Date;
      amount: string;
      transactionId: string;
      receiptUrl?: string | null;
    },
  ): Promise<void> {
    if (!this.isSmtpConfigured()) {
      this.logger.log(`[DEV] Payment confirmation for ${to}: ${data.transactionId}`);
      return;
    }

    const { from } = this.getSmtpConfig();
    const transporter = this.getTransporter();
    const dateStr = data.scheduledAt.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    try {
      await transporter.sendMail({
        from,
        to,
        subject: 'DrInsight — Appointment Confirmed & Payment Receipt',
        text: [
          `Hi ${data.patientName},`,
          '',
          'Your consultation has been confirmed.',
          '',
          `Doctor: ${data.doctorName}`,
          `Specialty: ${data.specialty}`,
          `Date: ${dateStr}`,
          `Amount Paid: ${data.amount}`,
          `Transaction ID: ${data.transactionId}`,
          data.receiptUrl ? `Receipt: ${data.receiptUrl}` : '',
          '',
          'Thank you for choosing DrInsight.',
        ]
          .filter(Boolean)
          .join('\n'),
        html: `
          <p>Hi ${data.patientName},</p>
          <p>Your consultation has been <strong>confirmed</strong> and payment received.</p>
          <ul>
            <li><strong>Doctor:</strong> ${data.doctorName}</li>
            <li><strong>Specialty:</strong> ${data.specialty}</li>
            <li><strong>Date:</strong> ${dateStr}</li>
            <li><strong>Amount Paid:</strong> ${data.amount}</li>
            <li><strong>Transaction ID:</strong> ${data.transactionId}</li>
          </ul>
          ${data.receiptUrl ? `<p><a href="${data.receiptUrl}">View Stripe Receipt</a></p>` : ''}
          <p>Thank you for choosing DrInsight.</p>
        `,
      });
    } catch (error) {
      this.logSmtpError('sendPaymentConfirmation() failed', error);
    }
  }
}
