"use client";

import { useSearchParams } from "next/navigation";
import { SubmitArticleForm } from "@/components/blog/SubmitArticleForm";

export function AdminSubmitArticlePageContent() {
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug") ?? undefined;

  return (
    <div className="doctor-dash-embed">
      <SubmitArticleForm mode="admin" editSlug={editSlug} />
    </div>
  );
}
