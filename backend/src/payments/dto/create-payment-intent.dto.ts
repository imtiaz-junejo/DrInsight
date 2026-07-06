import { ConsultationType } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  doctorId!: string;

  @IsISO8601()
  appointmentDate!: string;

  @IsString()
  appointmentTime!: string;

  @IsEnum(ConsultationType)
  consultationType!: ConsultationType;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  durationMinutes?: number;
}

export class CreateIntentFromDraftDto {
  @IsString()
  bookingDraftId!: string;

  @IsOptional()
  @IsString()
  billingName?: string;

  @IsOptional()
  @IsString()
  billingEmail?: string;

  @IsOptional()
  @IsString()
  billingCountry?: string;
}

export class RefundPaymentDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
