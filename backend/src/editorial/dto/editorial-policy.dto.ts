import { IsEnum, IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';
import { AuthorGuidelineCategory, EditorialDocumentStatus, EditorialPolicyCategory } from '@prisma/client';

export class EditorialPolicyQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(EditorialPolicyCategory)
  category?: EditorialPolicyCategory;

  @IsOptional()
  @IsEnum(EditorialDocumentStatus)
  status?: EditorialDocumentStatus;

  @IsOptional()
  @IsString()
  sort?: 'newest' | 'oldest' | 'title' | 'version';
}

export class UpsertEditorialPolicyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsEnum(EditorialPolicyCategory)
  category: EditorialPolicyCategory;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  effectiveDate?: string;

  @IsOptional()
  @IsEnum(EditorialDocumentStatus)
  status?: EditorialDocumentStatus;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @IsOptional()
  @IsString()
  changeLog?: string;
}

export class AuthorGuidelineQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AuthorGuidelineCategory)
  category?: AuthorGuidelineCategory;

  @IsOptional()
  @IsEnum(EditorialDocumentStatus)
  status?: EditorialDocumentStatus;

  @IsOptional()
  @IsString()
  sort?: 'newest' | 'oldest' | 'title' | 'version';
}

export class UpsertAuthorGuidelineDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsEnum(AuthorGuidelineCategory)
  category: AuthorGuidelineCategory;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsEnum(EditorialDocumentStatus)
  status?: EditorialDocumentStatus;

  @IsOptional()
  @IsString()
  contentHtml?: string;

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  seoDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @IsOptional()
  @IsString()
  changeLog?: string;
}

export class RollbackVersionDto {
  @IsString()
  versionId: string;
}

export class MedicalReviewStageActionDto {
  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  medicalNotes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}
