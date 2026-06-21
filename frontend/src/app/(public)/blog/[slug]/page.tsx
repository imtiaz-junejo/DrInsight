import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts, getPostBySlug } from "@/lib/blog-data";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Article Not Found — DrInsight" };
  return { title: `${post.title} — DrInsight`, description: post.excerpt };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <>
      <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.category }]} />

      <article className="mx-auto max-w-[820px] px-6 py-12">
        <div className="mb-4 text-[.72rem] font-bold uppercase tracking-widest" style={{ color: post.labelColor }}>
          {post.category}
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
              {post.authorInitials}
            </div>
            <span className="font-semibold text-gray-800">{post.author}</span>
          </div>
          <span>·</span>
          <span>{post.readTime} read</span>
          <span>·</span>
          <span>{post.date}</span>
          <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[.72rem] font-semibold text-green">
            ✓ Medically Reviewed
          </span>
        </div>

        <div
          className="mb-10 flex h-[280px] items-center justify-center rounded-[20px] text-7xl"
          style={{ background: post.bg }}
        >
          {post.emoji}
        </div>

        <div className="prose prose-gray max-w-none space-y-5 text-[.95rem] leading-relaxed text-gray-700">
          <p className="text-lg font-medium text-gray-800">{post.excerpt}</p>
          <p>
            Medical information on DrInsight is written and reviewed by board-certified physicians to ensure
            accuracy, clarity, and evidence-based guidance. This article provides general health information and
            should not replace personalised medical advice from your healthcare provider.
          </p>
          <h2 className="font-display text-xl font-bold text-gray-900">Key Takeaways</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Early recognition of symptoms can significantly improve health outcomes.</li>
            <li>Lifestyle modifications remain a cornerstone of preventive care.</li>
            <li>Consult a qualified specialist if you experience persistent or worsening symptoms.</li>
            <li>Regular screening and monitoring are essential for at-risk populations.</li>
          </ul>
          <h2 className="font-display text-xl font-bold text-gray-900">When to See a Doctor</h2>
          <p>
            If you experience new, severe, or persistent symptoms related to this condition, schedule an appointment
            with your primary care physician or a relevant specialist. For emergencies, call 911 immediately.
          </p>
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
          <h2 className="font-display mb-6 text-xl font-bold text-gray-900">Related Articles</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`}>
                <Card className="h-full transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]">
                  <div
                    className="flex h-[120px] items-center justify-center text-4xl"
                    style={{ background: r.bg }}
                  >
                    {r.emoji}
                  </div>
                  <CardContent className="pt-4">
                    <div className="mb-1 text-[.68rem] font-bold uppercase" style={{ color: r.labelColor }}>
                      {r.category}
                    </div>
                    <h3 className="font-display text-[.9rem] font-semibold leading-snug text-gray-900">{r.title}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
