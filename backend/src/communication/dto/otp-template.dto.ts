import { OtpPurpose, TemplateStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateOtpTemplateDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEnum(OtpPurpose)
  purpose!: OtpPurpose;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsString()
  @MinLength(5)
  message!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  expiryMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(4)
  @Max(8)
  otpLength?: number;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsEnum(TemplateStatus)
  status?: TemplateStatus;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateOtpTemplateDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(OtpPurpose)
  purpose?: OtpPurpose;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  expiryMinutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(4)
  @Max(8)
  otpLength?: number;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsEnum(TemplateStatus)
  status?: TemplateStatus;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateOtpTemplateStatusDto {
  @IsBoolean()
  isEnabled!: boolean;
}

export class PreviewOtpTemplateDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @Type(() => Object)
  variables?: Record<string, string>;
}

export class TestSendOtpTemplateDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  userName?: string;
}
