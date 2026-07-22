import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class AdminDoctorListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'PENDING', 'INACTIVE'])
  accountStatus?: string;

  @IsOptional()
  @IsIn(['verified', 'pending', 'suspended'])
  verificationStatus?: string;

  @IsOptional()
  @IsIn(['name', 'createdAt', 'experience', 'fee', 'rating', 'status', 'lastActive'])
  sort?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';
}

export class AdminUpdateDoctorDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  subSpecialty?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  bioFull?: string;

  @IsOptional()
  @IsString()
  credentials?: string;

  @IsOptional()
  @IsString()
  professionalTitle?: string;

  @IsOptional()
  @Type(() => Number)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  licenseBoard?: string;

  @IsOptional()
  @IsString()
  hospital?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  responseTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  expertise?: string[];

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  educationHistory?: unknown;

  @IsOptional()
  certifications?: unknown;

  @IsOptional()
  awards?: unknown;

  @IsOptional()
  speakingEngagements?: unknown;

  @IsOptional()
  @IsString()
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  twitterUrl?: string;

  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  licenseCertificateUrl?: string;

  @IsOptional()
  @IsString()
  platformRole?: string;

  @IsOptional()
  @IsBoolean()
  editorialBoard?: boolean;

  @IsOptional()
  @IsString()
  medicalReviewerFor?: string;

  @IsOptional()
  @IsString()
  authorSince?: string;

  @IsOptional()
  @IsString()
  conflictOfInterest?: string;

  @IsOptional()
  @IsString()
  coiUpdatedAt?: string;

  @IsOptional()
  @IsString()
  profileSlug?: string;

  @IsOptional()
  @IsString()
  seoFocusKeyword?: string;

  @IsOptional()
  @IsString()
  seoSecondaryKeywords?: string;

  @IsOptional()
  @IsString()
  @MaxLength(70)
  seoMetaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(170)
  seoMetaDescription?: string;

  @IsOptional()
  seoSchemaJson?: unknown;

  @IsOptional()
  @IsBoolean()
  bookingEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  contactEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  onlineAvailEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  physicalAvailEnabled?: boolean;
}
