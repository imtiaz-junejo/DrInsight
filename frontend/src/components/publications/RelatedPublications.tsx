"use client";

import Link from "next/link";
import { PUBLICATION_TYPE_LABELS } from "@/services/publications-api-hooks";
import type { Publication } from "@/services/publications-api-hooks";

function pubYear(pub: Publication): string {
  const d = pub.publicationDate ?? pub.publishedAt;
  if (!d) return "—";
  return String(new Date(d).getFullYear());
}

export function RelatedPublications({
  items,
  doctorName,
}: {
  items: Publication[];
  doctorName: string;
}) {
  if (!items.length) return null;
  return (
    <div className="related-card">
      <div className="related-hd">More Research by {doctorName}</div>
      {items.map((item) => (
        <Link key={item.id} href={`/research-publications/${item.slug}`} className="related-item">
          <h4>{item.title}</h4>
          <span>
            {item.journalName ?? PUBLICATION_TYPE_LABELS[item.publicationType]} · {pubYear(item)}
          </span>
        </Link>
      ))}
    </div>
  );
}
