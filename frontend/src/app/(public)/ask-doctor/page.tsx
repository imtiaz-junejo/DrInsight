"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { BrowseQuestionsSection } from "@/components/ask-doctor/BrowseQuestionsSection";
import { SectionHeading, SectionTitle } from "@/components/public/section-heading";
import { formatStatCount, specialtyEmoji } from "@/lib/data-mappers";
import {
  useAskDoctorCategories,
  useDoctorSpecialties,
  usePlatformStats,
  useSubmitQuestion,
} from "@/services/api-hooks";
import { FAQ_ITEMS, HERO_PILLS } from "./constants";

export default function AskDoctorPage() {
  const [browseCategory, setBrowseCategory] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const qaFeedRef = useRef<HTMLDivElement>(null);

  const { data: stats } = usePlatformStats();
  const { data: categories } = useAskDoctorCategories();
  const { data: specialties } = useDoctorSpecialties();
  const submitQuestion = useSubmitQuestion();

  const formCategories = useMemo(() => {
    const fromQuestions = (categories ?? []).map((c) => c.name);
    const fromSpecialties = (specialties ?? []).map((s) => s.name);
    return Array.from(new Set([...fromQuestions, ...fromSpecialties])).sort();
  }, [categories, specialties]);

  const heroStats = useMemo(
    () => [
      { num: stats ? formatStatCount(stats.answeredQuestions) : "—", label: "Questions Answered" },
      { num: stats ? formatStatCount(stats.doctorCount) : "—", label: "Specialist Doctors" },
      { num: stats ? formatStatCount(stats.pendingQuestions ?? 0) : "—", label: "Awaiting Answers" },
      { num: "100%", label: "Free Service" },
    ],
    [stats],
  );

  const toggleAnon = (checked: boolean) => {
    setAnonymous(checked);
    if (checked) setName("");
  };

  const handleSubmit = async () => {
    if (!category) {
      alert("Please select a medical category.");
      return;
    }
    if (question.trim().length < 20) {
      alert("Please describe your question in more detail (at least 20 characters).");
      return;
    }
    try {
      await submitQuestion.mutateAsync({
        category,
        question: question.trim(),
        name: anonymous ? undefined : name.trim() || undefined,
        isAnonymous: anonymous,
      });
      setSubmitted(true);
    } catch {
      alert("Failed to submit question. Please try again.");
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setName("");
    setEmail("");
    setCategory("");
    setQuestion("");
    setAnonymous(false);
  };

  const toggleFAQ = (index: number) => {
    setOpenFaq((prev) => (prev === index ? -1 : index));
  };

  const scrollToQA = useCallback(() => {
    qaFeedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const selectSpecialtyFilter = useCallback(
    (specialtyName: string) => {
      const match = (categories ?? []).find(
        (c) =>
          c.name.toLowerCase().includes(specialtyName.toLowerCase()) ||
          specialtyName.toLowerCase().includes(c.name.toLowerCase()),
      );
      setBrowseCategory(match?.name ?? specialtyName);
    },
    [categories],
  );

  return (
    <div className="ask-doctor-page">
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow">Free Medical Q&A</div>
          <h1 className="text-4xl font-bold">Ask a Board-Certified Doctor — Free</h1>
          <p>
            Submit your health question and receive a personalised, medically reviewed answer from one of our{" "}
            {stats ? formatStatCount(stats.doctorCount) : "—"} specialist physicians.
          </p>
          <div className="hero-stats">
            {heroStats.map(({ num, label }) => (
              <div key={label} className="hero-stat">
                <strong>{num}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="hero-pills">
            {HERO_PILLS.map((pill) => (
              <div key={pill} className="hero-pill">
                {pill}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="main-wrap">
        <div className="two-col">
          <div ref={qaFeedRef} className="questions-col">
            <BrowseQuestionsSection
              answeredCount={stats?.answeredQuestions}
              activeCategory={browseCategory}
            />
          </div>

          <aside className="sidebar-col" aria-label="Submit your question">
            <div className="ask-form-card bg-gray-200">
              <div className="ask-form-card-header">
                <h3>💬 Submit Your Question</h3>
                <p>
                  Get a free, personalised answer from one of our{" "}
                  {stats ? formatStatCount(stats.doctorCount) : "—"} board-certified specialist doctors.
                </p>
              </div>

              <div className="ask-form-card-body">
                {!submitted ? (
                  <div id="ask-form">
                    <div className="form-group">
                      <label htmlFor="ask-name">Your Name</label>
                      <input
                        type="text"
                        id="ask-name"
                        className="border-gray-300"
                        placeholder={anonymous ? "Submitted anonymously" : "Leave blank to submit anonymously"}
                        value={name}
                        disabled={anonymous}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="ask-email">Email Address</label>
                      <input
                        type="email"
                        id="ask-email"
                        className="border-gray-300"
                        placeholder="For answer notification (optional)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <label className="anon-check">
                      <input
                        type="checkbox"
                        id="ask-anon"
                        checked={anonymous}
                        onChange={(e) => toggleAnon(e.target.checked)}
                      />
                      🔒 Submit anonymously — your name won&apos;t be displayed
                    </label>
                    <div className="form-group">
                      <label htmlFor="ask-cat">Medical Category</label>
                      <select id="ask-cat" className="border-gray-300" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">Select a specialty...</option>
                        {formCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="ask-q">Your Question</label>
                      <textarea
                        id="ask-q"
                        className="border-gray-300"
                        placeholder="Describe your symptoms, health concern, or medical question in as much detail as possible. Include your age, sex, and any relevant medical history..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                      />
                      <div className="char-count">{question.length} / 1000 characters</div>
                    </div>
                    <button
                      type="button"
                      className="submit-btn"
                      onClick={handleSubmit}
                      disabled={submitQuestion.isPending}
                    >
                      {submitQuestion.isPending ? "Submitting..." : "✉️ Submit Question Free"}
                    </button>
                    <div className="disclaimer">
                      ⚠️ This service is for informational purposes only and does not replace professional medical advice,
                      diagnosis, or treatment. For emergencies, call 911.
                    </div>
                  </div>
                ) : (
                  <div className="success-msg" id="success-msg">
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>✅</div>
                    <h4>Question Submitted Successfully!</h4>
                    <p>
                      Our doctors will review your question and respond within 24–48 hours. You&apos;ll receive a
                      notification at your email address.
                    </p>
                    <button type="button" className="success-reset-btn" onClick={resetForm}>
                      Ask Another Question
                    </button>
                  </div>
                )}

                <div className="trust-row">
                  <div className="trust-item">
                    <div>👨‍⚕️</div>
                    <span>Board-certified doctors only</span>
                  </div>
                  <div className="trust-item">
                    <div>🔒</div>
                    <span>Anonymous option</span>
                  </div>
                  <div className="trust-item">
                    <div>⚡</div>
                    <span>24–48h response</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="specialists-strip">
        <div className="specialists-inner">
          <SectionTitle className="!text-3xl text-white" inverse>
            Browse by Medical Specialty
          </SectionTitle>
          <p>Find questions answered by specialists in your area of health concern</p>
          <div className="spec-grid">
            {(specialties ?? []).map((s) => (
              <div
                key={s.name}
                className="spec-item"
                role="button"
                tabIndex={0}
                onClick={() => selectSpecialtyFilter(s.name)}
                onKeyDown={(e) => e.key === "Enter" && selectSpecialtyFilter(s.name)}
              >
                <div className="spec-ico">{specialtyEmoji(s.name)}</div>
                <span>
                  {s.name} ({s.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="faq-section">
        <div className="faq-inner">
          <SectionHeading
            className="faq-header !mb-0"
            eyebrow="Common Questions"
            title="Frequently Asked Questions"
            description="Everything you need to know about our Ask the Doctor service"
            titleClassName="!text-3xl"
          />

          {FAQ_ITEMS.map((item, index) => (
            <div key={item.q} className={`faq-item${openFaq === index ? " open" : ""}`}>
              <button type="button" className="faq-q" onClick={() => toggleFAQ(index)}>
                <h4>{item.q}</h4>
                <div className="faq-chevron">▾</div>
              </button>
              <div className="faq-a">{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="cta-band">
        <SectionHeading
          className="!mb-0"
          eyebrow="Need More Than an Answer?"
          title="Book a Full Doctor Consultation"
          description="For a thorough, personalised evaluation with one of our specialists — video, phone, or chat. Same-day appointments available from $49."
          inverse
          lightEyebrow
          titleClassName="!text-3xl"
        />
        <div className="cta-btns">
          <Link href="/book-consultation" className="btn-white">
            📅 Book a Consultation
          </Link>
          <button type="button" className="btn-ghost" onClick={scrollToQA}>
            💬 Browse All Q&As
          </button>
        </div>
      </div>
    </div>
  );
}
