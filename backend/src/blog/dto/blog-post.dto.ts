import { BlogStatus } from '@prisma/client';

export type BlogReference = {
  text: string;
  url?: string;
};

export type BlogGlossaryTerm = {
  term: string;
  definition: string;
};

export type CreateBlogPostDto = {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt: string;
  content: string;
  categoryId: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  coverImageCaption?: string;
  specialty?: string;
  tags?: string[];
  summaryPoints?: string[];
  keyTakeaways?: string[];
  references?: BlogReference[];
  glossary?: BlogGlossaryTerm[];
  medicalDisclaimer?: string;
  reviewerId?: string;
  peerReviewed?: boolean;
  lastReviewedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
  readTimeMinutes?: number;
  status?: BlogStatus;
  featured?: boolean;
  publishedAt?: string;
};

export type UpdateBlogPostDto = Partial<CreateBlogPostDto>;

export type SubmitBlogCommentDto = {
  authorName: string;
  authorEmail?: string;
  content: string;
  parentId?: string;
};

export type SubmitBlogFeedbackDto = {
  helpful?: boolean;
  rating?: number;
  visitorKey?: string;
};
