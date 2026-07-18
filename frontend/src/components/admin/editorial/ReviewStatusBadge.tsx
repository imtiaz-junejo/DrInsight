"use client";

import { StatusChip } from "@/components/admin/ui/AdminPrimitives";
import {
  ARTICLE_STATUS_CHIP,
  ARTICLE_STATUS_LABELS,
  type ArticleReviewStatus,
} from "@/services/editorial-api-hooks";

export function ReviewStatusBadge({ status }: { status: ArticleReviewStatus | string }) {
  const key = status as ArticleReviewStatus;
  return (
    <StatusChip
      label={ARTICLE_STATUS_LABELS[key] ?? status}
      className={ARTICLE_STATUS_CHIP[key] ?? "ch-gray"}
    />
  );
}

export function DocumentStatusBadge({ status }: { status: string }) {
  const chip =
    status === "PUBLISHED" ? "ch-g" : status === "ARCHIVED" ? "ch-gray" : status === "DRAFT" ? "ch-a" : "ch-gray";
  const label = status === "PUBLISHED" ? "Published" : status === "ARCHIVED" ? "Archived" : "Draft";
  return <StatusChip label={label} className={chip} />;
}
