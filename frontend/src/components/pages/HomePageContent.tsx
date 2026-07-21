"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  formatStatCount,
  getInitials,
  gradientForId,
  mapBlogPostToCard,
} from "@/lib/data-mappers";
import { HomeHealthToolsSection } from "@/components/pages/home/HomeHealthToolsSection";
import { HomeResearchPublicationsSection } from "@/components/pages/home/HomeResearchPublicationsSection";
import { HomeSpecialtiesSection } from "@/components/pages/home/HomeSpecialtiesSection";
import {
  useDoctorSpecialties,
  useFeaturedBlogPosts,
  useNewsletterSubscribe,
  usePlatformStats,
  useRecentReviews,
} from "@/services/api-hooks";
import { usePublicHomepageSections, type HomepageSectionConfig } from "@/services/cms-api-hooks";

function sectionConfig(
  sections: Array<{ slug: string; config?: HomepageSectionConfig | null }>,
  slug: string,
): HomepageSectionConfig {
  const section = sections.find((s) => s.slug === slug);
  return (section?.config ?? {}) as HomepageSectionConfig;
}

export function HomePageContent() {
  const { data: stats } = usePlatformStats();
  const { data: homepageSections = [] } = usePublicHomepageSections();
  const heroSection = homepageSections.find((s) => s.slug === "hero-banner");
  const heroConfig = (heroSection?.config ?? {}) as HomepageSectionConfig;
  const heroButtons = sectionConfig(homepageSections, "hero-buttons");
  const { data: blogData, isLoading: blogLoading } = useFeaturedBlogPosts(3);
  const { data: reviews, isLoading: reviewsLoading } = useRecentReviews(4);
  const { data: specialties } = useDoctorSpecialties();
  const newsletter = useNewsletterSubscribe();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const blogPosts = blogData?.data.map(mapBlogPostToCard) ?? [];

  const heroStats = [
    [stats ? formatStatCount(stats.patientsServed ?? stats.patientCount) : "—", "Patients Served"],
    [stats ? formatStatCount(stats.doctorCount) : "—", "Specialist Doctors"],
    [stats ? `${stats.averageRating.toFixed(1)}★` : "—", "Avg. Rating"],
  ];

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
    <>
      <section className="home-section home-hero-section hero-pattern relative overflow-hidden bg-gradient-to-br from-blue-dark via-blue to-teal px-6 text-white">
        <div className="home-hero-inner relative mx-auto grid max-w-[1240px] items-center gap-6 min-[901px]:grid-cols-2 min-[901px]:gap-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1 text-[.75rem] font-semibold tracking-wide backdrop-blur-sm">
              <span>{heroConfig.icon ?? "🏥"}</span>{" "}
              {heroConfig.subtitle ??
                `TRUSTED BY ${stats ? formatStatCount(stats.patientsServed ?? stats.patientCount) : "—"} PATIENTS WORLDWIDE`}
            </div>
            <h1 className="font-display text-[clamp(1.75rem,3.2vw,2.65rem)] font-bold leading-[1.15]">
              {heroConfig.headline ? (
                <span dangerouslySetInnerHTML={{ __html: heroConfig.headline }} />
              ) : (
                <>
                  Your Trusted Partner in <span className="text-[#93c5fd]">Medical Excellence</span> & Health
                </>
              )}
            </h1>
            <p className="mt-4 max-w-[480px] text-[clamp(0.9rem,1.6vw,1rem)] leading-relaxed opacity-90">
              {heroConfig.description ??
                "Evidence-based medical information, AI-powered health tools, and expert doctor consultations — all in one trusted platform. Reviewed by licensed physicians."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {(heroButtons.buttons ?? [
                { label: "📅 Book a Consultation", href: "/book-consultation", variant: "white" },
                { label: "💬 Ask a Doctor", href: "/ask-doctor", variant: "outline" },
              ]).map((btn) => (
                <Button key={btn.href} variant={btn.variant === "outline" ? "outline" : "white"} asChild>
                  <Link href={btn.href}>{btn.label}</Link>
                </Button>
              ))}
            </div>
            <div className="home-hero-badges mt-5">
              {(heroConfig.badges ?? [
                "Board-certified doctors",
                "Medically reviewed content",
                "HIPAA compliant",
                "24/7 support",
              ]).map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-[.8rem] opacity-85">
                    ✅ <span>{item}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="home-hero-visual hidden flex-col gap-3 min-[901px]:flex">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["🩺", "Expert Doctors", `${stats ? formatStatCount(stats.doctorCount) : "—"} specialists across all major fields`],
                ["🔬", "Health Tools", `${homepageSections.length ? "Free" : "—"} medical calculators`],
                ["💊", "Medical Blog", `${stats ? formatStatCount(stats.blogCount) : "—"} reviewed articles`],
                ["🛡️", "Privacy First", "HIPAA & GDPR compliant"],
              ].map(([icon, title, desc]) => (
                <div
                  key={title as string}
                  className="rounded-2xl border border-white/20 bg-white/12 p-4 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/18"
                >
                  <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-xl">
                    {icon}
                  </div>
                  <h3 className="text-[.95rem] font-semibold">{title}</h3>
                  <p className="text-[.78rem] leading-snug opacity-80">{desc}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {heroStats.map(([num, label]) => (
                <div
                  key={label as string}
                  className="rounded-xl border border-white/15 bg-white/10 p-3 text-center"
                >
                  <strong className="font-display block text-xl font-bold">{num}</strong>
                  <span className="text-[.7rem] opacity-80">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="px-6 pb-2">
        <div className="relative z-10 mx-auto mt-8 flex max-w-[1240px] flex-wrap items-center gap-3.5 rounded-xl border-[1.5px] border-[#fecaca] bg-gray-100 p-4 min-[901px]:p-5">
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <strong className="text-red">Medical Emergency? Call 911 immediately.</strong>
            <p className="text-[.85rem] text-gray-600">
              For non-emergency medical queries, use our Ask the Doctor feature. Available 24/7.
            </p>
          </div>
          <Button asChild className="w-auto whitespace-nowrap">
            <Link href="/ask-doctor">Get Help Now →</Link>
          </Button>
        </div>
      </div>

      <HomeSpecialtiesSection />

      <HomeHealthToolsSection />

      <section className="home-section px-6 py-16 min-[901px]:py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-13 text-center">
            <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">Medical Blog</div>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-tight text-gray-900">
              Latest Health Insights from Our Doctors
            </h2>
            <p className="mx-auto mt-3.5 max-w-[600px] text-[.98rem] text-gray-600">
              Evidence-based articles written and reviewed by board-certified physicians. Stay
              informed, stay healthy.
            </p>
          </div>
          {blogLoading ? (
            <p className="text-center text-gray-500">Loading articles...</p>
          ) : blogPosts.length > 0 ? (
            <div className="grid  grid-cols-[repeat(auto-fill,minmax(300px,1fr))]  gap-7">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="overflow-hidden rounded-[20px] border border-gray-200 bg-gray-300 transition hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]"
                >
                  <div className="relative flex h-[180px] items-center justify-center bg-gradient-to-br from-gray-dark to-[#dbeafe] text-5xl">
                    {post.emoji}
                    <div className="absolute bottom-3 left-3 rounded-full bg-blue px-3 py-1 text-[.72rem] font-bold tracking-wide text-white">
                      {post.cat}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="mb-2.5 flex items-center gap-3 text-[.78rem] text-gray-400">
                      <span>{post.author}</span>·<span>{post.read}</span>·<span>{post.date}</span>
                    </div>
                    <h3 className="font-display mb-2 text-[1.05rem] font-semibold leading-snug text-gray-900">
                      {post.title}
                    </h3>
                    <p className="text-[.83rem] leading-relaxed text-gray-600">{post.excerpt}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[.82rem] font-semibold text-blue">
                      Read More →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No articles published yet.</p>
          )}
          <div className="mt-8 text-center">
            <Button asChild className="inline-flex w-auto">
              <Link href="/blog">View All Articles →</Link>
            </Button>
          </div>
        </div>
      </section>

      <HomeResearchPublicationsSection />

      <section className="home-section bg-gradient-to-br from-[#f0f7ff] to-[#e8f4fd] px-6 py-16 min-[901px]:py-20">
        <div className="home-ask-inner mx-auto grid max-w-[1240px] items-center gap-10 min-[901px]:grid-cols-2 min-[901px]:gap-[60px]">
          <div>
            <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">Ask the Doctor</div>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.3rem)] font-bold leading-tight text-gray-900">
              Get Expert Medical Answers to Your Questions
            </h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              Have a health concern? Submit your question to our panel of board-certified
              specialists and receive a medically reviewed, personalized answer — free of charge.
            </p>
            <div className="my-7 flex flex-col gap-3.5">
              {[
                ["👨‍⚕️", "Answers from board-certified specialists"],
                ["🔒", "Anonymous submissions available"],
                ["⚡", "Typical response within 24–48 hours"],
                ["📚", `Browse ${stats ? formatStatCount(stats.answeredQuestions) : "—"} previously answered questions`],
              ].map(([icon, text]) => (
                <div key={text as string} className="flex items-center gap-3 text-[.9rem] text-gray-700">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-light text-sm">
                    {icon}
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <Button asChild className="inline-flex w-auto">
              <Link href="/ask-doctor">Browse All Questions →</Link>
            </Button>
          </div>
          <div className="rounded-[20px] border border-gray-400 bg-white p-8 shadow-[var(--shadow-lg)]">
            <h3 className="font-display text-[1.3rem] font-bold">Ask Your Question</h3>
            <p className="mb-5 text-[.85rem] text-gray-600">
              Get a free answer from one of our {stats ? formatStatCount(stats.doctorCount) : "—"} specialist doctors
            </p>
            <form action="/ask-doctor" className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">
                  Your Name (optional)
                </label>
                <input
                  className="w-full rounded-lg border-[1.5px] border-gray-300 px-3.5 py-2.5 text-[.88rem] focus:border-blue focus:outline-none focus:ring-[3px] focus:ring-blue/10"
                  placeholder="Leave blank to submit anonymously"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Medical Category</label>
                <select className="w-full rounded-lg border-[1.5px] border-gray-300 px-3.5 py-2.5 text-[.88rem] focus:border-blue focus:outline-none" defaultValue="">
                  <option value="" disabled>
                    Select a category...
                  </option>
                  {(specialties ?? []).map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[.82rem] font-semibold text-gray-700">Your Question</label>
                <textarea
                  className="min-h-[90px] w-full resize-y rounded-lg border-[1.5px] border-gray-300 px-3.5 py-2.5 text-[.88rem] focus:border-blue focus:outline-none"
                  placeholder="Describe your symptoms or health concern in detail..."
                />
              </div>
              <Button type="submit" size="full">
                Submit Question ✉️
              </Button>
              <div className="rounded border-l-4 border-amber bg-[#fffbeb] p-3 text-[.78rem] leading-relaxed text-[#92400e]">
                ⚠️ This service is for informational purposes only and does not replace professional
                medical advice, diagnosis, or treatment.
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="home-section bg-gradient-to-br from-blue-dark to-blue px-6 py-16 text-center text-white min-[901px]:py-20">
        <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-[#93c5fd]">
          Virtual & In-Person Consultations
        </div>
        <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold">Talk to a Doctor Today</h2>
        <p className="mx-auto mb-8 mt-4 max-w-[540px] text-base opacity-88">
          Book a video, phone, or chat consultation with a specialist from the comfort of your home.
          Same-day appointments available.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="white" asChild>
            <Link href="/book-consultation">Book a Consultation →</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">📞 Call Us</Link>
          </Button>
        </div>
        <div className="mt-9 flex flex-wrap justify-center gap-8">
          {["📹 Video Consultation", "📞 Phone Consultation", "💬 Chat Consultation"].map((item) => (
            <div key={item} className="flex items-center gap-2.5 text-[.88rem] opacity-85">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="home-section px-6 py-16 min-[901px]:py-20">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-13 text-center">
            <div className="mb-2.5 text-[.78rem] font-bold uppercase tracking-widest text-blue">Patient Stories</div>
            <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] font-bold leading-tight text-gray-900">
              Trusted by Hundreds of Thousands
            </h2>
            <p className="mx-auto mt-3.5 max-w-[600px] text-[.98rem] text-gray-600">
              Real experiences from patients who found clarity, care, and confidence through DrInsight.
            </p>
          </div>
          {reviewsLoading ? (
            <p className="text-center text-gray-500">Loading reviews...</p>
          ) : reviews && reviews.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
              {reviews.map((r) => {
                const patient = r.patient?.user;
                const initials = getInitials(patient?.firstName, patient?.lastName);
                const name = patient
                  ? `${patient.firstName} ${patient.lastName?.[0] ?? ""}.`
                  : "Verified Patient";
                const role = r.doctor?.specialty
                  ? `${r.doctor.specialty} Patient`
                  : "Patient";
                return (
                  <div
                    key={r.id}
                    className="rounded-[20px] border-[1.5px] border-gray-400 bg-gray-100 p-7 shadow-lg"
                  >
                    <div className="mb-3.5 text-base text-amber">{"★".repeat(r.rating)}</div>
                    <p className="mb-4 text-[.88rem] italic leading-relaxed text-gray-600">
                      &ldquo;{r.comment || "Excellent consultation experience."}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-[42px] w-[42px] items-center justify-center rounded-full text-base font-bold text-white"
                        style={{ background: gradientForId(r.id) }}
                      >
                        {initials}
                      </div>
                      <div>
                        <strong className="block text-[.88rem] font-semibold">{name}</strong>
                        <span className="text-[.78rem] text-gray-400">{role}</span>
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[.72rem] font-semibold text-green">
                          ✓ Verified Patient
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">No patient reviews yet.</p>
          )}
        </div>
      </section>

      <section className="home-section border-t border-gray-200 bg-gray-50 px-6 py-16 min-[901px]:py-20">
        <div className="mx-auto max-w-[600px] text-center">
          <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-bold">Stay Informed, Stay Healthy</h2>
          <p className="my-3 text-gray-600">
            Subscribe to our newsletter for weekly health tips from board-certified physicians.
          </p>
          <form className="home-newsletter-form mx-auto flex max-w-[440px] flex-row gap-2.5 max-[640px]:flex-col" onSubmit={handleNewsletter}>
            <input
              type="email"
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="flex-1 rounded-[10px] border-[1.5px] border-gray-400 px-4 py-3 text-[.9rem] focus:border-blue focus:outline-none"
              required
            />
            <Button type="submit" className="whitespace-nowrap" disabled={newsletter.isPending}>
              {newsletter.isPending ? "..." : "Subscribe"}
            </Button>
          </form>
          {newsletterMsg && <p className="mt-2 text-[.8rem] text-gray-600">{newsletterMsg}</p>}
          <p className="mt-3 text-[.76rem] text-gray-400">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <div className="bg-blue-dark px-6 py-10 text-white">
        <div className="mx-auto grid max-w-[1240px] grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {[
            ["/health-tools#bmi", "⚖️", "BMI Calculator"],
            ["/ask-doctor", "💬", "Ask a Doctor"],
            ["/book-consultation", "📅", "Book Appointment"],
            ["/health-tools#pregnancy", "🤰", "Pregnancy Calculator"],
            ["/health-tools#diabetes", "🩸", "Diabetes Risk"],
            ["/blog", "📰", "Medical Blog"],
            ["/contact", "📞", "Contact Us"],
          ].map(([href, icon, label]) => (
            <Link
              key={label as string}
              href={href as string}
              className="cursor-pointer rounded-[10px] border border-white/12 bg-white/8 p-4 text-center transition hover:-translate-y-0.5 hover:bg-white/16"
            >
              <div className="mb-1.5 text-2xl">{icon}</div>
              <span className="text-[.8rem] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
