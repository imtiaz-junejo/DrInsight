"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/public/section-heading";
import { doctorFullName, getInitials, specialtyEmoji } from "@/lib/data-mappers";
import { useBlogPost } from "@/services/api-hooks";

export default function BlogArticlePage() {
  const params = useParams<{ slug: string }>();
  const postQuery = useBlogPost(params.slug);
  const post = postQuery.data;

  if (postQuery.isLoading) {
    return <div className="px-6 py-20 text-center text-gray-500">Loading article...</div>;
  }

  if (postQuery.isError || !post) {
    return <div className="px-6 py-20 text-center text-red">Article not found.</div>;
  }

  const authorName = post.author ? doctorFullName(post.author) : "DrInsight Editorial Team";
  const authorInitials = post.author
    ? getInitials(post.author.firstName, post.author.lastName)
    : "DI";
  const authorSpecialty = post.author?.doctorProfile?.specialty;
  const relatedPosts = post.relatedPosts ?? [];

  return (
    <>
      <article className="mx-auto max-w-[820px] px-6 py-12">
        <div className="mb-4 text-[.72rem] font-bold uppercase tracking-widest text-blue">
          {post.category?.name || "Medical Article"}
        </div>
        <h1 className="font-display mb-4 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight text-gray-900">
          {post.title}
        </h1>
        <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-gray-200 pb-6 text-[.82rem] text-gray-500">
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[.7rem] font-bold text-white"
              style={{ background: "linear-gradient(135deg,#1a56a0,#0891b2)" }}
            >
              {authorInitials}
            </div>
            <div>
              <span className="font-semibold text-gray-800">{authorName}</span>
              {authorSpecialty && (
                <div className="text-[.72rem] text-gray-400">{authorSpecialty}</div>
              )}
            </div>
          </div>
          <span>·</span>
          <span>{post.readTimeMinutes} min read</span>
          <span>·</span>
          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Published"}</span>
          {typeof post.viewCount === "number" && (
            <>
              <span>·</span>
              <span>{post.viewCount.toLocaleString()} views</span>
            </>
          )}
          <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[.72rem] font-semibold text-green">
            ✓ Medically Reviewed
          </span>
        </div>

        <div className="mb-10 flex h-[280px] items-center justify-center rounded-[20px] bg-gradient-to-br from-blue-light to-[#dbeafe] text-7xl">
          {specialtyEmoji(post.category?.name ?? "")}
        </div>

        <div className="prose prose-gray max-w-none space-y-5 text-[.95rem] leading-relaxed text-gray-700">
          <p className="text-lg font-medium text-gray-800">{post.excerpt}</p>
          <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
          <div className="rounded-xl border-l-4 border-amber bg-[#fffbeb] p-4 text-[.85rem] text-[#92400e]">
            ⚠️ This article is for informational purposes only and does not constitute medical advice, diagnosis, or
            treatment. Always consult a qualified healthcare provider for medical decisions.
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-gray-200 pt-8">
          <Button asChild>
            <Link href="/book-consultation">📅 Book a Consultation</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/ask-doctor">💬 Ask a Doctor</Link>
          </Button>
        </div>
      </article>

      <section className="border-t border-gray-200 bg-gray-50 px-6 py-12">
        <div className="mx-auto max-w-[1240px]">
          <SectionTitle className="mb-6">Related Articles</SectionTitle>
          <div className="grid gap-5 sm:grid-cols-3">
            {relatedPosts.length > 0 ? (
              relatedPosts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  className="rounded-[20px] border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
                >
                  <div className="mb-3 text-4xl">{specialtyEmoji(item.category?.name ?? "")}</div>
                  <div className="mb-1 text-[.68rem] font-bold uppercase text-blue">
                    {item.category?.name || "Medical"}
                  </div>
                  <h3 className="font-display text-[.9rem] font-semibold leading-snug text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-[.78rem] text-gray-500">{doctorFullName(item.author)}</p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">No related articles found.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
