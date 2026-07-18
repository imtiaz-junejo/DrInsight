"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Paginated } from "@/services/api-hooks";

export type PublicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_REVISION";

export type PublicationType =
  | "JOURNAL_ARTICLE"
  | "RESEARCH_PAPER"
  | "CASE_STUDY"
  | "CLINICAL_TRIAL"
  | "REVIEW_ARTICLE"
  | "CONFERENCE_PAPER"
  | "BOOK_CHAPTER"
  | "THESIS"
  | "EVIDENCE_REVIEW"
  | "CLINICAL_EXPLAINER"
  | "META_SUMMARY"
  | "PRACTICE_GUIDE";

export type PublicationVisibility = "PUBLIC" | "PRIVATE" | "AFTER_APPROVAL";

export type PublicationAttachmentType =
  | "PDF"
  | "COVER_IMAGE"
  | "SUPPLEMENTARY"
  | "DATASET"
  | "FIGURE"
  | "TABLE";

export interface PublicationAuthor {
  id?: string;
  name: string;
  role?: string | null;
  orcid?: string | null;
  affiliation?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface PublicationAttachment {
  id?: string;
  type: PublicationAttachmentType;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  mimeType?: string | null;
}

export interface PublicationKeyword {
  id?: string;
  keyword: string;
}

export interface PublicationReference {
  id?: string;
  citation: string;
  doi?: string | null;
  sortOrder?: number;
}

export interface PublicationReview {
  id: string;
  action: string;
  internalNotes?: string | null;
  feedback?: string | null;
  createdAt: string;
  reviewer?: { id: string; firstName: string; lastName: string };
}

export interface Publication {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  abstract: string;
  introduction?: string | null;
  results?: string | null;
  discussion?: string | null;
  conclusion?: string | null;
  articleId?: string | null;
  license?: string | null;
  abstractBackground?: string | null;
  abstractMethods?: string | null;
  abstractResults?: string | null;
  abstractConclusions?: string | null;
  objectives?: string | null;
  methodsContent?: string | null;
  methodsTable?: string | null;
  figureData?: string | null;
  figureCaption?: string | null;
  resultSummary?: string | null;
  practiceImplications?: string | null;
  limitations?: string | null;
  keyFindings?: string | null;
  authorContributions?: string | null;
  ethicsStatement?: string | null;
  dataAvailabilityStatement?: string | null;
  conflictsOfInterest?: string | null;
  acknowledgments?: string | null;
  abbreviations?: string | null;
  lastReviewedDate?: string | null;
  peerReviewOutcome?: string | null;
  nextScheduledReview?: string | null;
  evidenceGrade?: string | null;
  researchCategory?: string | null;
  medicalSpecialty?: string | null;
  publicationType: PublicationType;
  language: string;
  institution?: string | null;
  department?: string | null;
  orcid?: string | null;
  correspondingAuthor?: string | null;
  journalName?: string | null;
  publisher?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  doi?: string | null;
  issn?: string | null;
  publicationDate?: string | null;
  acceptanceDate?: string | null;
  submissionDate?: string | null;
  researchMethodology?: string | null;
  studyDesign?: string | null;
  sampleSize?: string | null;
  fundingSource?: string | null;
  ethicalApprovalNumber?: string | null;
  clinicalTrialRegistration?: string | null;
  researchOverview?: string | null;
  methodologySteps?: string | null;
  partners?: string | null;
  referenceCount?: number | null;
  reviewingPhysician?: string | null;
  physicianReviewed: boolean;
  evidenceBased: boolean;
  openAccess: boolean;
  fullyReferenced: boolean;
  coiDisclosed: boolean;
  doiUrl?: string | null;
  journalUrl?: string | null;
  pubmedUrl?: string | null;
  googleScholarUrl?: string | null;
  visibility: PublicationVisibility;
  seoTitle?: string | null;
  metaDescription?: string | null;
  status: PublicationStatus;
  featured: boolean;
  pinned: boolean;
  viewCount: number;
  downloadCount: number;
  shareCount: number;
  citationCount: number;
  readTimeMinutes: number;
  submittedAt?: string | null;
  approvedAt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  authors?: PublicationAuthor[];
  keywords?: PublicationKeyword[];
  references?: PublicationReference[];
  attachments?: PublicationAttachment[];
  reviews?: PublicationReview[];
  doctor?: {
    id: string;
    specialty: string;
    hospital?: string | null;
    city?: string | null;
    experienceYears?: number;
    consultationFee?: number | string;
    user?: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
  };
  assignedReviewer?: { id: string; firstName: string; lastName: string } | null;
  bookmarked?: boolean;
  bookmarkCount?: number;
}

export interface PublicationStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  drafts: number;
}

export interface PublicPublicationStats {
  publicationCount: number;
  doctorCount: number;
  specialtyCount: number;
  sourcesCitedPercent: number;
}

export interface PublicationPayload {
  title: string;
  slug?: string;
  subtitle?: string;
  abstract?: string;
  introduction?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  articleId?: string;
  license?: string;
  abstractBackground?: string;
  abstractMethods?: string;
  abstractResults?: string;
  abstractConclusions?: string;
  objectives?: string;
  methodsContent?: string;
  methodsTable?: string;
  figureData?: string;
  figureCaption?: string;
  resultSummary?: string;
  practiceImplications?: string;
  limitations?: string;
  keyFindings?: string;
  authorContributions?: string;
  ethicsStatement?: string;
  dataAvailabilityStatement?: string;
  conflictsOfInterest?: string;
  acknowledgments?: string;
  abbreviations?: string;
  researchCategory?: string;
  medicalSpecialty?: string;
  publicationType: PublicationType;
  language?: string;
  authors?: PublicationAuthor[];
  institution?: string;
  department?: string;
  orcid?: string;
  correspondingAuthor?: string;
  journalName?: string;
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  issn?: string;
  publicationDate?: string;
  acceptanceDate?: string;
  submissionDate?: string;
  researchMethodology?: string;
  studyDesign?: string;
  sampleSize?: string;
  fundingSource?: string;
  ethicalApprovalNumber?: string;
  clinicalTrialRegistration?: string;
  researchOverview?: string;
  methodologySteps?: string;
  partners?: string;
  referenceCount?: number;
  reviewingPhysician?: string;
  physicianReviewed?: boolean;
  evidenceBased?: boolean;
  openAccess?: boolean;
  fullyReferenced?: boolean;
  coiDisclosed?: boolean;
  doiUrl?: string;
  journalUrl?: string;
  pubmedUrl?: string;
  googleScholarUrl?: string;
  visibility?: PublicationVisibility;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  references?: PublicationReference[];
  attachments?: PublicationAttachment[];
  readTimeMinutes?: number;
  submitForReview?: boolean;
}

export interface PublicationQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PublicationStatus;
  specialty?: string;
  publicationType?: PublicationType;
  journal?: string;
  doctorId?: string;
  year?: number;
  sort?: "newest" | "oldest" | "views" | "downloads" | "citations";
}

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  JOURNAL_ARTICLE: "Journal Article",
  RESEARCH_PAPER: "Research Paper",
  CASE_STUDY: "Case Study",
  CLINICAL_TRIAL: "Clinical Trial",
  REVIEW_ARTICLE: "Review Article",
  CONFERENCE_PAPER: "Conference Paper",
  BOOK_CHAPTER: "Book Chapter",
  THESIS: "Thesis",
  EVIDENCE_REVIEW: "Evidence Review",
  CLINICAL_EXPLAINER: "Clinical Explainer",
  META_SUMMARY: "Meta-Summary",
  PRACTICE_GUIDE: "Practice Guide",
};

export const RESEARCH_PUBLICATION_TYPES: PublicationType[] = [
  "EVIDENCE_REVIEW",
  "CLINICAL_EXPLAINER",
  "META_SUMMARY",
  "PRACTICE_GUIDE",
];

export const PUBLICATION_STATUS_LABELS: Record<PublicationStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  NEEDS_REVISION: "Needs Revision",
};

export function publicationCoverUrl(pub: Publication): string | null {
  return pub.attachments?.find((a) => a.type === "COVER_IMAGE")?.fileUrl ?? null;
}

export function publicationPdfUrl(pub: Publication): string | null {
  return pub.attachments?.find((a) => a.type === "PDF")?.fileUrl ?? null;
}

export function publicationAuthorsLine(pub: Publication): string {
  const names = pub.authors?.map((a) => a.name).filter(Boolean) ?? [];
  if (names.length) return names.join(", ");
  const doc = pub.doctor?.user;
  if (doc) return `Dr. ${doc.firstName} ${doc.lastName}`;
  return pub.correspondingAuthor ?? "—";
}

export function usePublicPublications(params?: PublicationQuery) {
  return useQuery({
    queryKey: ["publications", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Publication>>("/publications", { params });
      return data;
    },
  });
}

export function useFeaturedPublications(limit = 5) {
  return useQuery({
    queryKey: ["publications-featured", limit],
    queryFn: async () => {
      const { data } = await api.get<Publication[]>("/publications/featured", { params: { limit } });
      return data;
    },
  });
}

export function usePopularPublications(limit = 5) {
  return useQuery({
    queryKey: ["publications-popular", limit],
    queryFn: async () => {
      const { data } = await api.get<Publication[]>("/publications/popular", { params: { limit } });
      return data;
    },
  });
}

export function useLatestPublications(limit = 10) {
  return useQuery({
    queryKey: ["publications-latest", limit],
    queryFn: async () => {
      const { data } = await api.get<Publication[]>("/publications/latest", { params: { limit } });
      return data;
    },
  });
}

export function usePublicPublicationStats() {
  return useQuery({
    queryKey: ["publications-stats"],
    queryFn: async () => {
      const { data } = await api.get<PublicPublicationStats>("/publications/stats");
      return data;
    },
  });
}

export function usePublicationBySlug(slug: string) {
  return useQuery({
    queryKey: ["publication", slug],
    queryFn: async () => {
      const { data } = await api.get<Publication>(`/publications/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}

export function useRelatedPublications(slug: string, limit = 6) {
  return useQuery({
    queryKey: ["publication-related", slug, limit],
    queryFn: async () => {
      const { data } = await api.get<Publication[]>(`/publications/${slug}/related`, { params: { limit } });
      return data;
    },
    enabled: !!slug,
  });
}

export function useDoctorPublications(params?: PublicationQuery) {
  return useQuery({
    queryKey: ["doctor-publications", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Publication>>("/publications/me", { params });
      return data;
    },
  });
}

export function useDoctorPublicationStats() {
  return useQuery({
    queryKey: ["doctor-publication-stats"],
    queryFn: async () => {
      const { data } = await api.get<PublicationStats>("/publications/me/stats");
      return data;
    },
  });
}

export function useDoctorPublication(id?: string) {
  return useQuery({
    queryKey: ["doctor-publication", id],
    queryFn: async () => {
      const { data } = await api.get<Publication>(`/publications/detail/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useDoctorPublicationsByDoctor(doctorId?: string, limit = 10) {
  return useQuery({
    queryKey: ["doctor-public-publications", doctorId, limit],
    queryFn: async () => {
      const { data } = await api.get<Publication[]>(`/publications/doctor/${doctorId}`, { params: { limit } });
      return data;
    },
    enabled: !!doctorId,
  });
}

export function useAdminPublications(params?: PublicationQuery) {
  return useQuery({
    queryKey: ["admin-publications", params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Publication>>("/publications/admin", { params });
      return data;
    },
  });
}

export function useAdminPublicationStats() {
  return useQuery({
    queryKey: ["admin-publication-stats"],
    queryFn: async () => {
      const { data } = await api.get<{ pending: number; approved: number; rejected: number; total: number }>(
        "/publications/admin/stats",
      );
      return data;
    },
  });
}

export function useCreatePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: PublicationPayload) => {
      const { data } = await api.post<Publication>("/publications", payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-publications"] });
      qc.invalidateQueries({ queryKey: ["doctor-publication-stats"] });
    },
  });
}

export function useUpdatePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PublicationPayload }) => {
      const { data } = await api.patch<Publication>(`/publications/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-publications"] });
      qc.invalidateQueries({ queryKey: ["doctor-publication"] });
      qc.invalidateQueries({ queryKey: ["doctor-publication-stats"] });
    },
  });
}

export function useSubmitPublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<Publication>(`/publications/${id}/submit`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-publications"] });
      qc.invalidateQueries({ queryKey: ["doctor-publication-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-publications"] });
    },
  });
}

export function useDuplicatePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<Publication>(`/publications/${id}/duplicate`);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-publications"] });
      qc.invalidateQueries({ queryKey: ["doctor-publication-stats"] });
    },
  });
}

export function useDeletePublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/publications/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["doctor-publications"] });
      qc.invalidateQueries({ queryKey: ["doctor-publication-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-publications"] });
    },
  });
}

export function useReviewPublication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      action,
      internalNotes,
      feedback,
      visibility,
      featured,
      pinned,
      reviewingPhysician,
      lastReviewedDate,
      peerReviewOutcome,
      nextScheduledReview,
      evidenceGrade,
      openAccess,
      physicianReviewed,
      assignedReviewerId,
    }: {
      id: string;
      action: "APPROVE" | "REJECT" | "REQUEST_REVISION" | "ASSIGN_REVIEWER";
      internalNotes?: string;
      feedback?: string;
      visibility?: PublicationVisibility;
      featured?: boolean;
      pinned?: boolean;
      assignedReviewerId?: string;
      reviewingPhysician?: string;
      lastReviewedDate?: string;
      peerReviewOutcome?: string;
      nextScheduledReview?: string;
      evidenceGrade?: string;
      openAccess?: boolean;
      physicianReviewed?: boolean;
    }) => {
      const { data } = await api.post<Publication>(`/publications/admin/${id}/review`, {
        action,
        internalNotes,
        feedback,
        visibility,
        featured,
        pinned,
        assignedReviewerId,
        reviewingPhysician,
        lastReviewedDate,
        peerReviewOutcome,
        nextScheduledReview,
        evidenceGrade,
        openAccess,
        physicianReviewed,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-publications"] });
      qc.invalidateQueries({ queryKey: ["admin-publication-stats"] });
      qc.invalidateQueries({ queryKey: ["publications"] });
    },
  });
}

export function useUpdatePublicationFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; featured?: boolean; pinned?: boolean }) => {
      const { data } = await api.patch<Publication>(`/publications/admin/${id}/flags`, body);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-publications"] });
      qc.invalidateQueries({ queryKey: ["admin-publication-stats"] });
    },
  });
}

export function useTrackPublicationDownload() {
  return useMutation({
    mutationFn: async (slug: string) => {
      await api.post(`/publications/${slug}/download`);
    },
  });
}

export function useTrackPublicationShare() {
  return useMutation({
    mutationFn: async (slug: string) => {
      await api.post(`/publications/${slug}/share`);
    },
  });
}

export function useTogglePublicationBookmark() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (slug: string) => {
      const { data } = await api.post<{ bookmarked: boolean }>(`/publications/${slug}/bookmark`);
      return data;
    },
    onSuccess: (_data, slug) => {
      qc.invalidateQueries({ queryKey: ["publication", slug] });
    },
  });
}
