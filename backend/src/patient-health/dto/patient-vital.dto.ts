import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { VitalStatus, VitalType } from '@prisma/client';

export class CreatePatientVitalDto {
  @IsEnum(VitalType)
  type!: VitalType;

  @IsString()
  @MaxLength(64)
  value!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  unit?: string;

  @IsOptional()
  @IsEnum(VitalStatus)
  status?: VitalStatus;

  @IsOptional()
  @IsString()
  recordedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RecordHealthToolResultDto {
  @IsString()
  slug!: string;

  @IsString()
  @MaxLength(200)
  resultSummary!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsOptional()
  resultJson?: Record<string, unknown>;
}
