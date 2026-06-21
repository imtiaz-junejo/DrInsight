"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogPosts } from "@/lib/blog-data";
import { cn } from "@/lib/utils";

const filters = [
  { key: "all", label: "All" },
  { key: "cardiology", label: "❤️ Cardiology" },
  { key: "neurology", label: "🧠 Neurology" },
  { key: "diabetes", label: "🩸 Diabetes" },
  { key: "mental", label: "🧘 Mental Health" },
  { key: "womens", label: "🤰 Women's Health" },
  { key: "pediatrics", label: "👶 Pediatrics" },
  { key: "nutrition", label: "🍎 Nutrition" },
];

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = blogPosts.filter((post) => {
    const matchCat = activeFilter === "all" || post.categoryKey === activeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q || post.title.toLowerCase().includes(q) || post.excerpt.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <>
      <Breadcrumb items={[{ label: "Medical Blog" }]} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-dark via-blue to-teal px-6 py-16 text-white">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-[#93c5fd]">
              Evidence-Based Medical Blog
            </div>
            <h1 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight">
              Doctor-Written Health Articles You Can Trust
            </h1>
            <p className="mt-4 text-[.95rem] opacity-90">
              1,000+ peer-reviewed articles across every medical specialty — written and reviewed by
              board-certified physicians.
            </p>
            <div className="mt-6 flex gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles by condition, symptom, or specialty..."
                className="border-white/20 bg-white/10 text-white placeholder:text-white/60"
              />
              <Button variant="white" className="shrink-0">
                🔍 Search
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                ["1,000+", "Articles Published"],
                ["200+", "Doctor Authors"],
                ["50+", "Specialties Covered"],
                ["Weekly", "New Content"],
              ].map(([num, label]) => (
                <div key={label as string}>
                  <strong className="font-display block text-xl">{num}</strong>
                  <span className="text-[.75rem] opacity-80">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/blog/heart-disease-warning-signs"
            className="overflow-hidden rounded-[20px] border border-white/20 bg-white/10 backdrop-blur-md transition hover:-translate-y-1"
          >
            <div className="relative flex h-[180px] items-center justify-center bg-gradient-to-br from-blue-light/30 to-teal/30 text-6xl">
              ❤️
              <div className="absolute bottom-3 left-3 rounded-full bg-amber px-3 py-1 text-[.72rem] font-bold text-white">
                ⭐ FEATURED
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 text-[.72rem] font-semibold text-[#93c5fd]">Cardiology · Editor&apos;s Pick</div>
              <h3 className="font-display text-[1.05rem] font-semibold leading-snug">
                The Silent Heart Attack: 8 Warning Signs Most People Miss
              </h3>
              <div className="mt-2 text-[.78rem] opacity-80">Dr. Sarah Mitchell · 8 min read · May 30, 2026</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Main layout */}
      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-blue">Latest Articles</div>
            <h2 className="font-display mb-6 text-2xl font-bold text-gray-900">Recent Medical Insights</h2>

            <div className="mb-6 flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[.78rem] font-semibold transition",
                    activeFilter === f.key
                      ? "border-blue bg-blue text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue hover:text-blue",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <div className="mb-3 text-4xl">🔍</div>
                <p className="text-[.9rem]">No articles match your search or filter.</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {filtered.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="overflow-hidden rounded-[20px] border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
                  >
                    <div
                      className="relative flex h-[160px] items-center justify-center text-5xl"
                      style={{ background: post.bg }}
                    >
                      {post.emoji}
                      <div
                        className="absolute bottom-3 left-3 rounded-full px-3 py-1 text-[.68rem] font-bold tracking-wide text-white"
                        style={{ background: post.badgeColor }}
                      >
                        {post.category.toUpperCase()}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-1 text-[.72rem] font-bold uppercase" style={{ color: post.labelColor }}>
                        {post.category}
                      </div>
                      <h3 className="font-display mb-2 text-[1rem] font-semibold leading-snug text-gray-900">
                        {post.title}
                      </h3>
                      <p className="mb-3 text-[.82rem] leading-relaxed text-gray-600">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-[.75rem] text-gray-400">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[.6rem] font-bold text-white"
                            style={{ background: "linear-gradient(135deg,#1a56a0,#0891b2)" }}
                          >
                            {post.authorInitials}
                          </div>
                          <span>{post.author}</span>
                        </div>
                        <span>⏱ {post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 text-center">
              <Button>Load More Articles ↓</Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-[20px] bg-gradient-to-br from-blue-dark to-blue p-6 text-white">
              <h4 className="font-display mb-2 text-base font-bold">📬 Weekly Health Digest</h4>
              <p className="mb-4 text-[.78rem] opacity-90">
                Get the week&apos;s best medical articles curated by Dr. Javed Kumbhar, delivered every Monday.
              </p>
              <Input placeholder="Your email address" className="mb-2 border-white/20 bg-white/10 text-white placeholder:text-white/60" />
              <Button variant="white" size="full">
                Subscribe Free →
              </Button>
            </div>

            <div className="rounded-[20px] border border-gray-200 bg-white p-5">
              <h4 className="font-display mb-4 text-base font-bold">Top Author Doctors</h4>
              {[
                ["JK", "Dr. Javed Kumbhar", "Founder · Internal Medicine", "142 articles"],
                ["SM", "Dr. Sarah Mitchell", "Cardiologist", "89 articles"],
                ["PS", "Dr. Priya Sharma", "Endocrinologist", "76 articles"],
              ].map(([init, name, spec, count]) => (
                <div key={name as string} className="mb-3 flex gap-3 border-b border-gray-100 pb-3 last:mb-0 last:border-0 last:pb-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue to-teal text-[.7rem] font-bold text-white">
                    {init}
                  </div>
                  <div>
                    <div className="text-[.82rem] font-bold text-gray-900">{name}</div>
                    <div className="text-[.72rem] text-blue">{spec}</div>
                    <div className="text-[.68rem] text-gray-400">{count}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[20px] border border-gray-200 bg-gray-50 p-5">
              <h4 className="font-display mb-3 text-base font-bold">🩺 Need Medical Advice?</h4>
              <p className="mb-4 text-[.78rem] text-gray-600">
                Reading articles is a great start — but a doctor consultation gives you personalised guidance.
              </p>
              <Button asChild size="full" className="mb-2">
                <Link href="/book-consultation">📅 Book Consultation</Link>
              </Button>
              <Button asChild variant="secondary" size="full">
                <Link href="/ask-doctor">💬 Ask a Doctor Free</Link>
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
