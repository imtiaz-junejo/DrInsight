"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/data-mappers";
import { cn } from "@/lib/utils";
import {
  PUBLICATION_TYPE_LABELS,
  publicationAuthorsLine,
  publicationCoverFallbackUrl,
  publicationCoverUrl,
  useFeaturedPublications,
  type Publication,
} from "@/services/publications-api-hooks";

function publicationDate(pub: Publication): string | null {
  const raw = pub.publicationDate ?? pub.publishedAt ?? pub.createdAt;
  return raw ? formatDate(raw) : null;
}

function PublicationTypeBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 rounded-md bg-blue px-2.5 py-0.5 text-[.68rem] font-bold uppercase tracking-wide text-white">
      {label}
    </span>
  );
}

function PublicationMetaBadges({ pub }: { pub: Publication }) {
  const items = [
    pub.physicianReviewed && { key: "reviewed", label: "✔ Physician reviewed", className: "bg-emerald-50 text-emerald-700" },
    pub.openAccess && { key: "open", label: "🔓 Open access", className: "bg-sky-50 text-sky-700" },
    pub.evidenceBased && { key: "evidence", label: "📊 Evidence-based", className: "bg-violet-50 text-violet-700" },
  ].filter(Boolean) as Array<{ key: string; label: string; className: string }>;

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-[.68rem] font-semibold">
      {items.map((item) => (
        <span key={item.key} className={cn("rounded-full px-2 py-0.5", item.className)}>
          {item.label}
        </span>
      ))}
    </div>
  );
}

function PublicationCover({ pub }: { pub: Publication }) {
  const primaryCover = publicationCoverUrl(pub);
  const fallbackCover = publicationCoverFallbackUrl(pub);
  const [coverSrc, setCoverSrc] = useState(primaryCover ?? fallbackCover);
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  useEffect(() => {
    setCoverSrc(primaryCover ?? fallbackCover);
    setShowPlaceholder(false);
  }, [primaryCover, fallbackCover]);

  const handleImageError = () => {
    if (coverSrc !== fallbackCover) {
      setCoverSrc(fallbackCover);
      return;
    }
    setShowPlaceholder(true);
  };

  return (
    <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gradient-to-br from-blue-dark/10 via-blue/5 to-teal/10">
      {!showPlaceholder ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverSrc}
          alt=""
          onError={handleImageError}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-80">🔬</div>
      )}
    </div>
  );
}

function HomePublicationCard({ pub }: { pub: Publication }) {
  const date = publicationDate(pub);
  const typeLabel = PUBLICATION_TYPE_LABELS[pub.publicationType] ?? "Publication";

  return (
    <Link
      href={`/research-publications/${pub.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
    >
      <PublicationCover pub={pub} />

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <PublicationTypeBadge label={typeLabel} />
          <PublicationMetaBadges pub={pub} />
        </div>

        <h3 className="font-display text-[1rem] font-semibold leading-snug text-gray-900 group-hover:text-blue">
          {pub.title}
        </h3>

        <p className="text-[.78rem] italic leading-snug text-gray-500">{publicationAuthorsLine(pub)}</p>

        {pub.journalName && (
          <p className="text-[.76rem] font-medium leading-snug text-gray-600">📰 {pub.journalName}</p>
        )}

        <p className="line-clamp-3 text-[.82rem] leading-relaxed text-gray-600">{pub.abstract}</p>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-[.74rem] text-gray-400">
          {date && <span>{date}</span>}
          {pub.readTimeMinutes > 0 && (
            <>
              <span aria-hidden>·</span>
              <span>{pub.readTimeMinutes} min read</span>
            </>
          )}
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-blue opacity-0 transition group-hover:opacity-100">
            Read paper →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function HomeResearchPublicationsSection() {
  const { data: publications = [], isLoading } = useFeaturedPublications(4);

  return (
    <section className="home-section bg-gradient-to-br from-slate-50 via-[#f0f7ff] to-[#e8f4fd] px-6 py-16 min-[901px]:py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-13 text-center">
          <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">
            Research & Publications
          </div>
          <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-tight text-gray-900">
            Peer-Reviewed Medical Research
          </h2>
          <p className="mx-auto mt-3.5 max-w-[600px] text-[.98rem] text-gray-600">
            Explore journal articles, clinical studies, and evidence reviews authored and reviewed by
            licensed physicians.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading publications...</p>
        ) : publications.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {publications.map((pub) => (
              <HomePublicationCard key={pub.id} pub={pub} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No publications available yet.</p>
        )}

        <div className="mt-8 text-center">
          <Button asChild className="inline-flex w-auto !text-white">
            <Link href="/research-publications" className="!text-white">
              View All Research & Publications →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
