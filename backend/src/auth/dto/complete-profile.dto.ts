import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PHONE_PATTERN } from '../profile-completeness.util';

export class CompleteProfileDto {
  @IsEnum(['patient', 'physician'])
  accountType: 'patient' | 'physician';

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  accountSubType?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'Please enter a valid phone number.' })
  phone?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(40)
  gender?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'Please enter a valid emergency contact number.' })
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  allergies?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  healthInterests?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contentPreference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  newsletterFrequency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  languagePreference?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  specialty?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  regulatoryBody?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceYears?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clinicalInterests?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  contributions?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  licenseCertificateUrl?: string;
}
