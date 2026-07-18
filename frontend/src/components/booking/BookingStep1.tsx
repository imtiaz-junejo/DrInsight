"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCurrency, mapDoctorProfile, specialtyEmoji } from "@/lib/data-mappers";
import type { MappedDoctorCard } from "@/lib/data-mappers";
import {
  CATEGORY_LABELS,
  CONSULT_TYPE_LABELS,
  TYPE_ICONS,
  TYPE_SHORT_LABELS,
  doctorOnlineTypes,
  doctorSupportsCategory,
  formatNextAvailableSlot,
  getDoctorFees,
  getSelectedFee,
  asScheduleDays,
  type BookingCategory,
  type ConsultTypeKey,
} from "@/lib/booking-flow";
import type { DoctorProfile } from "@/services/api-hooks";

const SPEC_BG = [
  "#fee2e2",
  "#f3f0ff",
  "#fff7ed",
  "#fffbeb",
  "#eef2ff",
  "#fdf2f8",
  "#f0fdf4",
  "#e0f7fa",
  "#f1f5f9",
  "#fafafa",
  "#fdf4ff",
];

export interface BookingStep1Props {
  category: BookingCategory;
  consultTypeKey: ConsultTypeKey | null;
  spec: string;
  doctorId: string;
  doctorsLoading: boolean;
  specialties: Array<{ name: string; count: number }>;
  rawDoctors: DoctorProfile[];
  onCategoryChange: (category: BookingCategory) => void;
  onConsultTypeKeyChange: (key: ConsultTypeKey) => void;
  onSpecChange: (spec: string) => void;
  onDoctorSelect: (doctorId: string, fee: number, consultTypeLabel: string) => void;
  onContinue: () => void;
}

function DoctorFeeBlock({
  category,
  consultTypeKey,
  fees,
  onlineTypes,
}: {
  category: BookingCategory;
  consultTypeKey: ConsultTypeKey | null;
  fees: ReturnType<typeof getDoctorFees>;
  onlineTypes: ConsultTypeKey[];
}) {
  if (category === "physical") {
    return (
      <div className="dfee">
        Clinic Visit Fee: {formatCurrency(fees.physical, "USD")} <span className="dfee-unit">/ 20 min</span>
      </div>
    );
  }
  if (category === "online") {
    return (
      <div className="dfee-list">
        {onlineTypes.map((type) => (
          <div key={type} className={`dfee-row${consultTypeKey === type ? " active" : ""}`}>
            <span>
              <i className={`ti ${TYPE_ICONS[type]}`} aria-hidden="true" /> {TYPE_SHORT_LABELS[type]}
            </span>
            <span>{formatCurrency(fees[type], "USD")}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function DoctorTypeBadges({
  category,
  onlineTypes,
}: {
  category: BookingCategory;
  onlineTypes: ConsultTypeKey[];
}) {
  return (
    <div className="doc-badges">
      {category === "physical" ? <span className="doc-type-badge">In-clinic</span> : null}
      {category === "online"
        ? onlineTypes.map((type) => (
            <span key={type} className="doc-type-badge">
              {TYPE_SHORT_LABELS[type]}
            </span>
          ))
        : null}
    </div>
  );
}

export function BookingStep1({
  category,
  consultTypeKey,
  spec,
  doctorId,
  doctorsLoading,
  specialties,
  rawDoctors,
  onCategoryChange,
  onConsultTypeKeyChange,
  onSpecChange,
  onDoctorSelect,
  onContinue,
}: BookingStep1Props) {
  const [profileDoctorId, setProfileDoctorId] = useState<string | null>(null);

  const mappedById = useMemo(() => {
    const map = new Map<string, { card: MappedDoctorCard; profile: DoctorProfile }>();
    rawDoctors.forEach((profile) => {
      map.set(profile.id, { card: mapDoctorProfile(profile), profile });
    });
    return map;
  }, [rawDoctors]);

  const filteredDoctors = useMemo(() => {
    if (!category || !spec) return [];
    if (category === "online" && !consultTypeKey) return [];

    return rawDoctors
      .filter((profile) => profile.specialty === spec && doctorSupportsCategory(profile, category))
      .map((profile) => mappedById.get(profile.id)!)
      .filter(Boolean)
      .sort((a, b) => b.card.rating - a.card.rating || b.card.reviews - a.card.reviews);
  }, [category, consultTypeKey, spec, rawDoctors, mappedById]);

  const step1Ready = Boolean(category && spec && doctorId && (category === "physical" || consultTypeKey));

  const profileEntry = profileDoctorId ? mappedById.get(profileDoctorId) : null;

  const handleSelectDoctor = (id: string) => {
    const entry = mappedById.get(id);
    if (!entry || !category) return;
    const fees = getDoctorFees(entry.card.fee);
    const fee = getSelectedFee(fees, category, consultTypeKey);
    const label =
      category === "physical"
        ? CATEGORY_LABELS.physical
        : consultTypeKey
          ? CONSULT_TYPE_LABELS[consultTypeKey]
          : CONSULT_TYPE_LABELS.video;
    onDoctorSelect(id, fee, label);
  };

  return (
    <div id="step1">
      <div className="form-panel">
        <div className="panel-title">
          <i className="ti ti-clipboard-list" aria-hidden="true" /> Select Consultation Category
        </div>
        <div className="panel-sub">Choose how you&apos;d like to have your consultation</div>
        <div className="cat-grid">
          <button
            type="button"
            className={`cat-tile${category === "physical" ? " sel" : ""}`}
            onClick={() => onCategoryChange("physical")}
          >
            <div className="cat-ico">
              <i className="ti ti-building-hospital" aria-hidden="true" />
            </div>
            <h4>Physical Appointment</h4>
            <p>Visit the clinic in person for a face-to-face consultation</p>
            <div className="cat-check">
              <i className="ti ti-circle-check" aria-hidden="true" /> Selected
            </div>
          </button>
          <button
            type="button"
            className={`cat-tile${category === "online" ? " sel" : ""}`}
            onClick={() => onCategoryChange("online")}
          >
            <div className="cat-ico">
              <i className="ti ti-device-laptop" aria-hidden="true" />
            </div>
            <h4>Online Consultation</h4>
            <p>Connect remotely by video, voice, or chat</p>
            <div className="cat-check">
              <i className="ti ti-circle-check" aria-hidden="true" /> Selected
            </div>
          </button>
        </div>
      </div>

      {category === "online" ? (
        <div className="form-panel panel-spaced step-section-enter">
          <div className="panel-title">
            <i className="ti ti-device-laptop" aria-hidden="true" /> Select Consultation Type
          </div>
          <div className="panel-sub">Choose how you&apos;d like to connect with your doctor online</div>
          <div className="type-grid">
            {(["video", "voice", "phone"] as ConsultTypeKey[]).map((type) => (
              <button
                key={type}
                type="button"
                className={`type-tile${consultTypeKey === type ? " sel" : ""}`}
                onClick={() => onConsultTypeKeyChange(type)}
              >
                <i className={`ti ${TYPE_ICONS[type]}`} aria-hidden="true" />
                <h4>{CONSULT_TYPE_LABELS[type]}</h4>
                <p>
                  {type === "video"
                    ? "Face-to-face via secure video call"
                    : type === "voice"
                      ? "Speak directly through the app"
                      : "Message your doctor directly in the app"}
                </p>
                <div className="price">Payment required</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="form-panel panel-spaced">
        <div className="panel-title">
          <i className="ti ti-stethoscope" aria-hidden="true" /> Select Department / Specialty
        </div>
        <div className="panel-sub">Choose the medical specialty that best matches your health concern</div>
        <div className="spec-grid">
          {specialties.map((s, index) => (
            <button
              key={s.name}
              type="button"
              className={`spec-tile${spec === s.name ? " sel" : ""}`}
              onClick={() => onSpecChange(s.name)}
            >
              <div className="spec-ico" style={{ background: SPEC_BG[index % SPEC_BG.length] }}>
                {specialtyEmoji(s.name)}
              </div>
              <div className="spec-name">{s.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="form-panel panel-spaced">
        <div className="panel-title">
          <i className="ti ti-user-md" aria-hidden="true" /> Select Doctor
        </div>
        <div className="panel-sub">All doctors are board-certified with verified credentials</div>

        {!category || !spec || (category === "online" && !consultTypeKey) ? (
          <div className="doc-empty">
            <i className="ti ti-user-search" aria-hidden="true" />
            Select a consultation category and department above to view matching doctors.
          </div>
        ) : doctorsLoading ? (
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.8rem" }}>Loading doctors...</p>
        ) : filteredDoctors.length === 0 ? (
          <div className="doc-empty">
            <i className="ti ti-mood-empty" aria-hidden="true" />
            No doctors currently available for this category and department combination. Try a different consultation
            type or department.
          </div>
        ) : (
          <div className="doc-grid">
            {filteredDoctors.map(({ card, profile }) => {
              const fees = getDoctorFees(card.fee);
              const onlineTypes = doctorOnlineTypes(profile);
              const schedule =
                category === "physical"
                  ? asScheduleDays(profile.clinicSchedule) ?? profile.weeklySchedule
                  : asScheduleDays(profile.onlineSchedule) ?? profile.weeklySchedule;
              const nextSlot = formatNextAvailableSlot(schedule);
              const isSelected = doctorId === card.id;

              return (
                <div key={card.id} className={`doc-card${isSelected ? " sel" : ""}`} id={`doc-${card.id}`}>
                  <div className="doc-av" style={{ background: card.bg }}>
                    {card.avatarUrl ? (
                      <img src={card.avatarUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      card.init
                    )}
                  </div>
                  <h4>{card.name}</h4>
                  <div className="dspec">{card.specialtyName}</div>
                  <div className="dqual">{card.cred}</div>
                  <div className="dexp">{card.exp} yrs experience</div>
                  <DoctorFeeBlock
                    category={category}
                    consultTypeKey={consultTypeKey}
                    fees={fees}
                    onlineTypes={onlineTypes}
                  />
                  <DoctorTypeBadges category={category} onlineTypes={onlineTypes} />
                  <div className="doc-slot">
                    <i className="ti ti-clock" aria-hidden="true" /> Next available: {nextSlot}
                  </div>
                  <div className="doc-actions">
                    <button type="button" className="btn-view-profile" onClick={() => setProfileDoctorId(card.id)}>
                      View Profile
                    </button>
                    <button
                      type="button"
                      className="btn-book-doc"
                      onClick={() => handleSelectDoctor(card.id)}
                    >
                      {isSelected ? (
                        <>
                          <i className="ti ti-circle-check" aria-hidden="true" /> Selected
                        </>
                      ) : (
                        "Book Consultation"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="nav-btns">
        <div />
        <button type="button" className="btn-next" onClick={onContinue} disabled={!step1Ready}>
          Continue to Date & Time <i className="ti ti-arrow-right" aria-hidden="true" />
        </button>
      </div>

      <div
        className={`profile-overlay${profileDoctorId ? " show" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setProfileDoctorId(null);
        }}
        role="presentation"
      >
        {profileEntry ? (
          <div className="profile-modal" role="dialog" aria-modal="true" aria-label="Doctor profile">
            <button
              type="button"
              className="profile-close"
              onClick={() => setProfileDoctorId(null)}
              aria-label="Close"
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
            <div className="profile-head">
              <div className="profile-av" style={{ background: profileEntry.card.bg }}>
                {profileEntry.card.init}
              </div>
              <div>
                <h3>{profileEntry.card.name}</h3>
                <div className="pspec">{profileEntry.card.specialtyName}</div>
              </div>
            </div>
            <div className="profile-row">
              <span>Qualifications</span>
              <span>{profileEntry.card.cred}</span>
            </div>
            <div className="profile-row">
              <span>Experience</span>
              <span>{profileEntry.card.exp} years</span>
            </div>
            <div className="profile-row">
              <span>Consultation Fee</span>
              <span>
                {[
                  doctorSupportsCategory(profileEntry.profile, "physical")
                    ? `Clinic Visit: ${formatCurrency(getDoctorFees(profileEntry.card.fee).physical, "USD")}`
                    : "",
                  ...doctorOnlineTypes(profileEntry.profile).map(
                    (t) => `${TYPE_SHORT_LABELS[t]}: ${formatCurrency(getDoctorFees(profileEntry.card.fee)[t], "USD")}`,
                  ),
                ]
                  .filter(Boolean)
                  .join(" · ")}{" "}
                <span style={{ color: "var(--color-text-secondary)" }}>/ 20 min</span>
              </span>
            </div>
            <div className="profile-row">
              <span>Types Offered</span>
              <span>
                {[
                  doctorSupportsCategory(profileEntry.profile, "physical") ? "In-clinic" : "",
                  doctorOnlineTypes(profileEntry.profile)
                    .map((t) => TYPE_SHORT_LABELS[t])
                    .join(", "),
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
            <div className="profile-row">
              <span>Next Available</span>
              <span>
                {formatNextAvailableSlot(
                  asScheduleDays(profileEntry.profile.onlineSchedule) ?? profileEntry.profile.weeklySchedule,
                )}
              </span>
            </div>
            <div className="profile-row">
              <span>Rating</span>
              <span>
                {profileEntry.card.rating.toFixed(1)} ({profileEntry.card.reviews} reviews)
              </span>
            </div>
            <button
              type="button"
              className="btn-book-doc"
              onClick={() => {
                handleSelectDoctor(profileEntry.card.id);
                setProfileDoctorId(null);
              }}
            >
              Book Consultation
            </button>
            <Link
              href={`/our-doctors/${profileEntry.card.id}`}
              className="btn-view-profile"
              style={{ display: "block", textAlign: "center", marginTop: 8 }}
            >
              Full Profile Page
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
