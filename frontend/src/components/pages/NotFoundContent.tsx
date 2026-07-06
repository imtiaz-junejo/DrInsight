"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "@/styles/not-found-page.css";

const QUICK_LINKS = [
  { href: "/", icon: "🏠", bg: "var(--blue-light)", title: "Home Page", sub: "Return to the main page" },
  { href: "/blog", icon: "📰", bg: "#eff6ff", title: "Medical Articles", sub: "Browse doctor-written health guides" },
  { href: "/our-doctors", icon: "👨‍⚕️", bg: "#f0fdf4", title: "Our Doctors", sub: "Meet our verified specialists" },
  { href: "/book-consultation", icon: "📅", bg: "#fffbeb", title: "Book Consultation", sub: "Video, phone, or chat" },
  { href: "/ask-doctor", icon: "❓", bg: "#f5f3ff", title: "Ask a Doctor", sub: "Get expert answers free" },
  { href: "/health-tools", icon: "🔧", bg: "#f0fdff", title: "Health Tools", sub: "BMI, heart risk & more" },
  { href: "/contact", icon: "📞", bg: "#fef2f2", title: "Contact Us", sub: "We're here to help" },
  { href: "/faq", icon: "📋", bg: "#fef9c3", title: "FAQ", sub: "Common questions answered" },
];

const SUGGESTIONS = [
  { label: "Heart failure", term: "Heart failure symptoms" },
  { label: "Type 2 diabetes", term: "Type 2 diabetes guide" },
  { label: "Migraine", term: "Migraine treatment" },
  { label: "Blood pressure", term: "Blood pressure normal range" },
  { label: "Anxiety", term: "Anxiety symptoms" },
];

const EMERGENCY_NUMS = [
  { label: "📞 911 — USA", msg: "Calling 911..." },
  { label: "📞 115 — Pakistan", msg: "Calling 115..." },
  { label: "📞 999 — UK", msg: "Calling 999..." },
  { label: "📞 112 — EU", msg: "Calling 112..." },
];

export function NotFoundContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [errorTime, setErrorTime] = useState("—");
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }, []);

  useEffect(() => {
    const now = new Date();
    setErrorTime(
      `${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    );
    const timer = setTimeout(() => searchRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "h" || e.key === "H") router.push("/");
      if (e.key === "b" || e.key === "B") history.back();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const doSearch = () => {
    const q = search.trim();
    if (!q) {
      showToast("Please enter a search term");
      return;
    }
    showToast(`Searching for: "${q}"...`);
    setTimeout(() => router.push("/blog"), 1200);
  };

  return (
    <div className="not-found-page">
      <main className="error-main">
        <div className="bg-circles">
          <div className="circle c1" />
          <div className="circle c2" />
          <div className="circle c3" />
          <div className="circle c4" />
        </div>

        <div className="error-content">
          <div className="error-badge">⚕️ DrInsight — Page Not Found</div>

          <div className="error-code">
            <div className="code-num">4</div>
            <div className="code-icon">🩺</div>
            <div className="code-num">4</div>
          </div>

          <h1 className="error-title">
            This page seems to have <span>gone missing</span>
          </h1>
          <p className="error-desc">
            The page you are looking for may have been moved, renamed, or no longer exists. Don&apos;t worry — our
            medical team is still here to help you find what you need.
          </p>

          <div className="error-info">
            <div className="ei-pill">
              🔗 <span>{pathname || "/404"}</span>
            </div>
            <div className="ei-pill">
              ⏰ <span>{errorTime}</span>
            </div>
            <div className="ei-pill">🩺 Error Code: 404</div>
          </div>

          <div className="error-search">
            <div className="error-search-wrap">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a condition, article, or doctor..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") doSearch();
                }}
              />
            </div>
            <button type="button" className="search-btn" onClick={doSearch}>
              Search →
            </button>
          </div>

          <div className="search-suggestions">
            <span className="sug-label">Try:</span>
            {SUGGESTIONS.map(({ label, term }) => (
              <button
                key={label}
                type="button"
                className="sug-pill"
                onClick={() => {
                  setSearch(term);
                  searchRef.current?.focus();
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="error-divider">
            <span>or go directly to</span>
          </div>

          <div className="quick-links-title">Popular Destinations</div>
          <div className="quick-links-grid">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="ql-card">
                <div className="ql-icon" style={{ background: link.bg }}>
                  {link.icon}
                </div>
                <div className="ql-info">
                  <strong>{link.title}</strong>
                  <span>{link.sub}</span>
                </div>
                <div className="ql-arrow">→</div>
              </Link>
            ))}
          </div>

          <div className="emergency-box">
            <div className="em-icon">🚨</div>
            <div className="em-text">
              <strong>Medical Emergency? Don&apos;t stay on this page.</strong>
              <p>
                If you or someone else is experiencing a medical emergency, please call emergency services immediately.
                Do not search for medical advice online during an emergency.
              </p>
              <div className="em-nums">
                {EMERGENCY_NUMS.map((num) => (
                  <button key={num.label} type="button" className="em-num" onClick={() => showToast(num.msg)}>
                    {num.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="error-actions">
            <button type="button" className="btn-back" onClick={() => history.back()}>
              ← Go Back
            </button>
            <Link href="/" className="btn-home">
              🏠 Back to Home
            </Link>
            <Link href="/contact" className="btn-report">
              📞 Report Broken Link
            </Link>
          </div>
        </div>
      </main>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
