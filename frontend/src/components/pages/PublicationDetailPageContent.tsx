"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/styles/research-publication-detail.css";
import "@/styles/research-article-preview.css";
import {
  ResearchArticlePreview,
  publicationToPreviewData,
} from "@/components/publications/PublicationPreview";
import { PublicationStatisticsPanel } from "@/components/publications/PublicationDoctorSidebar";
import { RelatedPublications } from "@/components/publications/RelatedPublications";
import {
  usePublicationBySlug,
  useRelatedPublications,
  useTogglePublicationBookmark,
  useTrackPublicationDownload,
  useTrackPublicationShare,
  publicationPdfUrl,
} from "@/services/publications-api-hooks";
import { useAuthStore } from "@/store/auth.store";

export function PublicationDetailPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  const isLoggedIn = !!useAuthStore((s) => s.user);
  const { data: pub, isLoading, isError } = usePublicationBySlug(slug);
  const { data: related = [] } = useRelatedPublications(slug, 6);
  const trackDownload = useTrackPublicationDownload();
  const trackShare = useTrackPublicationShare();
  const bookmarkMutation = useTogglePublicationBookmark();

  const pdf = pub ? publicationPdfUrl(pub) : null;

  const doctorName = pub?.doctor?.user
    ? `Dr. ${pub.doctor.user.firstName} ${pub.doctor.user.lastName}`
    : "—";

  const handleDownload = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
    trackDownload.mutate(slug);
  };

  const handleShare = async () => {
    const url = window.location.href;
    trackShare.mutate(slug);
    if (navigator.share && pub) {
      await navigator.share({ title: pub.title, text: pub.abstract.slice(0, 120), url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleBookmark = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    bookmarkMutation.mutate(slug);
  };

  if (isLoading) {
    return (
      <div className="research-pub-detail">
        <div className="detail-loading">
          <p>Loading publication…</p>
        </div>
      </div>
    );
  }

  if (isError || !pub) {
    return (
      <div className="research-pub-detail">
        <div className="detail-error">
          <h1>Publication Not Found</h1>
          <p>This publication may be unpublished or no longer available.</p>
          <Link href="/research-publications" className="action-btn primary" style={{ display: "inline-flex", marginTop: 16 }}>
            ← Back to Research & Publications
          </Link>
        </div>
      </div>
    );
  }

  const previewData = publicationToPreviewData(pub);

  return (
    <div className="research-pub-detail">
      <div className={`detail-layout${related.length > 0 ? "" : " detail-layout--solo"}`}>
        <main className="detail-main">
          <PublicationStatisticsPanel
            viewCount={pub.viewCount}
            downloadCount={pub.downloadCount}
            bookmarkCount={pub.bookmarkCount}
            citationCount={pub.citationCount}
            shareCount={pub.shareCount}
          />

          <div className="action-bar">
            {pdf ? (
              <button type="button" className="action-btn primary" onClick={() => handleDownload(pdf)}>
                ⬇ Download PDF
              </button>
            ) : null}
            <button type="button" className="action-btn" onClick={handleShare}>
              Share
            </button>
            <button type="button" className="action-btn" onClick={handleBookmark}>
              {pub.bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
            </button>
          </div>

          <ResearchArticlePreview
            data={previewData}
            onDownloadAttachment={handleDownload}
          />
        </main>

        {related.length > 0 ? (
          <aside className="detail-sidebar">
            <RelatedPublications items={related} doctorName={doctorName} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
