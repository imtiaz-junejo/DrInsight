"use client";

import { useState } from "react";
import { formatStatCount } from "@/lib/data-mappers";
import { useNewsletterSubscribe, usePlatformStats } from "@/services/api-hooks";

export function HomeStayInformedSection() {
  const { data: stats } = usePlatformStats();
  const newsletter = useNewsletterSubscribe();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const readerCount = stats
    ? formatStatCount(stats.newsletterCount ?? stats.patientCount)
    : "50,000+";

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    try {
      await newsletter.mutateAsync(newsletterEmail.trim());
      setNewsletterMsg("Subscribed successfully!");
      setNewsletterEmail("");
    } catch {
      setNewsletterMsg("Subscription failed. Please try again.");
    }
  };

  return (
    <section className="home-section bg-[#F9FAFB] px-6 py-[72px] min-[901px]:py-[88px]">
      <div className="mx-auto max-w-[1240px] text-center">
        <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-[0.14em] text-blue">
          Stay Informed
        </div>
        <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.35rem)] font-bold leading-[1.2] text-[#1E293B]">
          Get Expert Health Insights Weekly
        </h2>
        <p className="mx-auto mt-4 max-w-[620px] text-[.98rem] leading-[1.65] text-[#4B5563]">
          Join {readerCount} readers receiving our weekly newsletter — curated medical articles,
          health tips, and tool updates from our doctors.
        </p>

        <form
          className="home-stay-informed-form mx-auto mt-9 flex max-w-[520px] items-stretch justify-center gap-3"
          onSubmit={handleNewsletter}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            className="h-[46px] min-w-0 flex-1 rounded-lg border border-[#D1D5DB] bg-white px-4 text-[.9rem] text-gray-900 placeholder:text-[#9CA3AF] focus:border-blue focus:outline-none focus:ring-[3px] focus:ring-blue/10"
            required
          />
          <button
            type="submit"
            disabled={newsletter.isPending}
            className="h-[46px] shrink-0 rounded-lg bg-[#215899] px-6 text-[.9rem] font-semibold text-white transition hover:bg-[#1a4a82] disabled:opacity-60"
          >
            {newsletter.isPending ? "..." : "Subscribe Free"}
          </button>
        </form>

        {newsletterMsg && (
          <p className="mt-3 text-[.8rem] text-[#4B5563]" role="status">
            {newsletterMsg}
          </p>
        )}

        <p className="mt-4 text-[.78rem] leading-relaxed text-[#4B5563]">
          <span aria-hidden="true">🔒 </span>
          No spam. Unsubscribe at any time. We respect your privacy under GDPR &amp; HIPAA guidelines.
        </p>
      </div>
    </section>
  );
}
