"use client";

import dynamic from "next/dynamic";
import type { ArticleRichTextEditorHandle } from "@/components/blog/ArticleRichTextEditor";

const ArticleRichTextEditor = dynamic(
  () => import("@/components/blog/ArticleRichTextEditor").then((m) => m.ArticleRichTextEditor),
  { ssr: false },
);

export type { ArticleRichTextEditorHandle };

export type ArticleRichTextFieldProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function ArticleRichTextField({ value, onChange, placeholder }: ArticleRichTextFieldProps) {
  return <ArticleRichTextEditor value={value} onChange={onChange} placeholder={placeholder} />;
}
