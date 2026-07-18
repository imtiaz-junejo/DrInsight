"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/data-mappers";
import { cn } from "@/lib/utils";
import {
  PUBLICATION_TYPE_LABELS,
  publicationAuthorsLine,
  publicationCoverUrl,
  useFeaturedPublications,
  type Publication,
} from "@/services/publications-api-hooks";

function publicationDate(pub: Publication): string | null {
  const raw = pub.publicationDate ?? pub.publishedAt ?? pub.createdAt;
  return raw ? formatDate(raw) : null;
}

function PublicationTypeBadge({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-md bg-blue font-bold uppercase tracking-wide text-white",
        compact ? "px-2 py-0.5 text-[.62rem]" : "px-2.5 py-0.5 text-[.68rem]",
      )}
    >
      {label}
    </span>
  );
}

function PublicationMetaBadges({ pub, compact }: { pub: Publication; compact?: boolean }) {
  const items = [
    pub.physicianReviewed && { key: "reviewed", label: "✔ Physician reviewed", className: "bg-emerald-50 text-emerald-700" },
    pub.openAccess && { key: "open", label: "🔓 Open access", className: "bg-sky-50 text-sky-700" },
    pub.evidenceBased && { key: "evidence", label: "📊 Evidence-based", className: "bg-violet-50 text-violet-700" },
  ].filter(Boolean) as Array<{ key: string; label: string; className: string }>;

  if (!items.length) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 font-semibold", compact ? "text-[.68rem]" : "text-[.72rem]")}>
      {items.map((item) => (
        <span key={item.key} className={cn("rounded-full px-2 py-0.5", item.className)}>
          {item.label}
        </span>
      ))}
    </div>
  );
}

function PublicationCover({
  cover,
  featured,
}: {
  cover: string | null;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-gradient-to-br from-blue-dark/10 via-blue/5 to-teal/10",
        featured ? "w-[44%] max-w-[300px] min-w-[160px]" : "w-[132px] min-[901px]:w-[140px]",
      )}
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-80">🔬</div>
      )}
    </div>
  );
}

function HomePublicationCard({
  pub,
  featured = false,
  className,
}: {
  pub: Publication;
  featured?: boolean;
  className?: string;
}) {
  const cover = publicationCoverUrl(pub);
  const date = publicationDate(pub);
  const typeLabel = PUBLICATION_TYPE_LABELS[pub.publicationType] ?? "Publication";

  return (
    <Link
      href={`/research-publications/${pub.slug}`}
      className={cn(
        "group flex flex-row items-stretch overflow-hidden rounded-[18px] border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]",
        className,
      )}
    >
      <PublicationCover cover={cover} featured={featured} />

      <div className={cn("flex min-w-0 flex-1 flex-col", featured ? "gap-2.5 p-5" : "gap-2 p-4")}>
        <div className="flex flex-wrap items-center gap-2">
          <PublicationTypeBadge label={typeLabel} compact={!featured} />
          {!featured && <PublicationMetaBadges pub={pub} compact />}
        </div>

        {featured && <PublicationMetaBadges pub={pub} />}

        <h3
          className={cn(
            "font-display font-semibold leading-snug text-gray-900 group-hover:text-blue",
            featured ? "text-[1.12rem] min-[901px]:text-[1.22rem]" : "text-[.96rem]",
          )}
        >
          {pub.title}
        </h3>

        <p className="text-[.78rem] italic leading-snug text-gray-500">{publicationAuthorsLine(pub)}</p>

        {pub.journalName && (
          <p className="text-[.76rem] font-medium leading-snug text-gray-600">📰 {pub.journalName}</p>
        )}

        <p
          className={cn(
            "text-[.82rem] leading-relaxed text-gray-600",
            featured ? "line-clamp-3" : "line-clamp-2",
          )}
        >
          {pub.abstract}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-[.74rem] text-gray-400">
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
  const { data: publications = [], isLoading } = useFeaturedPublications(3);
  const [featured, ...rest] = publications;

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
          <div
            className={cn(
              "grid gap-5",
              publications.length === 1
                ? "grid-cols-1"
                : "grid-cols-1 min-[901px]:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] min-[901px]:items-stretch",
            )}
          >
            {featured && (
              <HomePublicationCard
                pub={featured}
                featured
                className={rest.length > 0 ? "min-[901px]:row-span-2" : undefined}
              />
            )}
            <div className={cn(rest.length > 0 && "flex flex-col gap-5 min-[901px]:contents")}>
              {rest.map((pub) => (
                <HomePublicationCard key={pub.id} pub={pub} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">No publications available yet.</p>
        )}

        <div className="mt-8 text-center">
          <Button asChild className="inline-flex w-auto">
            <Link href="/research-publications">View All Research & Publications →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
