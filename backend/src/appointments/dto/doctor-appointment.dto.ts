import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AppointmentStatus, BookingSource } from '@prisma/client';

export class RescheduleAppointmentDto {
  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class UpdateAppointmentStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancelReason?: string;
}

export class ManualPatientDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsString()
  @Matches(/^[\d+()\-\s]{7,20}$/, { message: 'Please enter a valid mobile number.' })
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;
}

export class CreateManualAppointmentDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ManualPatientDto)
  newPatient?: ManualPatientDto;

  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  durationMinutes?: number;

  @IsEnum(BookingSource)
  bookingSource: BookingSource;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
