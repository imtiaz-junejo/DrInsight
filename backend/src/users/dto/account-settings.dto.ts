import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EmailNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  appointments?: boolean;

  @IsOptional()
  @IsBoolean()
  messages?: boolean;

  @IsOptional()
  @IsBoolean()
  articles?: boolean;

  @IsOptional()
  @IsBoolean()
  marketing?: boolean;
}

export class PushNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  appointments?: boolean;

  @IsOptional()
  @IsBoolean()
  messages?: boolean;

  @IsOptional()
  @IsBoolean()
  reminders?: boolean;
}

export class UpdateAccountSettingsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => EmailNotificationSettingsDto)
  emailNotifications?: EmailNotificationSettingsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PushNotificationSettingsDto)
  pushNotifications?: PushNotificationSettingsDto;

  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'ur'])
  locale?: string;

  @IsOptional()
  @IsString()
  timezone?: string;
}

export class DeleteAccountDto {
  @IsString()
  password: string;

  @IsString()
  confirmation: string;
}
