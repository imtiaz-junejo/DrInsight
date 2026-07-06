"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/styles/doctors-page.css";
import { formatCurrency, formatStatCount, mapDoctorProfile, specialtyEmoji } from "@/lib/data-mappers";
import type { MappedDoctorCard } from "@/lib/data-mappers";
import { useDoctors, useDoctorSpecialties, usePlatformStats } from "@/services/api-hooks";

type FilterGroup = "spec" | "country";
type ActiveFilters = Record<FilterGroup, string>;

function DoctorCard({
  doctor,
  onProfile,
  onBook,
}: {
  doctor: MappedDoctorCard;
  onProfile: (id: string) => void;
  onBook: (id: string) => void;
}) {
  return (
    <div className="doc-card" onClick={() => onProfile(doctor.id)} role="button" tabIndex={0}>
      <div className="doc-cover" style={{ background: doctor.bg }}>
        <div className="doc-rating-badge">
          ⭐ {doctor.rating.toFixed(1)}{" "}
          <span className="review-count">({doctor.reviews})</span>
        </div>
        {doctor.verified && <div className="doc-verified-badge">✓ Verified</div>}
        <div className="doc-av-wrap">
          <div className="doc-av" style={{ background: doctor.bg }}>
            {doctor.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doctor.avatarUrl} alt={doctor.name} className="doc-av-img" />
            ) : (
              doctor.init
            )}
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
        <div className="doc-meta-row">
          <span className="icon">💰</span>
          {formatCurrency(doctor.fee)} consultation
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
            <strong>{doctor.online ? "🟢 Available" : doctor.available ? "🟡 Busy" : "⚫ Offline"}</strong>
            <span>Status</span>
          </div>
        </div>
        <div className="doc-cta-row">
          <button
            type="button"
            className="doc-btn outline"
            onClick={(e) => {
              e.stopPropagation();
              onProfile(doctor.id);
            }}
          >
            View Profile
          </button>
          <button
            type="button"
            className="doc-btn primary"
            onClick={(e) => {
              e.stopPropagation();
              onBook(doctor.id);
            }}
          >
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterDropdown({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { val: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.val === value)?.label ?? options[0]?.label ?? "";

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div className={`filter-dropdown${open ? " open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="filter-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="filter-dropdown-label">{selectedLabel}</span>
        <span className="filter-dropdown-chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul className="filter-dropdown-menu" role="listbox" aria-label={ariaLabel}>
          {options.map(({ val, label }) => (
            <li key={val} role="option" aria-selected={value === val}>
              <button
                type="button"
                className={`filter-dropdown-option${value === val ? " selected" : ""}`}
                onClick={() => handleSelect(val)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AvailabilityCheckboxes({
  onlineNow,
  rating4Plus,
  onOnlineChange,
  onRatingChange,
}: {
  onlineNow: boolean;
  rating4Plus: boolean;
  onOnlineChange: (checked: boolean) => void;
  onRatingChange: (checked: boolean) => void;
}) {
  return (
    <div className="avail-filters" role="group" aria-label="Availability">
      <label className="avail-checkbox">
        <input
          type="checkbox"
          checked={onlineNow}
          onChange={(e) => onOnlineChange(e.target.checked)}
        
        />
        <span className="avail-checkbox-box" aria-hidden="true" />
        <span className="avail-checkbox-label">Online Now</span>
      </label>
      <label className="avail-checkbox">
        <input
          type="checkbox"
          checked={rating4Plus}
          onChange={(e) => onRatingChange(e.target.checked)}
        />
        <span className="avail-checkbox-box" aria-hidden="true" />
        <span className="avail-checkbox-label">4.5+ Rating</span>
      </label>
    </div>
  );
}

export default function DoctorsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("rating");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    spec: "all",
    country: "all",
  });
  const [onlineNow, setOnlineNow] = useState(false);
  const [rating4Plus, setRating4Plus] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: doctorsData, isLoading } = useDoctors({ limit: 100 });
  const { data: specialties } = useDoctorSpecialties();
  const { data: stats } = usePlatformStats();

  const doctors = useMemo(
    () => (doctorsData?.data ?? []).map(mapDoctorProfile),
    [doctorsData],
  );

  const specialtyFilters = useMemo(
    () => [
      { val: "all", label: "All Specialties" },
      ...(specialties ?? []).map((s) => ({
        val: s.name.toLowerCase(),
        label: `${specialtyEmoji(s.name)} ${s.name}`,
      })),
    ],
    [specialties],
  );

  const countryFilters = useMemo(() => {
    const countries = Array.from(new Set(doctors.map((d) => d.countryKey).filter(Boolean))).sort();
    return [
      { val: "all", label: "All Countries" },
      ...countries.map((c) => ({
        val: c,
        label: c.includes("pakistan") ? `🇵🇰 ${doctors.find((d) => d.countryKey === c)?.country ?? c}` : `🌍 ${doctors.find((d) => d.countryKey === c)?.country ?? c}`,
      })),
    ];
  }, [doctors]);

  const heroStats = useMemo(
    () => [
      {
        num: stats ? formatStatCount(stats.verifiedDoctorCount ?? stats.doctorCount) : "—",
        label: "Verified Doctors",
      },
      { num: stats?.specialtyCount ?? specialties?.length ?? "—", label: "Specialties" },
      { num: stats ? `${stats.averageRating.toFixed(1)}★` : "—", label: "Avg. Rating" },
      { num: stats ? formatStatCount(stats.reviewCount ?? 0) : "—", label: "Patient Reviews" },
    ],
    [stats, specialties],
  );

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

    let list = doctors.filter((d) => {
      if (activeFilters.spec !== "all" && d.spec !== activeFilters.spec) return false;
      if (activeFilters.country !== "all" && d.countryKey !== activeFilters.country) return false;
      if (onlineNow && !d.online) return false;
      if (rating4Plus && d.rating < 4.5) return false;
      if (q) {
        const hay = `${d.name} ${d.specLabel} ${d.cred} ${d.inst} ${d.city} ${d.country} ${d.tags.join(" ")} ${d.languages.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "experience") return b.exp - a.exp;
      if (sort === "reviews") return b.reviews - a.reviews;
      if (sort === "fee") return a.fee - b.fee;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return list;
  }, [search, sort, activeFilters, onlineNow, rating4Plus, doctors]);

  const goProfile = (id: string) => router.push(`/our-doctors/${id}`);
  const goBook = (id: string) => router.push(`/book-consultation?doctorId=${id}`);

  return (
    <div className="doctors-page">
      <div className="page-hero">
        <div className="page-hero-inner">
          <div className="page-eyebrow">👨‍⚕️ MEET THE EXPERTS</div>
          <h1>
            Our Medical <span>Team</span>
          </h1>
          <p>
            Every article, consultation, and answer on DrInsight comes from a verified, board-certified
            physician. Search our network of specialists by name, specialty, country, or rating.
          </p>
          <div className="stats-strip">
            {heroStats.map(({ num, label }) => (
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
            <option value="fee">Sort: Lowest Fee</option>
            <option value="name">Sort: Name (A–Z)</option>
          </select>
          <FilterDropdown
            options={specialtyFilters}
            value={activeFilters.spec}
            onChange={(val) => setFilter("spec", val)}
            ariaLabel="Specialty"
          />
          <FilterDropdown
            options={countryFilters}
            value={activeFilters.country}
            onChange={(val) => setFilter("country", val)}
            ariaLabel="Country"
          />
          <AvailabilityCheckboxes
            onlineNow={onlineNow}
            rating4Plus={rating4Plus}
            onOnlineChange={setOnlineNow}
            onRatingChange={setRating4Plus}
          />
        </div>
      </div>

      <div className="grid-section">
        {isLoading ? (
          <p style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-500)" }}>Loading doctors...</p>
        ) : filtered.length > 0 ? (
          <div className="doc-grid">
            {filtered.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onProfile={goProfile}
                onBook={goBook}
              />
            ))}
          </div>
        ) : (
          <div className="no-results show">
            <div className="nr-icon">🔍</div>
            <h3>No doctors found</h3>
            <p>Try adjusting your search or filters to find the right specialist.</p>
          </div>
        )}

        <div className="join-cta">
          <h3>✍️ Are You a Licensed Physician?</h3>
          <p>
            Join our network of verified medical professionals. Write articles, answer patient questions,
            offer consultations, and reach patients every month.
          </p>
          <div className="join-btns">
            <button type="button" className="btn-join-w" onClick={() => showToast("Opening application form...")}>
              Apply to Join →
            </button>
            <Link href="/author-guidelines" className="btn-join-o">
              📋 View Author Guidelines
            </Link>
          </div>
        </div>
      </div>

      <div className={`toast${toast ? " show" : ""}`}>{toast}</div>
    </div>
  );
}
