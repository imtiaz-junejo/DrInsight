"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ArticleReviewStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_MEDICAL_REVIEW"
  | "NEEDS_REVISION"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "ARCHIVED";

export type ReviewPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type EditorialReviewStage =
  | "SUBMITTED"
  | "EDITORIAL_SCREENING"
  | "MEDICAL_REVIEW"
  | "REVISION_REQUESTED"
  | "FINAL_EDITORIAL_REVIEW"
  | "APPROVED"
  | "PUBLISHED";

export type EditorialDocumentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type EditorialPolicyCategory =
  | "EDITORIAL_POLICY"
  | "PUBLICATION_STANDARDS"
  | "ETHICS_POLICY"
  | "CONFLICT_OF_INTEREST"
  | "CORRECTIONS_POLICY"
  | "RETRACTION_POLICY"
  | "PRIVACY_POLICY"
  | "AI_CONTENT_POLICY"
  | "ADVERTISEMENT_POLICY";

export type AuthorGuidelineCategory =
  | "SUBMISSION_GUIDELINES"
  | "FORMATTING_RULES"
  | "REFERENCE_STYLE"
  | "IMAGE_REQUIREMENTS"
  | "CLINICAL_TRIAL_REQUIREMENTS"
  | "ETHICS_REQUIREMENTS"
  | "COPYRIGHT"
  | "PUBLICATION_FEES"
  | "OPEN_ACCESS_POLICY";

export type ArticleReviewAction =
  | "SUBMIT"
  | "ASSIGN_REVIEWER"
  | "REASSIGN_REVIEWER"
  | "APPROVE"
  | "REJECT"
  | "REQUEST_REVISION"
  | "PUBLISH"
  | "UNPUBLISH"
  | "ARCHIVE"
  | "FEATURE"
  | "UNFEATURE"
  | "PIN"
  | "UNPIN"
  | "DELETE"
  | "MARK_COMPLETE"
  | "REQUEST_CHANGES"
  | "LEAVE_INTERNAL_NOTES"
  | "LEAVE_MEDICAL_NOTES";

export interface ArticleReviewPost {
  id: string;
  title: string;
  slug: string;
  status: ArticleReviewStatus;
  reviewPriority: ReviewPriority;
  specialty?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  revisionNotes?: string | null;
  featured: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { id: string; firstName: string; lastName: string; email?: string };
  category?: { id: string; name: string; slug: string };
  reviewer?: { id: string; firstName: string; lastName: string } | null;
  editorialReview?: MedicalReviewRecord | null;
}

export interface MedicalReviewStage {
  id: string;
  stage: EditorialReviewStage;
  status: string;
  reviewDate?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  medicalNotes?: string | null;
  internalNotes?: string | null;
  completedAt?: string | null;
  reviewer?: { id: string; firstName: string; lastName: string } | null;
}

export interface MedicalReviewRecord {
  id: string;
  currentStage: EditorialReviewStage;
  stages: MedicalReviewStage[];
  post?: { id: string; title: string; slug: string; status: string };
  publication?: { id: string; title: string; slug: string; status: string };
}

export interface MedicalReviewer {
  id: string;
  userId?: string;
  tier: number;
  specialty?: string | null;
  isActive: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    doctorProfile?: { specialty?: string; experienceYears?: number; editorialBoard?: boolean };
  };
}

export interface EditorialPolicy {
  id: string;
  title: string;
  slug: string;
  category: EditorialPolicyCategory;
  version: string;
  effectiveDate?: string | null;
  status: EditorialDocumentStatus;
  contentHtml?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords: string[];
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  versions?: EditorialPolicyVersion[];
}

export interface EditorialPolicyVersion {
  id: string;
  versionNumber: string;
  title: string;
  contentHtml?: string | null;
  changeLog?: string | null;
  isCurrent: boolean;
  createdAt: string;
  createdBy?: { id: string; firstName: string; lastName: string };
}

export interface AuthorGuideline {
  id: string;
  title: string;
  slug: string;
  category: AuthorGuidelineCategory;
  version: string;
  status: EditorialDocumentStatus;
  contentHtml?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaKeywords: string[];
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
  versions?: AuthorGuidelineVersion[];
  attachments?: Array<{ id: string; fileName: string; fileUrl: string; fileSize?: number | null }>;
  _count?: { attachments: number; versions: number };
}

export interface AuthorGuidelineVersion {
  id: string;
  versionNumber: string;
  title: string;
  contentHtml?: string | null;
  changeLog?: string | null;
  isCurrent: boolean;
  createdAt: string;
  createdBy?: { id: string; firstName: string; lastName: string };
}

export const ARTICLE_STATUS_LABELS: Record<ArticleReviewStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Awaiting Assignment",
  UNDER_MEDICAL_REVIEW: "In Review",
  NEEDS_REVISION: "Revisions Submitted",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const ARTICLE_STATUS_CHIP: Record<ArticleReviewStatus, string> = {
  DRAFT: "ch-gray",
  SUBMITTED: "ch-gray",
  UNDER_MEDICAL_REVIEW: "ch-a",
  NEEDS_REVISION: "ch-r",
  APPROVED: "ch-g",
  REJECTED: "ch-r",
  PUBLISHED: "ch-g",
  ARCHIVED: "ch-gray",
};

export const PRIORITY_LABELS: Record<ReviewPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

export const POLICY_CATEGORY_LABELS: Record<EditorialPolicyCategory, string> = {
  EDITORIAL_POLICY: "Editorial Policy",
  PUBLICATION_STANDARDS: "Publication Standards",
  ETHICS_POLICY: "Ethics Policy",
  CONFLICT_OF_INTEREST: "Conflict of Interest",
  CORRECTIONS_POLICY: "Corrections Policy",
  RETRACTION_POLICY: "Retraction Policy",
  PRIVACY_POLICY: "Privacy Policy",
  AI_CONTENT_POLICY: "AI Content Policy",
  ADVERTISEMENT_POLICY: "Advertisement Policy",
};

export const GUIDELINE_CATEGORY_LABELS: Record<AuthorGuidelineCategory, string> = {
  SUBMISSION_GUIDELINES: "Submission Guidelines",
  FORMATTING_RULES: "Formatting Rules",
  REFERENCE_STYLE: "Reference Style",
  IMAGE_REQUIREMENTS: "Image Requirements",
  CLINICAL_TRIAL_REQUIREMENTS: "Clinical Trial Requirements",
  ETHICS_REQUIREMENTS: "Ethics Requirements",
  COPYRIGHT: "Copyright",
  PUBLICATION_FEES: "Publication Fees",
  OPEN_ACCESS_POLICY: "Open Access Policy",
};

export const STAGE_LABELS: Record<EditorialReviewStage, string> = {
  SUBMITTED: "Submitted",
  EDITORIAL_SCREENING: "Editorial Screening",
  MEDICAL_REVIEW: "Medical Review",
  REVISION_REQUESTED: "Revision Requested",
  FINAL_EDITORIAL_REVIEW: "Final Editorial Review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
};

export function useArticleReviewStats() {
  return useQuery({
    queryKey: ["article-review-stats"],
    queryFn: async () => {
      const { data } = await api.get<{
        pending: number;
        underMedicalReview: number;
        approved: number;
        rejected: number;
        needsRevision: number;
        published: number;
      }>("/editorial/articles/stats");
      return data;
    },
  });
}

export function useArticleReviewQueue(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: ArticleReviewStatus;
  priority?: ReviewPriority;
  reviewerId?: string;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["article-review-queue", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: ArticleReviewPost[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>("/editorial/articles/queue", { params });
      return data;
    },
  });
}

export function useArticleReviewAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      ...body
    }: {
      postId: string;
      action: ArticleReviewAction;
      reviewerId?: string;
      notes?: string;
      internalNotes?: string;
      priority?: ReviewPriority;
      featured?: boolean;
      pinned?: boolean;
    }) => {
      const { data } = await api.post(`/editorial/articles/${postId}/action`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["article-review-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
    },
  });
}

export function useBulkArticleReviewAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { postIds: string[]; action: ArticleReviewAction; reviewerId?: string; notes?: string }) => {
      const { data } = await api.post("/editorial/articles/bulk-action", body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-review-queue"] });
      queryClient.invalidateQueries({ queryKey: ["article-review-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-nav-badges"] });
    },
  });
}

export function useMedicalReviewers() {
  return useQuery({
    queryKey: ["medical-reviewers"],
    queryFn: async () => {
      const { data } = await api.get<MedicalReviewer[]>("/editorial/reviewers");
      return data;
    },
  });
}

export function useMedicalReview(postId?: string, publicationId?: string) {
  return useQuery({
    queryKey: ["medical-review", postId, publicationId],
    queryFn: async () => {
      const { data } = await api.get<MedicalReviewRecord>("/editorial/medical-review", {
        params: { postId, publicationId },
      });
      return data;
    },
    enabled: Boolean(postId || publicationId),
  });
}

export function useUpdateMedicalReviewStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewId,
      stage,
      action,
      ...body
    }: {
      reviewId: string;
      stage: EditorialReviewStage;
      action: "assign" | "complete" | "request_changes" | "approve" | "reject" | "notes";
      reviewerId?: string;
      notes?: string;
      medicalNotes?: string;
      internalNotes?: string;
      dueDate?: string;
    }) => {
      const { data } = await api.patch(`/editorial/medical-review/${reviewId}/stages/${stage}`, {
        action,
        ...body,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medical-review"] });
      queryClient.invalidateQueries({ queryKey: ["article-review-queue"] });
    },
  });
}

export function useEditorialPolicies(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: EditorialPolicyCategory;
  status?: EditorialDocumentStatus;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["editorial-policies", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: EditorialPolicy[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>("/editorial/policies", { params });
      return data;
    },
  });
}

export function useEditorialPolicy(id?: string) {
  return useQuery({
    queryKey: ["editorial-policy", id],
    queryFn: async () => {
      const { data } = await api.get<EditorialPolicy>(`/editorial/policies/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateEditorialPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await api.post("/editorial/policies", body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["editorial-policies"] }),
  });
}

export function useUpdateEditorialPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.put(`/editorial/policies/${id}`, body);
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["editorial-policies"] });
      qc.invalidateQueries({ queryKey: ["editorial-policy", v.id] });
    },
  });
}

export function usePublishEditorialPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/editorial/policies/${id}/publish`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["editorial-policies"] }),
  });
}

export function useArchiveEditorialPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/editorial/policies/${id}/archive`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["editorial-policies"] }),
  });
}

export function useDuplicateEditorialPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/editorial/policies/${id}/duplicate`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["editorial-policies"] }),
  });
}

export function useDeleteEditorialPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/editorial/policies/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["editorial-policies"] }),
  });
}

export function useRollbackEditorialPolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, versionId }: { id: string; versionId: string }) => {
      const { data } = await api.post(`/editorial/policies/${id}/rollback`, { versionId });
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["editorial-policies"] });
      qc.invalidateQueries({ queryKey: ["editorial-policy", v.id] });
    },
  });
}

export function useAuthorGuidelines(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: AuthorGuidelineCategory;
  status?: EditorialDocumentStatus;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["author-guidelines-admin", params],
    queryFn: async () => {
      const { data } = await api.get<{
        data: AuthorGuideline[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>("/editorial/guidelines", { params });
      return data;
    },
  });
}

export function useAuthorGuideline(id?: string) {
  return useQuery({
    queryKey: ["author-guideline", id],
    queryFn: async () => {
      const { data } = await api.get<AuthorGuideline>(`/editorial/guidelines/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateAuthorGuideline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await api.post("/editorial/guidelines", body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["author-guidelines-admin"] }),
  });
}

export function useUpdateAuthorGuideline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string } & Record<string, unknown>) => {
      const { data } = await api.put(`/editorial/guidelines/${id}`, body);
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["author-guidelines-admin"] });
      qc.invalidateQueries({ queryKey: ["author-guideline", v.id] });
    },
  });
}

export function usePublishAuthorGuideline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/editorial/guidelines/${id}/publish`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["author-guidelines-admin"] }),
  });
}

export function useArchiveAuthorGuideline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/editorial/guidelines/${id}/archive`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["author-guidelines-admin"] }),
  });
}

export function useDuplicateAuthorGuideline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/editorial/guidelines/${id}/duplicate`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["author-guidelines-admin"] }),
  });
}

export function useDeleteAuthorGuideline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/editorial/guidelines/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["author-guidelines-admin"] }),
  });
}

export function useRollbackAuthorGuideline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, versionId }: { id: string; versionId: string }) => {
      const { data } = await api.post(`/editorial/guidelines/${id}/rollback`, { versionId });
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["author-guidelines-admin"] });
      qc.invalidateQueries({ queryKey: ["author-guideline", v.id] });
    },
  });
}

export function useAddGuidelineAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      fileName: string;
      fileUrl: string;
      fileSize?: number;
      mimeType?: string;
    }) => {
      const { data } = await api.post(`/editorial/guidelines/${id}/attachments`, body);
      return data;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ["author-guideline", v.id] }),
  });
}
