import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { WomensHealthToolType } from '@prisma/client';

export class SubscribeWomensHealthReminderDto {
  @ApiProperty({ enum: WomensHealthToolType })
  @IsEnum(WomensHealthToolType)
  tool!: WomensHealthToolType;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cycleKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reminderDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  predictionJson?: Record<string, unknown>;
}

export class ToggleWomensHealthReminderDto {
  @ApiProperty({ enum: WomensHealthToolType })
  @IsEnum(WomensHealthToolType)
  tool!: WomensHealthToolType;

  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;
}

export class UpdateWomensHealthSettingsDto {
  @IsOptional() @IsBoolean() globalEnabled?: boolean;
  @IsOptional() @IsBoolean() pregnancyEnabled?: boolean;
  @IsOptional() @IsBoolean() ovulationEnabled?: boolean;
  @IsOptional() @IsBoolean() periodEnabled?: boolean;
  @IsOptional() @IsBoolean() queueEnabled?: boolean;
  @IsOptional() @IsBoolean() retryEnabled?: boolean;
  @IsOptional() @IsEmail() senderEmail?: string;
  @IsOptional() @IsString() senderName?: string;
  @IsOptional() @IsInt() @Min(0) @Max(7) ovulationDaysBefore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(7) periodDaysBefore?: number;
  @IsOptional() @IsInt() @Min(1) @Max(10) retryAttempts?: number;
  @IsOptional() @IsObject() ovulationTemplate?: Record<string, unknown>;
  @IsOptional() @IsObject() periodTemplate?: Record<string, unknown>;
}

export class UpsertPregnancyScheduleDto {
  @ApiProperty()
  @IsString()
  weekRange!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  subject!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bodyHtml?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tests?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  visitReminder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  careInstructions?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;
}

export class AdminToggleSubscriptionDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: WomensHealthToolType })
  @IsEnum(WomensHealthToolType)
  tool!: WomensHealthToolType;

  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;
}

export class WhrLogsQueryDto {
  @IsOptional() @IsString() tool?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() date?: string;
  @IsOptional() @IsString() q?: string;
}
