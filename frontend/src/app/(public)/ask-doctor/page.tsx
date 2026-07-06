"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  doctorFullName,
  formatDate,
  formatStatCount,
  getInitials,
  gradientForId,
  specialtyEmoji,
} from "@/lib/data-mappers";
import {
  useAskDoctorCategories,
  useAskDoctorQuestions,
  useDoctorSpecialties,
  useMarkQuestionHelpful,
  usePlatformStats,
  useSubmitQuestion,
  type AskDoctorQuestion,
} from "@/services/api-hooks";
import { FAQ_ITEMS, HERO_PILLS } from "./constants";

type MappedQA = {
  id: string;
  cat: string;
  catLabel: string;
  searchKeywords: string;
  time: string;
  anonymous?: boolean;
  question: string;
  doctor: {
    initials: string;
    avatarBg: string;
    name: string;
    specialty: string;
  };
  answerHtml: string;
  helpfulCount: number;
  tags: string[];
};

function mapQuestion(q: AskDoctorQuestion): MappedQA {
  const specialty = q.answeredBy?.doctorProfile?.specialty ?? q.category;
  return {
    id: q.id,
    cat: q.category.toLowerCase(),
    catLabel: q.category,
    searchKeywords: `${q.question} ${q.answer ?? ""} ${specialty}`,
    time: formatDate(q.answeredAt ?? q.createdAt),
    anonymous: q.isAnonymous,
    question: q.question,
    doctor: {
      initials: getInitials(q.answeredBy?.firstName, q.answeredBy?.lastName),
      avatarBg: gradientForId(q.id),
      name: q.answeredBy ? doctorFullName(q.answeredBy) : "DrInsight Medical Team",
      specialty,
    },
    answerHtml: q.answer ?? "<p>Our medical team is reviewing this question.</p>",
    helpfulCount: q.helpfulCount ?? 0,
    tags: [q.category],
  };
}

function QACard({
  item,
  helpfulCount,
  onLike,
}: {
  item: MappedQA;
  helpfulCount: number;
  onLike: () => void;
}) {
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      onLike();
    }
  };

  return (
    <div className="qa-card">
      <div className="qa-meta">
        <span className="qa-cat-badge">{item.catLabel}</span>
        <span className="qa-time">{item.time}</span>
        {item.anonymous && <span className="qa-anon">🔒 Anonymous</span>}
        <span className="verified-ans">✓ Verified Answer</span>
      </div>
      <div className="qa-question">{item.question}</div>
      <div className="qa-answer">
        <div className="qa-answer-header">
          <div className="doc-avatar-sm" style={{ background: item.doctor.avatarBg }}>
            {item.doctor.initials}
          </div>
          <div>
            <div className="doc-name-sm">{item.doctor.name}</div>
            <div className="doc-spec-sm">{item.doctor.specialty}</div>
          </div>
        </div>
        <div className="qa-answer-text" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
      </div>
      <div className="qa-footer">
        <div className="qa-helpful">
          Was this helpful?{" "}
          <button type="button" className={liked ? "liked" : ""} onClick={handleLike}>
            👍 Helpful ({helpfulCount})
          </button>
        </div>
        <div className="qa-tags">
          {item.tags.map((tag) => (
            <span key={tag} className="qa-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AskDoctorPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const qaFeedRef = useRef<HTMLDivElement>(null);

  const { data: stats } = usePlatformStats();
  const { data: questionsData, isLoading } = useAskDoctorQuestions({ limit: 50 });
  const { data: categories } = useAskDoctorCategories();
  const { data: specialties } = useDoctorSpecialties();
  const submitQuestion = useSubmitQuestion();
  const markHelpful = useMarkQuestionHelpful();

  const qaItems = useMemo(
    () => (questionsData?.data ?? []).map(mapQuestion),
    [questionsData],
  );

  const categoryFilters = useMemo(
    () => [
      { val: "all", label: "All Categories" },
      ...(categories ?? []).map((c) => ({
        val: c.name.toLowerCase(),
        label: `${c.name} (${c.count})`,
      })),
    ],
    [categories],
  );

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
      { num: stats ? formatStatCount(stats.specialtyCount ?? 0) : "—", label: "Specialties" },
    ],
    [stats],
  );

  const filteredQA = useMemo(() => {
    const q = search.toLowerCase().trim();
    return qaItems.filter((item) => {
      const catMatch = activeFilter === "all" || item.cat.includes(activeFilter);
      const text = `${item.searchKeywords} ${item.question}`.toLowerCase();
      const textMatch = !q || text.includes(q);
      return catMatch && textMatch;
    });
  }, [search, activeFilter, qaItems]);

  const incrementHelpful = useCallback(
    (id: string, current: number) => {
      if (helpfulCounts[id] !== undefined && helpfulCounts[id] > current) return;
      markHelpful.mutate(id, {
        onSuccess: (data) => {
          setHelpfulCounts((prev) => ({ ...prev, [id]: data.helpfulCount }));
        },
      });
    },
    [helpfulCounts, markHelpful],
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

  const scrollToQA = () => {
    qaFeedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="ask-doctor-page">
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="eyebrow">Free Medical Q&A</div>
          <h1>Ask a Board-Certified Doctor — Free</h1>
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
          <div>
            <div className="section-eyebrow">Browse Questions</div>
            <div className="section-title">Featured Answered Questions</div>
            <div className="section-sub">
              Browse {stats ? formatStatCount(stats.answeredQuestions) : "—"} questions answered by our specialist doctors. Use the search and filters to find answers
              relevant to you.
            </div>

            <div className="search-bar">
              <input
                type="text"
                placeholder="Search questions by symptom, condition, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="button">🔍 Search</button>
            </div>

            <div className="cat-filters">
              {categoryFilters.map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  className={`cat-pill${activeFilter === val ? " active" : ""}`}
                  onClick={() => setActiveFilter(val)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div id="qa-feed" ref={qaFeedRef}>
              {isLoading ? (
                <p style={{ textAlign: "center", color: "var(--gray-500)", padding: "24px 0" }}>Loading questions...</p>
              ) : filteredQA.length > 0 ? (
                filteredQA.map((item) => (
                  <QACard
                    key={item.id}
                    item={item}
                    helpfulCount={helpfulCounts[item.id] ?? item.helpfulCount}
                    onLike={() => incrementHelpful(item.id, item.helpfulCount)}
                  />
                ))
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <p>No questions match your search. Try different keywords or browse a category.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="ask-form-card">
              <h3>💬 Submit Your Question</h3>
              <p>
                Get a free, personalised answer from one of our {stats ? formatStatCount(stats.doctorCount) : "—"} board-certified specialist doctors.
              </p>

              {!submitted ? (
                <div id="ask-form">
                  <div className="form-group">
                    <label htmlFor="ask-name">Your Name</label>
                    <input
                      type="text"
                      id="ask-name"
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
                    <select id="ask-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
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
        </div>
      </div>

      <div className="specialists-strip">
        <div className="specialists-inner">
          <h2>Browse by Medical Specialty</h2>
          <p>Find questions answered by specialists in your area of health concern</p>
          <div className="spec-grid">
            {(specialties ?? []).map((s) => (
              <div
                key={s.name}
                className="spec-item"
                role="button"
                tabIndex={0}
                onClick={() => setActiveFilter(s.name.toLowerCase())}
                onKeyDown={(e) => e.key === "Enter" && setActiveFilter(s.name.toLowerCase())}
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
          <div className="faq-header">
            <div className="section-eyebrow">Common Questions</div>
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about our Ask the Doctor service</p>
          </div>

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
        <div className="eyebrow">Need More Than an Answer?</div>
        <h2>Book a Full Doctor Consultation</h2>
        <p>
          For a thorough, personalised evaluation with one of our specialists — video, phone, or chat. Same-day
          appointments available from $49.
        </p>
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
