"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import "@/styles/doctors-page.css";
import {
  AVAIL_FILTERS,
  COUNTRY_FILTERS,
  DOCTORS,
  HERO_STATS,
  SPECIALTY_FILTERS,
  type Doctor,
} from "./doctors";

type FilterGroup = "spec" | "country" | "avail";
type ActiveFilters = Record<FilterGroup, string>;

function DoctorCard({
  doctor,
  onProfile,
  onBook,
}: {
  doctor: Doctor;
  onProfile: (init: string) => void;
  onBook: (name: string) => void;
}) {
  return (
    <div className="doc-card" onClick={() => onProfile(doctor.init)} role="button" tabIndex={0}>
      <div className="doc-cover" style={{ background: doctor.bg }}>
        <div className="doc-rating-badge">
          ⭐ {doctor.rating.toFixed(1)}{" "}
          <span className="review-count">({doctor.reviews})</span>
        </div>
        <div className="doc-av-wrap">
          <div className="doc-av" style={{ background: doctor.bg }}>
            {doctor.init}
            {doctor.online && <div className="doc-online" />}
          </div>
        </div>
      </div>
      <div className="doc-body">
        <div className="doc-name">{doctor.name}</div>
        <div className="doc-spec">{doctor.specLabel}</div>
        <div className="doc-meta-row">
          <span className="icon">🎓</span>
          {doctor.cred}
        </div>
        <div className="doc-meta-row">
          <span className="icon">🏥</span>
          {doctor.inst}
        </div>
        <div className="doc-meta-row">
          <span className="icon">📍</span>
          {doctor.countryLabel}
        </div>
        <div className="doc-meta-row">
          <span className="icon">⏱️</span>
          {doctor.exp}+ years experience
        </div>
        <div className="doc-tags">
          {doctor.tags.map((tag) => (
            <span key={tag} className="doc-tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="doc-stats-row">
          <div className="doc-stat">
            <strong>{doctor.articles}</strong>
            <span>Articles</span>
          </div>
          <div className="doc-stat">
            <strong>{doctor.reviews}</strong>
            <span>Reviews</span>
          </div>
          <div className="doc-stat">
            <strong>{doctor.online ? "🟢 Online" : "⚫ Offline"}</strong>
            <span>Status</span>
          </div>
        </div>
        <div className="doc-cta-row">
          <button
            type="button"
            className="doc-btn outline"
            onClick={(e) => {
              e.stopPropagation();
              onProfile(doctor.init);
            }}
          >
            View Profile
          </button>
          <button
            type="button"
            className="doc-btn primary"
            onClick={(e) => {
              e.stopPropagation();
              onBook(doctor.name);
            }}
          >
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    spec: "all",
    country: "all",
    avail: "all",
  });
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2400);
  }, []);

  const setFilter = (group: FilterGroup, val: string) => {
    setActiveFilters((prev) => ({ ...prev, [group]: val }));
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    let list = DOCTORS.filter((d) => {
      if (activeFilters.spec !== "all" && d.spec !== activeFilters.spec) return false;
      if (activeFilters.country !== "all" && d.country !== activeFilters.country) return false;
      if (activeFilters.avail === "online" && !d.online) return false;
      if (activeFilters.avail === "rating4plus" && d.rating < 4.5) return false;
      if (q) {
        const hay = `${d.name} ${d.specLabel} ${d.cred} ${d.inst} ${d.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "experience") return b.exp - a.exp;
      if (sort === "reviews") return b.reviews - a.reviews;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [search, sort, activeFilters]);

  return (
    <div className="doctors-page">
      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <Link href="/">🏠 Home</Link>
          <span>›</span>
          <span className="current">Our Doctors</span>
        </div>
      </div>

      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-eyebrow">👨‍⚕️ MEET THE EXPERTS</div>
          <h1>
            Our Medical <span>Team</span>
          </h1>
          <p>
            Every article, consultation, and answer on MedAuthority comes from a verified, board-certified
            physician. Search our network of specialists by name, specialty, country, or rating.
          </p>
          <div className="stats-strip">
            {HERO_STATS.map(({ num, label }) => (
              <div key={label} className="stat-box">
                <div className="stat-num">{num}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-inner">
          <div className="search-row">
            <div className="search-wrap">
              <input
                type="text"
                className="search-input"
                placeholder="Search by doctor name, specialty, or condition..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="rating">Sort: Highest Rated</option>
              <option value="experience">Sort: Most Experienced</option>
              <option value="reviews">Sort: Most Reviewed</option>
              <option value="name">Sort: Name (A–Z)</option>
            </select>
            <div className="results-count">
              Showing <strong>{filtered.length}</strong> of <strong>{DOCTORS.length}</strong> doctors
            </div>
          </div>
          <div className="filter-groups">
            <div className="filter-group">
              <div className="filter-group-label">Specialty</div>
              <div className="filter-pills">
                {SPECIALTY_FILTERS.map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    className={`f-pill${activeFilters.spec === val ? " on" : ""}`}
                    onClick={() => setFilter("spec", val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-group-label">Country</div>
              <div className="filter-pills">
                {COUNTRY_FILTERS.map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    className={`f-pill${activeFilters.country === val ? " on" : ""}`}
                    onClick={() => setFilter("country", val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <div className="filter-group-label">Availability</div>
              <div className="filter-pills">
                {AVAIL_FILTERS.map(({ val, label }) => (
                  <button
                    key={val}
                    type="button"
                    className={`f-pill${activeFilters.avail === val ? " on" : ""}`}
                    onClick={() => setFilter("avail", val)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-section">
        {filtered.length > 0 && (
          <div className="doc-grid">
            {filtered.map((doctor) => (
              <DoctorCard
                key={doctor.init}
                doctor={doctor}
                onProfile={(init) => showToast(`Opening profile for ${init}...`)}
                onBook={(name) => showToast(`Opening booking form for ${name}...`)}
              />
            ))}
          </div>
        )}

        <div className={`no-results${filtered.length === 0 ? " show" : ""}`}>
          <div className="nr-icon">🔍</div>
          <h3>No doctors found</h3>
          <p>Try adjusting your search or filters to find the right specialist.</p>
        </div>

        <div className="join-cta">
          <h3>✍️ Are You a Licensed Physician?</h3>
          <p>
            Join our network of 200+ verified medical professionals. Write articles, answer patient questions,
            offer consultations, and reach 500,000+ readers every month.
          </p>
          <div className="join-btns">
            <button type="button" className="btn-join-w" onClick={() => showToast("Opening application form...")}>
              Apply to Join →
            </button>
            <Link href="/contact" className="btn-join-o">
              📋 View Author Guidelines
            </Link>
          </div>
        </div>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
