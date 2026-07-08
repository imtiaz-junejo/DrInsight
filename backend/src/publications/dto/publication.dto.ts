import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PublicationAttachmentType,
  PublicationReviewAction,
  PublicationStatus,
  PublicationType,
  PublicationVisibility,
} from '@prisma/client';

export class PublicationAuthorDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  orcid?: string;

  @IsOptional()
  @IsString()
  affiliation?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class PublicationAttachmentDto {
  @IsEnum(PublicationAttachmentType)
  type!: PublicationAttachmentType;

  @IsString()
  fileName!: string;

  @IsString()
  fileUrl!: string;

  @IsOptional()
  @IsInt()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  storageKey?: string;
}

export class CreatePublicationDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsString()
  @MinLength(10)
  abstract!: string;

  @IsOptional()
  @IsString()
  researchCategory?: string;

  @IsOptional()
  @IsString()
  medicalSpecialty?: string;

  @IsEnum(PublicationType)
  publicationType!: PublicationType;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicationAuthorDto)
  authors?: PublicationAuthorDto[];

  @IsOptional()
  @IsString()
  institution?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  orcid?: string;

  @IsOptional()
  @IsString()
  correspondingAuthor?: string;

  @IsOptional()
  @IsString()
  journalName?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  volume?: string;

  @IsOptional()
  @IsString()
  issue?: string;

  @IsOptional()
  @IsString()
  pages?: string;

  @IsOptional()
  @IsString()
  doi?: string;

  @IsOptional()
  @IsString()
  issn?: string;

  @IsOptional()
  @IsDateString()
  publicationDate?: string;

  @IsOptional()
  @IsDateString()
  acceptanceDate?: string;

  @IsOptional()
  @IsDateString()
  submissionDate?: string;

  @IsOptional()
  @IsString()
  researchMethodology?: string;

  @IsOptional()
  @IsString()
  studyDesign?: string;

  @IsOptional()
  @IsString()
  sampleSize?: string;

  @IsOptional()
  @IsString()
  fundingSource?: string;

  @IsOptional()
  @IsString()
  ethicalApprovalNumber?: string;

  @IsOptional()
  @IsString()
  clinicalTrialRegistration?: string;

  @IsOptional()
  @IsString()
  researchOverview?: string;

  @IsOptional()
  @IsString()
  methodologySteps?: string;

  @IsOptional()
  @IsString()
  partners?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  referenceCount?: number;

  @IsOptional()
  @IsString()
  reviewingPhysician?: string;

  @IsOptional()
  @IsBoolean()
  physicianReviewed?: boolean;

  @IsOptional()
  @IsBoolean()
  evidenceBased?: boolean;

  @IsOptional()
  @IsBoolean()
  openAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  fullyReferenced?: boolean;

  @IsOptional()
  @IsBoolean()
  coiDisclosed?: boolean;

  @IsOptional()
  @IsUrl()
  doiUrl?: string;

  @IsOptional()
  @IsUrl()
  journalUrl?: string;

  @IsOptional()
  @IsUrl()
  pubmedUrl?: string;

  @IsOptional()
  @IsUrl()
  googleScholarUrl?: string;

  @IsOptional()
  @IsEnum(PublicationVisibility)
  visibility?: PublicationVisibility;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicationAttachmentDto)
  attachments?: PublicationAttachmentDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  readTimeMinutes?: number;

  @IsOptional()
  @IsBoolean()
  submitForReview?: boolean;
}

export class UpdatePublicationDto extends CreatePublicationDto {}

export class ReviewPublicationDto {
  @IsEnum(PublicationReviewAction)
  action!: PublicationReviewAction;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsEnum(PublicationVisibility)
  visibility?: PublicationVisibility;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @IsOptional()
  @IsString()
  assignedReviewerId?: string;
}

export class PublicationQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(PublicationStatus)
  status?: PublicationStatus;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsEnum(PublicationType)
  publicationType?: PublicationType;

  @IsOptional()
  @IsString()
  journal?: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  year?: number;

  @IsOptional()
  @IsString()
  sort?: 'newest' | 'oldest' | 'views' | 'downloads' | 'citations';
}
