"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const faqs = [
  {
    cat: "General",
    q: "What is DrInsight?",
    a: "DrInsight is a trusted digital health platform offering evidence-based medical articles, free health tools, Ask the Doctor Q&A, and virtual consultations with board-certified physicians.",
  },
  {
    cat: "General",
    q: "Is DrInsight free to use?",
    a: "Creating an account, reading articles, using health tools, and submitting Ask the Doctor questions are free. Consultations with specialists have a transparent fee displayed before booking.",
  },
  {
    cat: "Consultations",
    q: "How do I book a consultation?",
    a: "Visit the Book Consultation page, choose your preferred consultation type (video, phone, or chat), select an available time slot, and confirm your booking. You'll receive email confirmation with joining instructions.",
  },
  {
    cat: "Consultations",
    q: "Are consultations covered by insurance?",
    a: "DrInsight consultations are typically paid out-of-pocket. We provide detailed receipts that you may submit to your insurance provider for possible reimbursement, depending on your plan.",
  },
  {
    cat: "Privacy",
    q: "Is my health data secure?",
    a: "Yes. DrInsight is HIPAA and GDPR compliant. All data is encrypted with 256-bit SSL, and we never sell or share your personal or medical information with third parties.",
  },
  {
    cat: "Privacy",
    q: "Can I submit questions anonymously?",
    a: "Yes. When using Ask the Doctor, you can leave the name field blank to submit your question anonymously. Your identity is never shared publicly.",
  },
  {
    cat: "Doctors",
    q: "How are doctors verified on DrInsight?",
    a: "All physicians undergo credential verification including medical license validation, board certification checks, and background review before they can consult, publish, or answer patient questions.",
  },
  {
    cat: "Doctors",
    q: "Can I choose a specific doctor?",
    a: "Yes. Browse our Doctors Directory to filter by specialty, country, and availability, then book directly with your preferred specialist.",
  },
];

const categories = ["All", "General", "Consultations", "Privacy", "Doctors"];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = faqs.filter((f) => {
    const matchCat = category === "All" || f.cat === category;
    const q = search.toLowerCase();
    const matchSearch = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <>
      <Breadcrumb items={[{ label: "FAQ" }]} />

      <section className="bg-gradient-to-br from-blue-dark via-blue to-teal px-6 py-14 text-center text-white">
        <div className="mx-auto max-w-[700px]">
          <div className="mb-2 text-[.72rem] font-bold uppercase tracking-widest text-[#93c5fd]">
            Frequently Asked Questions
          </div>
          <h1 className="font-display text-[clamp(1.8rem,3.5vw,2.5rem)] font-bold">How Can We Help?</h1>
          <p className="mt-3 text-[.95rem] opacity-90">
            Find answers to common questions about DrInsight services, consultations, and your health data.
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search FAQs..."
              className="border-white/20 bg-white/10 text-white placeholder:text-white/60"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[800px] px-6 py-12">
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-[.78rem] font-semibold transition",
                category === cat
                  ? "border-blue bg-blue text-white"
                  : "border-gray-200 text-gray-600 hover:border-blue hover:text-blue",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <div key={faq.q} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="pr-4 text-[.9rem] font-semibold text-gray-900">{faq.q}</span>
                <span className="shrink-0 text-blue">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="border-t border-gray-100 px-5 py-4 text-[.88rem] leading-relaxed text-gray-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[20px] bg-blue-light p-8 text-center">
          <h3 className="font-display mb-2 text-xl font-bold text-gray-900">Still have questions?</h3>
          <p className="mb-5 text-[.88rem] text-gray-600">Our support team is available Mon–Sat to help you.</p>
          <Button asChild>
            <Link href="/contact">Contact Support →</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
