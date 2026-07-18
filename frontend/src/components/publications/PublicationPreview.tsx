"use client";

export {
  ResearchArticlePreview,
} from "@/components/publications/ResearchArticlePreview";
export type {
  ResearchArticlePreviewData,
  ResearchArticleAuthor,
  ResearchArticleReference,
  ResearchArticleEditorial,
} from "@/components/publications/publication-preview-utils";
export { publicationToPreviewData } from "@/components/publications/publication-preview-utils";

/** @deprecated Use ResearchArticlePreviewData */
export type PublicationPreviewData = import("@/components/publications/publication-preview-utils").ResearchArticlePreviewData;

/** @deprecated Use ResearchArticlePreview */
export { ResearchArticlePreview as PublicationPreview } from "@/components/publications/ResearchArticlePreview";
