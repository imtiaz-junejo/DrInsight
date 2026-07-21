"use client";

import Link from "next/link";
import {
  ArrowUp,
  BadgeCheck,
  Bookmark,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  Contrast,
  ExternalLink,
  Eye,
  Flame,
  Frown,
  Library,
  Lightbulb,
  Link2,
  ListTree,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  Newspaper,
  Pin,
  Printer,
  RefreshCw,
  Shield,
  Smile,
  Star,
  Stethoscope,
  Target,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArticleCoverMedia } from "@/components/blog/ArticleCoverMedia";
import { AdIcon, AdIconLabel, AdSectionHeading, AdFacebookIcon, AdLinkedInIcon, AdWhatsAppIcon, AdXIcon } from "@/components/blog/ArticleDetailIcons";
import { getBlogCategoryVisuals } from "@/lib/blog-category";
import { getBlogVisitorKey, getStoredArticleRating, storeArticleRating } from "@/lib/blog-visitor";
import { extractTocFromHtml, injectHeadingIds } from "@/lib/blog-toc";
import { authorProfileHref } from "@/lib/author-profile-url";
import {
  doctorFullName,
  formatDate,
  getInitials,
  gradientForId,
} from "@/lib/data-mappers";
import {
  useBlogPost,
  useBlogPostComment,
  useBlogPostFeedback,
  useBlogPostShare,
  useNewsletterSubscribe,
  type BlogAuthorProfile,
  type BlogGlossaryTerm,
  type BlogPostDetail,
  type BlogReference,
} from "@/services/api-hooks";

const DEFAULT_DISCLAIMER =
  "This article is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional regarding any medical condition.";

function blogAuthorHref(author?: BlogAuthorProfile | null): string | null {
  const profile = author?.doctorProfile;
  if (profile?.id) return authorProfileHref({ id: profile.id, profileSlug: profile.profileSlug });
  return null;
}

const REACTIONS = [
  { id: "informative", label: "Informative", icon: Lightbulb, accent: "informative" },
  { id: "eye-opening", label: "Eye-opening", icon: Eye, accent: "eye-opening" },
  { id: "reassuring", label: "Reassuring", icon: Smile, accent: "reassuring" },
  { id: "concerning", label: "Concerning", icon: Frown, accent: "concerning" },
  { id: "bookmarked", label: "Bookmarked", icon: Pin, accent: "bookmarked" },
] as const;

type Props = {
  slug: string;
};

function AuthorAvatar({
  user,
  className,
  size = 54,
}: {
  user?: BlogAuthorProfile | null;
  className?: string;
  size?: number;
}) {
  const initials = user ? getInitials(user.firstName, user.lastName) : "DR";
  const gradient = gradientForId(user?.id ?? initials);

  return (
    <div className={className} style={{ background: gradient, width: size, height: size }}>
      {user?.avatarUrl ? (
        <img src={user.avatarUrl} alt={doctorFullName(user)} />
      ) : (
        initials
      )}
    </div>
  );
}

function formatAuthorRole(author?: BlogAuthorProfile | null) {
  if (!author?.doctorProfile) return null;
  const { specialty, experienceYears, platformRole, professionalTitle } = author.doctorProfile;
  const role = platformRole || professionalTitle || `Consultant ${specialty ?? "Physician"}`;
  const years = experienceYears ? ` · ${experienceYears} years experience` : "";
  return `${role}${years}`;
}

export function BlogArticleDetail({ slug }: Props) {
  const postQuery = useBlogPost(slug);
  const commentMutation = useBlogPostComment(slug);
  const feedbackMutation = useBlogPostFeedback(slug);
  const shareMutation = useBlogPostShare(slug);
  const newsletterMutation = useNewsletterSubscribe();

  const post = postQuery.data as BlogPostDetail | undefined;

  const [fontSize, setFontSize] = useState(15);
  const [highContrast, setHighContrast] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showBackTop, setShowBackTop] = useState(false);
  const [helpfulChoice, setHelpfulChoice] = useState<"yes" | "no" | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [ratingText, setRatingText] = useState("");
  const [activeReactions, setActiveReactions] = useState<Set<string>>(new Set());
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const proseRef = useRef<HTMLDivElement>(null);

  const categoryName = post?.category?.name ?? "Medical";
  const visuals = getBlogCategoryVisuals(categoryName);
  const specialty = post?.specialty ?? post?.author?.doctorProfile?.specialty ?? categoryName;

  const toc = useMemo(() => {
    if (!post?.content) return [];
    return extractTocFromHtml(post.content);
  }, [post?.content]);

  const contentHtml = useMemo(() => {
    if (!post?.content) return "";
    return injectHeadingIds(post.content, toc);
  }, [post?.content, toc]);

  const references = (post?.references as BlogReference[] | null) ?? [];
  const glossary = (post?.glossary as BlogGlossaryTerm[] | null) ?? [];

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      setShowBackTop(doc.scrollTop > 400);

      if (toc.length) {
        let current = toc[0]?.id ?? "";
        for (const item of toc) {
          const el = document.getElementById(item.id);
          if (el && el.getBoundingClientRect().top < 120) {
            current = item.id;
          }
        }
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [toc]);

  useEffect(() => {
    if (!post) return;
    const key = `bookmark:${post.slug}`;
    setBookmarked(localStorage.getItem(key) === "1");

    const storedRating = getStoredArticleRating(post.slug);
    if (storedRating) {
      setUserRating(storedRating);
      setRatingText(`Your rating: ${storedRating} / 5 `);
      return;
    }

    if (post.averageRating && post.ratingCount) {
      setRatingText(`Current average: ${post.averageRating.toFixed(1)} / 5 (${post.ratingCount.toLocaleString()} ratings)`);
    }
  }, [post]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return post?.canonicalUrl || `${window.location.origin}/blog/${slug}`;
  }, [post?.canonicalUrl, slug]);

  const handleShare = useCallback(
    (platform: string) => {
      if (!post) return;
      shareMutation.mutate();
      const url = encodeURIComponent(shareUrl);
      const title = encodeURIComponent(post.title);
      const urls: Record<string, string> = {
        fb: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        tw: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
        li: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        wa: `https://wa.me/?text=${title}%20${url}`,
      };
      if (urls[platform]) window.open(urls[platform], "_blank", "noopener,noreferrer");
    },
    [post, shareMutation, shareUrl],
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      shareMutation.mutate();
      setTimeout(() => setLinkCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [shareUrl, shareMutation]);

  const toggleBookmark = useCallback(() => {
    if (!post) return;
    const next = !bookmarked;
    setBookmarked(next);
    localStorage.setItem(`bookmark:${post.slug}`, next ? "1" : "0");
  }, [bookmarked, post]);

  const toggleListen = useCallback(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;

    if (synth.speaking || synth.pending) {
      synth.cancel();
      setIsListening(false);
      return;
    }

    const text = proseRef.current?.innerText?.trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsListening(false);
    utterance.onerror = () => setIsListening(false);
    setIsListening(true);
    synth.speak(utterance);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleHelpful = useCallback(
    (type: "yes" | "no") => {
      setHelpfulChoice(type);
      feedbackMutation.mutate({ helpful: type === "yes" });
    },
    [feedbackMutation],
  );

  const handleRate = useCallback(
    (n: number) => {
      if (feedbackMutation.isPending) return;

      setUserRating(n);

      feedbackMutation.mutate(
        { rating: n, visitorKey: getBlogVisitorKey() },
        {
          onSuccess: (data: { averageRating?: number | null; ratingCount?: number }) => {
            storeArticleRating(slug, n);
            if (data.averageRating != null && data.ratingCount != null) {
              setRatingText(
                `Your rating: ${n} / 5. Current average: ${data.averageRating.toFixed(1)} / 5 (${data.ratingCount.toLocaleString()} ratings)`,
              );
            } else {
              setRatingText(`Your rating: ${n} / 5`);
            }
          },
          onError: () => {
            const storedRating = getStoredArticleRating(slug);
            setUserRating(storedRating ?? 0);
          },
        },
      );
    },
    [feedbackMutation, slug],
  );

  const handleCommentSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const name = (form.elements.namedItem("commentName") as HTMLInputElement).value.trim();
      const email = (form.elements.namedItem("commentEmail") as HTMLInputElement).value.trim();
      const content = (form.elements.namedItem("commentBody") as HTMLTextAreaElement).value.trim();
      if (!name || !content) return;

      commentMutation.mutate(
        { authorName: name, authorEmail: email || undefined, content },
        {
          onSuccess: () => {
            setCommentSubmitted(true);
            form.reset();
          },
        },
      );
    },
    [commentMutation],
  );

  const handleNewsletter = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newsletterEmail.trim()) return;
      try {
        await newsletterMutation.mutateAsync(newsletterEmail.trim());
        setNewsletterMsg("Subscribed successfully!");
        setNewsletterEmail("");
      } catch {
        setNewsletterMsg("Could not subscribe. Please try again.");
      }
    },
    [newsletterEmail, newsletterMutation],
  );

  if (postQuery.isLoading) {
    return <div className="px-6 py-20 text-center text-gray-500">Loading article...</div>;
  }

  if (postQuery.isError || !post) {
    return <div className="px-6 py-20 text-center text-red-600">Article not found.</div>;
  }

  const authorName = doctorFullName(post.author);
  const authorRole = formatAuthorRole(post.author);
  const reviewerName = post.reviewer ? doctorFullName(post.reviewer) : null;
  const reviewerRole = formatAuthorRole(post.reviewer);
  const disclaimer = post.medicalDisclaimer || DEFAULT_DISCLAIMER;
  const summaryPoints = post.summaryPoints?.length ? post.summaryPoints : [];
  const keyTakeaways = post.keyTakeaways?.length ? post.keyTakeaways : [];
  const relatedPosts = post.relatedPosts ?? [];
  const sidebarRelated = post.sidebarRelated ?? relatedPosts.slice(0, 3);
  const trending = post.trendingInSpecialty ?? [];
  const comments = post.comments ?? [];
  const groupLabel =
    visuals.group === "clinical"
      ? "Clinical"
      : visuals.group === "surgical"
        ? "Surgical"
        : "Medical";

  return (
    <div className={`article-detail-page${highContrast ? " high-contrast" : ""}`}>

      {/* <div className="ad-breadcrumb">
        <div className="ad-bc">
          🏠 <Link href="/">Home</Link> ›
          <Link href="/blog">Blog</Link> ›
          {post.category && (
            <>
              <Link href={`/blog?category=${post.category.slug}`}>{groupLabel} Specialties</Link> ›
              <Link href={`/blog?category=${post.category.slug}`}>{post.category.name}</Link> ›
            </>
          )}
          <span className="cur">{post.title}</span>
        </div>
      </div> */}

      <div className="ad-header ad-detail-card border border-gray-300 bg-white shadow-sm">
        <div className="ad-header-top">
          <span className={`ad-cat-badge ${visuals.specTagClass}`}>
            {visuals.emoji} {groupLabel} · {specialty}
          </span>
          <div className="ad-reading-time">
            <AdIconLabel icon={Clock} size={14}>
              {post.readTimeMinutes} min read
            </AdIconLabel>
          </div>
          {post.peerReviewed && (
            <div className="ad-peer-badge">
              <AdIconLabel icon={BadgeCheck} size={14}>
                Peer-Reviewed
              </AdIconLabel>
            </div>
          )}
        </div>

        <h1 className="ad-title post-title text-2xl">{post.title}</h1>
        {post.subtitle && <p className="ad-subtitle">{post.subtitle}</p>}

        {(post.tags?.length ?? 0) > 0 && (
          <div className="ad-tag-row">
            {post.tags!.map((tag) => (
              <Link key={tag} href={`/blog?search=${encodeURIComponent(tag)}`} className="ad-spec-tag">
                {tag}
              </Link>
            ))}
          </div>
        )}

        <div className="ad-meta-row">
          <div className="ad-meta-item">
            <AdIconLabel icon={Calendar} size={14}>
              <strong>Published:</strong> {post.publishedAt ? formatDate(post.publishedAt) : "—"}
            </AdIconLabel>
          </div>
          {(post.lastReviewedAt || post.updatedAt) && (
            <div className="ad-meta-item">
              <AdIconLabel icon={RefreshCw} size={14}>
                <strong>Last reviewed:</strong> {formatDate(post.lastReviewedAt ?? post.updatedAt!)}
              </AdIconLabel>
            </div>
          )}
          <div className="ad-meta-item">
            <AdIconLabel icon={Eye} size={14}>
              <strong>Views:</strong> {(post.viewCount ?? 0).toLocaleString()}
            </AdIconLabel>
          </div>
          <div className="ad-meta-item" style={{ color: "var(--gray-400)", fontSize: ".7rem" }}>
            URL: /blog/{post.slug}
          </div>
        </div>

        <div className="ad-share-row">
          <span className="ad-share-label">Share:</span>
          <button type="button" className="ad-share-btn fb" title="Facebook" onClick={() => handleShare("fb")}>
            <AdFacebookIcon size={15} />
          </button>
          <button type="button" className="ad-share-btn tw" title="X / Twitter" onClick={() => handleShare("tw")}>
            <AdXIcon size={14} />
          </button>
          <button type="button" className="ad-share-btn li" title="LinkedIn" onClick={() => handleShare("li")}>
            <AdLinkedInIcon size={15} />
          </button>
          <button type="button" className="ad-share-btn wa" title="WhatsApp" onClick={() => handleShare("wa")}>
            <AdWhatsAppIcon size={15} />
          </button>
          <button type="button" className="ad-share-btn" title="Copy Link" onClick={handleCopyLink}>
            {linkCopied ? <AdIcon icon={Check} size={15} /> : <AdIcon icon={Link2} size={15} />}
          </button>
          <button
            type="button"
            className={`ad-bookmark-btn${bookmarked ? " saved" : ""}`}
            onClick={toggleBookmark}
          >
            <AdIconLabel icon={bookmarked ? Star : Bookmark} size={15}>
              {bookmarked ? "Saved!" : "Save Article"}
            </AdIconLabel>
          </button>
          <Link href="/contact" className="ad-report-link">
            <AdIconLabel icon={TriangleAlert} size={14}>
              Report an error
            </AdIconLabel>
          </Link>
        </div>
      </div>

      <div className="ad-author-block">
        <div className="ad-author-row">
          <div className="ad-author-card ad-detail-card border border-gray-300 bg-white shadow-sm">
            <AuthorAvatar user={post.author} className="ad-author-av" />
            <div>
              <div className="ad-author-label">Written by</div>
              <div className="ad-author-name">{authorName}</div>
              {post.author?.doctorProfile?.credentials && (
                <div className="ad-author-creds">{post.author.doctorProfile.credentials}</div>
              )}
              {authorRole && <div className="ad-author-role">{authorRole}</div>}
              {blogAuthorHref(post.author) && (
                <Link href={blogAuthorHref(post.author)!} className="ad-author-link">
                  View full bio →
                </Link>
              )}
            </div>
          </div>

          {reviewerName && (
            <div className="ad-author-card ad-detail-card border border-gray-300 bg-white shadow-sm">
              <AuthorAvatar user={post.reviewer} className="ad-author-av" />
              <div>
                <div className="ad-author-label">Medically Reviewed by</div>
                <div className="ad-author-name">{reviewerName}</div>
                {post.reviewer?.doctorProfile?.credentials && (
                  <div className="ad-author-creds">{post.reviewer.doctorProfile.credentials}</div>
                )}
                {reviewerRole && <div className="ad-author-role">{reviewerRole}</div>}
                {blogAuthorHref(post.reviewer) && (
                  <Link href={blogAuthorHref(post.reviewer)!} className="ad-author-link">
                    View full bio →
                  </Link>
                )}
                {post.lastReviewedAt && (
                  <div className="ad-cert-badge">
                    <AdIconLabel icon={BadgeCheck} size={13}>
                      Board Certified · Reviewed {formatDate(post.lastReviewedAt)}
                    </AdIconLabel>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Link href="/editorial-policy" className="ad-editorial-link">
          <AdIconLabel icon={ClipboardList} size={14}>
            How we ensure accuracy — Read our Editorial Guidelines & Medical Review Process
          </AdIconLabel>
        </Link>
      </div>

      <div className="ad-controls">
        <span style={{ fontSize: ".74rem", fontWeight: 600, color: "var(--gray-500)" }}>Text Size:</span>
        <div className="ad-font-ctrl">
          <button type="button" className="ad-font-btn" onClick={() => setFontSize((s) => Math.max(13, s - 1))} title="Decrease">
            A−
          </button>
          <button type="button" className="ad-font-btn" onClick={() => setFontSize(15)} title="Reset">
            A
          </button>
          <button type="button" className="ad-font-btn" onClick={() => setFontSize((s) => Math.min(20, s + 1))} title="Increase">
            A+
          </button>
        </div>
        <button
          type="button"
          className={`ad-contrast-btn${highContrast ? " active" : ""}`}
          onClick={() => setHighContrast((v) => !v)}
          aria-pressed={highContrast}
        >
          <AdIconLabel icon={Contrast} size={14}>
            High Contrast
          </AdIconLabel>
        </button>
        <button
          type="button"
          className={`ad-listen-btn${isListening ? " active" : ""}`}
          onClick={toggleListen}
          aria-pressed={isListening}
        >
          <AdIconLabel icon={isListening ? VolumeX : Volume2} size={14}>
            {isListening ? "Stop Listening" : "Listen to Article"}
          </AdIconLabel>
        </button>
        <button type="button" className="ad-print-btn" onClick={() => window.print()}>
          <AdIconLabel icon={Printer} size={14}>
            Print
          </AdIconLabel>
        </button>
      </div>

      <div className="ad-layout">
        <div>
          <div className="ad-body" style={{ "--article-fs": `${fontSize}px` } as React.CSSProperties}>
            <div className="ad-hero-img">
              <ArticleCoverMedia
                className="ad-hero-img-inner"
                imageUrl={post.coverImageUrl}
                categoryName={categoryName}
                alt={post.coverImageAlt || post.title}
                emojiSize={80}
                useHeroGradient
              />
              {post.coverImageCaption && <div className="ad-img-caption">{post.coverImageCaption}</div>}
            </div>

            {summaryPoints.length > 0 && (
              <div className="ad-summary-box">
                <AdSectionHeading icon={ClipboardList}>What You&apos;ll Learn in This Article</AdSectionHeading>
                <ul>
                  {summaryPoints.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {toc.length > 0 && (
              <div className="ad-toc-mobile">
                <button type="button" className="ad-toc-header" onClick={() => setTocOpen((v) => !v)}>
                  <AdIconLabel icon={ListTree} size={16}>
                    Table of Contents
                  </AdIconLabel>
                  <AdIcon icon={tocOpen ? ChevronDown : ChevronRight} size={16} />
                </button>
                <div className={`ad-toc-body${tocOpen ? " open" : ""}`}>
                  <div className="ad-toc-list">
                    {toc.map((item, i) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`ad-toc-item${item.level === 3 ? " ad-toc-sub" : ""}${activeSection === item.id ? " active" : ""}`}
                        onClick={() => scrollTo(item.id)}
                      >
                        {item.level === 2 ? `${toc.filter((t, j) => j <= i && t.level === 2).length}. ` : "↳ "}
                        {item.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="ad-prose" ref={proseRef}>
              <div className="ad-med-disclaimer">
                <AdIcon icon={TriangleAlert} size={20} className="ad-icon-warning" />
                <p>
                  <strong>Medical Disclaimer:</strong> {disclaimer}
                </p>
              </div>

              <div dangerouslySetInnerHTML={{ __html: contentHtml }} />

              {keyTakeaways.length > 0 && (
                <div className="ad-key-takeaways" id="key-takeaways">
                  <h3 className="ad-section-title-with-icon">
                    <AdIcon icon={Target} size={20} />
                    Key Takeaways
                  </h3>
                  <ul>
                    {keyTakeaways.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {references.length > 0 && (
                <div className="ad-references">
                  <h3 className="ad-section-title-with-icon">
                    <AdIcon icon={Library} size={18} />
                    References & Sources
                  </h3>
                  <div className="ad-ref-list">
                    {references.map((ref, i) => (
                      <div key={`${ref.text}-${i}`} className="ad-ref-item">
                        <span>{i + 1}.</span>
                        {ref.url ? (
                          <>
                            {ref.text}{" "}
                            <a href={ref.url} target="_blank" rel="noopener noreferrer" className="ad-ext-link">
                              <AdIcon icon={ExternalLink} size={13} />
                            </a>
                          </>
                        ) : (
                          ref.text
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {glossary.length > 0 && (
                <div className="ad-glossary">
                  <button type="button" className="ad-glossary-head" onClick={() => setGlossaryOpen((v) => !v)}>
                    <AdIconLabel icon={BookOpen} size={16}>
                      Glossary of Medical Terms
                    </AdIconLabel>
                    <AdIcon icon={glossaryOpen ? ChevronDown : ChevronRight} size={16} />
                  </button>
                  <div className={`ad-glossary-body${glossaryOpen ? " open" : ""}`}>
                    {glossary.map((item) => (
                      <div key={item.term} className="ad-gloss-item">
                        <span className="ad-gloss-term">{item.term}</span>
                        <span className="ad-gloss-def">{item.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="ad-med-disclaimer">
                <AdIcon icon={TriangleAlert} size={20} className="ad-icon-warning" />
                <p>
                  <strong>Medical Disclaimer:</strong> {disclaimer}
                </p>
              </div>
            </div>
          </div>

          <div className="ad-engagement ad-detail-card ad-surface-card border border-gray-400 bg-gray-100 shadow-sm">
            <h3>Was this article helpful to you?</h3>
            <div className="ad-helpful-row">
              <button
                type="button"
                className={`ad-helpful-btn yes${helpfulChoice === "yes" ? " active" : ""}`}
                onClick={() => handleHelpful("yes")}
              >
                <AdIconLabel icon={ThumbsUp} size={16}>
                  {helpfulChoice === "yes" ? "Thanks for your feedback!" : "Yes, helpful"}
                </AdIconLabel>
              </button>
              <button
                type="button"
                className={`ad-helpful-btn no${helpfulChoice === "no" ? " active" : ""}`}
                onClick={() => handleHelpful("no")}
              >
                <AdIconLabel icon={ThumbsDown} size={16}>
                  {helpfulChoice === "no" ? "We'll work to improve this" : "Not helpful"}
                </AdIconLabel>
              </button>
            </div>
            <div style={{ fontSize: ".78rem", color: "var(--gray-500)", textAlign: "center", marginBottom: 12 }}>
              Rate this article:
            </div>
            <div className="ad-star-row">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ad-star${n <= userRating ? " active" : ""}`}
                  onClick={() => handleRate(n)}
                  disabled={feedbackMutation.isPending}
                  aria-label={`Rate ${n} stars`}
                >
                  <Star size={22} strokeWidth={2} fill={n <= userRating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            {ratingText && (
              <div style={{ fontSize: ".74rem", color: "var(--gray-400)", textAlign: "center", marginBottom: 16 }}>
                {ratingText}
              </div>
            )}
            <div className="ad-reaction-row">
              {REACTIONS.map((reaction) => {
                const ReactionIcon = reaction.icon;
                return (
                  <button
                    key={reaction.id}
                    type="button"
                    className={`ad-reaction-btn ad-reaction-${reaction.accent}${activeReactions.has(reaction.id) ? " active" : ""}`}
                    aria-pressed={activeReactions.has(reaction.id)}
                    onClick={() =>
                      setActiveReactions((prev) => {
                        const next = new Set(prev);
                        if (next.has(reaction.id)) next.delete(reaction.id);
                        else next.add(reaction.id);
                        return next;
                      })
                    }
                  >
                    <AdIconLabel icon={ReactionIcon} size={14}>
                      {reaction.label}
                    </AdIconLabel>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ad-comments-section">
            <h3 className="ad-section-title-with-icon">
              <AdIcon icon={MessageSquare} size={20} />
              Comments ({comments.length})
            </h3>
            <div className="ad-moderation-banner">
              <AdIconLabel icon={Shield} size={14}>
                Comments are moderated by our medical team before publication. We do not publish comments requesting specific medical advice.
              </AdIconLabel>
            </div>

            {comments.map((comment) => (
              <div key={comment.id} className="ad-comment-card">
                <div
                  className="ad-comment-av"
                  style={{ background: gradientForId(comment.authorName) }}
                >
                  {getInitials(comment.authorName.split(" ")[0], comment.authorName.split(" ")[1])}
                </div>
                <div className="ad-comment-body">
                  <h4>{comment.authorName}</h4>
                  <div className="c-meta">
                    {formatDate(comment.createdAt)}
                    {comment.isVerifiedPatient && (
                      <span className="ad-verified-patient">
                        <AdIconLabel icon={BadgeCheck} size={12}>
                          Verified Patient
                        </AdIconLabel>
                      </span>
                    )}
                  </div>
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}

            <form className="ad-comment-form ad-detail-card ad-surface-card border border-gray-400 bg-gray-100 shadow-sm" onSubmit={handleCommentSubmit}>
              <h4>Leave a Comment</h4>
              <div className="ad-cf-row">
                <input
                  className="ad-cf-input border border-gray-300 bg-gray-100"
                  name="commentName"
                  type="text"
                  placeholder="Your Name"
                  required
                />
                <input
                  className="ad-cf-input border border-gray-300 bg-gray-100"
                  name="commentEmail"
                  type="email"
                  placeholder="Email Address (not published)"
                />
              </div>
              <textarea
                className="ad-cf-ta border border-gray-300 bg-gray-100"
                name="commentBody"
                placeholder="Share your thoughts, experience, or feedback about this article..."
                required
              />
              <button type="submit" className="ad-cf-submit" disabled={commentSubmitted || commentMutation.isPending}>
                {commentSubmitted ? "Submitted — pending review" : "Submit Comment"}
              </button>
              <div className="ad-moderation-note">
                <AdIconLabel icon={ClipboardList} size={13}>
                  Comments are reviewed by our medical team before publication. Please do not submit personal medical questions here — use our Ask the Doctor service instead.
                </AdIconLabel>
              </div>
            </form>
          </div>
        </div>

        <aside className="ad-sidebar">
          {toc.length > 0 && (
            <div className="ad-s-card ad-detail-card border border-gray-300 bg-white shadow-sm">
              <AdSectionHeading icon={ListTree} as="h4">
                In This Article
              </AdSectionHeading>
              <div className="ad-toc-sidebar">
                {toc.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`ad-toc-s-item${item.level === 3 ? " ad-toc-s-sub" : ""}${activeSection === item.id ? " active" : ""}`}
                    onClick={() => scrollTo(item.id)}
                  >
                    {item.level === 2
                      ? `${toc.filter((t, j) => j <= i && t.level === 2).length}. ${item.text}`
                      : `↳ ${item.text}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="ad-s-card ad-detail-card border border-gray-300 bg-white shadow-sm">
            <div className="ad-s-author">
              <AuthorAvatar user={post.author} className="ad-s-av" size={44} />
              <div>
                <h4>{authorName}</h4>
                <p>
                  {post.author?.doctorProfile?.specialty ?? specialty}
                  {post.authorArticleCount ? ` · ${post.authorArticleCount} articles` : ""}
                </p>
              </div>
            </div>
          </div>

          {sidebarRelated.length > 0 && (
            <div className="ad-s-card ad-detail-card border border-gray-300 bg-white shadow-sm">
              <AdSectionHeading icon={Newspaper} as="h4">
                Related Articles
              </AdSectionHeading>
              {sidebarRelated.map((item) => (
                  <Link key={item.slug} href={`/blog/${item.slug}`} className="ad-s-rel-item">
                    <ArticleCoverMedia
                      className="ad-s-rel-thumb"
                      imageUrl={item.coverImageUrl}
                      categoryName={item.category?.name ?? ""}
                      emojiSize={28}
                    />
                    <div>
                      <h5>{item.title}</h5>
                      <span>
                        {item.category?.name} · {item.readTimeMinutes} min read
                      </span>
                    </div>
                  </Link>
              ))}
            </div>
          )}

          {trending.length > 0 && (
            <div className="ad-s-card ad-detail-card border border-gray-300 bg-white shadow-sm">
              <AdSectionHeading icon={Flame} as="h4">
                Trending in {specialty}
              </AdSectionHeading>
              {trending.map((item, i) => (
                <Link key={item.slug} href={`/blog/${item.slug}`} className="ad-trending-item">
                  <div className="ad-t-num">{i + 1}</div>
                  <h5>{item.title}</h5>
                </Link>
              ))}
            </div>
          )}

          <div className="ad-s-card ad-s-newsletter" style={{ background: "linear-gradient(135deg,#0f3d7a,#1a56a0)", border: "none", color: "#fff" }}>
            <h4 className="ad-section-title-with-icon" style={{ color: "#fff", borderColor: "rgba(255,255,255,.15)" }}>
              <AdIcon icon={Mail} size={18} />
              Weekly Health Digest
            </h4>
            <p style={{ fontSize: ".76rem", opacity: 0.88, marginBottom: 12, lineHeight: 1.6 }}>
              Get the best medical articles from our doctors every Monday — free.
            </p>
            <form onSubmit={handleNewsletter}>
              <input
                type="email"
                placeholder="Your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                style={{ background: "rgba(255,255,255,.15)", borderColor: "rgba(255,255,255,.25)", color: "#fff" }}
              />
              <button type="submit" style={{ background: "#fff", color: "#0f3d7a", border: "none" }} disabled={newsletterMutation.isPending}>
                Subscribe Free →
              </button>
            </form>
            {newsletterMsg && <p style={{ fontSize: ".68rem", opacity: 0.9, marginTop: 7 }}>{newsletterMsg}</p>}
            <p className="ad-newsletter-privacy">
              <AdIconLabel icon={Lock} size={12}>
                No spam. Unsubscribe anytime.
              </AdIconLabel>
            </p>
          </div>

          <div className="ad-s-card ad-detail-card border border-gray-300 bg-white shadow-sm text-center">
            <div className="ad-cta-icon-wrap">
              <AdIcon icon={Stethoscope} size={24} />
            </div>
            <div style={{ fontSize: ".84rem", fontWeight: 700, color: "var(--gray-900)", marginBottom: 5 }}>
              Have a {specialty.toLowerCase()} concern?
            </div>
            <p style={{ fontSize: ".76rem", color: "var(--gray-600)", marginBottom: 12, lineHeight: 1.5 }}>
              Book a consultation with {authorName} or another specialist today.
            </p>
            <Link href="/book-consultation" className="ad-sidebar-cta-link ad-sidebar-cta-primary">
              <AdIcon icon={CalendarDays} size={16} />
              Book Consultation
            </Link>
            <Link href="/ask-doctor" className="ad-sidebar-cta-link ad-sidebar-cta-secondary">
              <AdIcon icon={MessageCircle} size={16} />
              Ask a Doctor Free
            </Link>
          </div>
        </aside>
      </div>

      {(post.previousPost || post.nextPost) && (
        <div className="ad-prev-next">
          {post.previousPost ? (
            <Link href={`/blog/${post.previousPost.slug}`} className="ad-detail-card border border-gray-300 bg-white shadow-sm">
              <div className="label">← Previous Article</div>
              <div className="title">{post.previousPost.title}</div>
            </Link>
          ) : (
            <div />
          )}
          {post.nextPost ? (
            <Link href={`/blog/${post.nextPost.slug}`} className="ad-detail-card border border-gray-300 bg-white shadow-sm text-right">
              <div className="label">Next Article →</div>
              <div className="title">{post.nextPost.title}</div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}

      {relatedPosts.length > 0 && (
        <div className="ad-related-section">
          <div className="ad-section-header">
            <h2 className="ad-section-title-with-icon">
              <AdIcon icon={BookOpen} size={22} />
              Related Articles
            </h2>
            {post.category && (
              <Link href={`/blog?category=${post.category.slug}`}>View all in {post.category.name} →</Link>
            )}
          </div>
          <div className="ad-related-grid">
            {relatedPosts.map((item) => {
              const itemVisuals = getBlogCategoryVisuals(item.category?.name ?? "");
              return (
                <Link key={item.slug} href={`/blog/${item.slug}`} className="ad-rel-card ad-detail-card border border-gray-300 bg-white shadow-sm">
                  <ArticleCoverMedia
                    className="ad-rel-thumb"
                    imageUrl={item.coverImageUrl}
                    categoryName={item.category?.name ?? ""}
                    emojiSize={40}
                  >
                    <div className="ad-rel-badge" style={{ background: itemVisuals.badgeBg }}>
                      {(item.category?.name ?? "MEDICAL").toUpperCase()}
                    </div>
                  </ArticleCoverMedia>
                  <div className="ad-rel-body">
                    <h3>{item.title}</h3>
                    <div className="ad-rel-meta">
                      <div className="ad-rel-av" style={{ background: gradientForId(item.author?.id ?? item.slug) }}>
                        {getInitials(item.author?.firstName, item.author?.lastName)}
                      </div>
                      <span>{doctorFullName(item.author)}</span>·<span>{item.readTimeMinutes} min</span>
                      {item.publishedAt && (
                        <>
                          ·<span>{formatDate(item.publishedAt, { month: "short", day: "numeric" })}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="ad-sticky-bar">
        <div className="ad-sticky-bar-inner">
          <div style={{ fontSize: ".78rem", fontWeight: 600, color: "var(--gray-700)" }}>
            {visuals.emoji} {post.title.length > 48 ? `${post.title.slice(0, 48)}…` : post.title}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="ad-share-btn fb" onClick={() => handleShare("fb")} title="Facebook">
              <AdFacebookIcon size={15} />
            </button>
            <button type="button" className="ad-share-btn tw" onClick={() => handleShare("tw")} title="X / Twitter">
              <AdXIcon size={14} />
            </button>
            <button type="button" className="ad-share-btn wa" onClick={() => handleShare("wa")} title="WhatsApp">
              <AdWhatsAppIcon size={15} />
            </button>
            <button
              type="button"
              className={`ad-bookmark-btn${bookmarked ? " saved" : ""}`}
              onClick={toggleBookmark}
              style={{ padding: "5px 10px", fontSize: ".74rem" }}
            >
              <AdIconLabel icon={bookmarked ? Star : Bookmark} size={14}>
                {bookmarked ? "Saved" : "Save"}
              </AdIconLabel>
            </button>
          </div>
        </div>
      </div>

      {showBackTop && (
        <button type="button" className="ad-back-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">
          <AdIcon icon={ArrowUp} size={18} />
        </button>
      )}
    </div>
  );
}
