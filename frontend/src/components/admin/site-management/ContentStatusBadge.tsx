"use client";

import { StatusChip } from "@/components/admin/ui/AdminPrimitives";

export function ContentStatusBadge({ status }: { status?: string }) {
  if (!status || status === "PUBLISHED") return <StatusChip label="Published" className="ch-g" />;
  if (status === "DRAFT") return <StatusChip label="Draft" className="ch-a" />;
  if (status === "ARCHIVED") return <StatusChip label="Archived" className="ch-b" />;
  return <StatusChip label={status} className="ch-b" />;
}
