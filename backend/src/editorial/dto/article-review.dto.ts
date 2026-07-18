import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import {
  ArticleReviewAction,
  BlogStatus,
  ReviewPriority,
} from '@prisma/client';

export class ArticleReviewQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @IsOptional()
  @IsEnum(ReviewPriority)
  priority?: ReviewPriority;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  sort?: 'newest' | 'oldest' | 'priority' | 'title' | 'updated';
}

export class ArticleReviewActionDto {
  @IsEnum(ArticleReviewAction)
  action: ArticleReviewAction;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsEnum(ReviewPriority)
  priority?: ReviewPriority;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;
}

export class BulkArticleReviewDto {
  @IsArray()
  @IsString({ each: true })
  postIds: string[];

  @IsEnum(ArticleReviewAction)
  action: ArticleReviewAction;

  @IsOptional()
  @IsString()
  reviewerId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
