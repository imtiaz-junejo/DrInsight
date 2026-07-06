"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/styles/book-consultation-page.css";
import { formatCurrency, mapDoctorProfile, specialtyEmoji } from "@/lib/data-mappers";
import { CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-contact";
import type { DoctorScheduleDay } from "@/services/api-hooks";
import { StripePaymentWrapper } from "@/components/payments/StripePaymentWrapper";
import {
  useCreateBookingDraft,
  useCreatePaymentIntent,
  useDoctorSpecialties,
  useDoctors,
} from "@/services/api-hooks";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CONSULTATION_TYPE_MAP: Record<string, "VIDEO" | "AUDIO" | "CHAT"> = {
  "Video Consultation": "VIDEO",
  "Phone Consultation": "AUDIO",
  "Chat Consultation": "CHAT",
};

const SPEC_BG = ["#fee2e2", "#f3f0ff", "#fff7ed", "#fffbeb", "#eef2ff", "#fdf2f8", "#f0fdf4", "#e0f7fa", "#f1f5f9", "#fafafa", "#fdf4ff"];

function parseTimeToMinutes(token: string): number | null {
  const match = token.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function minutesToTimeLabel(totalMinutes: number): string {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function slotsFromSchedule(schedule?: DoctorScheduleDay[] | null, weekdayName?: string): string[] {
  const day = schedule?.find((d) => d.day.toLowerCase() === weekdayName?.toLowerCase());
  if (!day || !day.available) return [];

  const range = day.time.replace(/\(.*?\)/g, "").trim();
  const [startRaw, endRaw] = range.split(/[–-]/).map((s) => s.trim());
  const start = parseTimeToMinutes(startRaw ?? "");
  const end = parseTimeToMinutes(endRaw ?? "");
  if (start === null || end === null || end <= start) {
    return ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"];
  }

  const slots: string[] = [];
  for (let m = start; m + 30 <= end; m += 30) {
    slots.push(minutesToTimeLabel(m));
  }
  return slots;
}

function isDayAvailable(schedule: DoctorScheduleDay[] | null | undefined, date: Date): boolean {
  if (!schedule?.length) return date.getDay() !== 0 && date.getDay() !== 6;
  const dayName = WEEKDAY_NAMES[date.getDay()];
  return schedule.some((d) => d.day.toLowerCase() === dayName.toLowerCase() && d.available);
}

const STEPS = [
  { num: 1, label: "Select Specialty", sublabel: "Choose your specialty" },
  { num: 2, label: "Select Doctor", sublabel: "Choose your doctor" },
  { num: 3, label: "Select Date & Time", sublabel: "Pick a convenient slot" },
  { num: 4, label: "Patient Information", sublabel: "Your details" },
  { num: 5, label: "Payment", sublabel: "Secure checkout" },
];

type UploadedFile = { name: string; size: number };

function calcPayment(fee: number) {
  const platform = 5;
  const tax = +((fee + platform) * 0.08).toFixed(2);
  const total = +(fee + platform + tax).toFixed(2);
  return { platform, tax, total };
}

function parseScheduledAt(dateStr: string, timeStr: string, months: string[]): string {
  const parts = dateStr.replace(",", "").split(" ");
  const month = months.indexOf(parts[0]);
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return new Date(year, month, day, hours, minutes).toISOString();
}

export default function BookConsultationPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const today = useMemo(() => new Date(), []);

  const { data: doctorsData, isLoading: doctorsLoading } = useDoctors({ limit: 100 });
  const { data: specialtiesData } = useDoctorSpecialties();
  const createDraft = useCreateBookingDraft();
  const createIntent = useCreatePaymentIntent();

  const allDoctors = useMemo(
    () => (doctorsData?.data ?? []).map(mapDoctorProfile),
    [doctorsData],
  );

  const specialties = useMemo(
    () =>
      (specialtiesData ?? []).map((s, i) => ({
        name: s.name,
        emoji: specialtyEmoji(s.name),
        bg: SPEC_BG[i % SPEC_BG.length],
        count: s.count,
      })),
    [specialtiesData],
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const [spec, setSpec] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [consultType, setConsultType] = useState("Video Consultation");

  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingCountry, setBillingCountry] = useState("US");
  const [bookingDraftId, setBookingDraftId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [providerIntentId, setProviderIntentId] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [selDate, setSelDate] = useState("");
  const [selTime, setSelTime] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const matchingDoctors = useMemo(
    () =>
      allDoctors.filter(
        (d) =>
          !spec ||
          d.specialtyName.toLowerCase() === spec.toLowerCase() ||
          d.spec === spec.toLowerCase() ||
          d.specLabel.toLowerCase().includes(spec.toLowerCase()),
      ),
    [allDoctors, spec],
  );

  const topDoctors = useMemo(
    () =>
      spec
        ? [...matchingDoctors].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 3)
        : [],
    [matchingDoctors, spec],
  );

  const selectedDoctor = useMemo(
    () => allDoctors.find((d) => d.id === doctorId) ?? matchingDoctors[0],
    [allDoctors, doctorId, matchingDoctors],
  );

  const consultationTypes = useMemo(() => {
    const fee = selectedDoctor?.fee ?? 0;
    return [
      {
        name: "Video Consultation",
        label: "Video",
        icon: "ti-video",
        desc: "Face-to-face via secure video call",
        price: formatCurrency(fee),
        amount: fee,
      },
      {
        name: "Phone Consultation",
        label: "Phone",
        icon: "ti-phone-call",
        desc: "Speak directly by telephone",
        price: formatCurrency(Math.round(fee * 0.75)),
        amount: Math.round(fee * 0.75),
      },
      {
        name: "Chat Consultation",
        label: "Chat",
        icon: "ti-message-2",
        desc: "Real-time secure text messaging",
        price: formatCurrency(Math.round(fee * 0.5)),
        amount: Math.round(fee * 0.5),
      },
    ];
  }, [selectedDoctor?.fee]);

  const availableTimes = useMemo(() => {
    if (!selDate) return [];
    const parts = selDate.replace(",", "").split(" ");
    const month = MONTHS.indexOf(parts[0]);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return slotsFromSchedule(selectedDoctor?.weeklySchedule, WEEKDAY_NAMES[date.getDay()]);
  }, [selDate, selectedDoctor?.weeklySchedule]);

  const doc = selectedDoctor?.name ?? "Select a doctor";
  const fee =
    consultationTypes.find((t) => t.name === consultType)?.amount ?? selectedDoctor?.fee ?? 0;

  const { platform, tax, total } = calcPayment(fee);

  useEffect(() => {
    if (allDoctors.length === 0) return;
    const paramId = searchParams.get("doctorId");
    if (paramId) {
      const found = allDoctors.find((d) => d.id === paramId);
      if (found) {
        setDoctorId(found.id);
        const specialtyName = found.specLabel.replace(/^[^\s]+\s/, "").split(" · ")[0];
        setSpec(specialtyName);
      }
    }
  }, [searchParams, allDoctors]);

  useEffect(() => {
    if (matchingDoctors.length > 0 && !matchingDoctors.some((d) => d.id === doctorId)) {
      setDoctorId(matchingDoctors[0].id);
    }
  }, [matchingDoctors, doctorId]);

  const goStep = useCallback((n: number) => {
    setCurrentStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const changeMonth = (dir: number) => {
    let nextMonth = calMonth + dir;
    let nextYear = calYear;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }
    if (nextMonth < 0) {
      nextMonth = 11;
      nextYear--;
    }
    setCalMonth(nextMonth);
    setCalYear(nextYear);
    setSelDate("");
    setSelTime("");
  };

  const pickDate = (day: number) => {
    const dateStr = `${MONTHS[calMonth]} ${day}, ${calYear}`;
    setSelDate(dateStr);
    setSelTime("");
  };

  const pickTime = (time: string) => {
    setSelTime(time);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).map((f) => ({ name: f.name, size: f.size }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const proceedToPayment = async () => {
    if (!selectedDoctor || !selDate || !selTime) {
      alert("Please select a doctor, date, and time.");
      return;
    }
    goStep(5);
    setPaymentError("");
    setPaymentLoading(true);
    setClientSecret("");
    try {
      const scheduledAt = parseScheduledAt(selDate, selTime, MONTHS);
      const draft = await createDraft.mutateAsync({
        doctorId: selectedDoctor.id,
        scheduledAt,
        consultationType: CONSULTATION_TYPE_MAP[consultType] ?? "VIDEO",
        durationMinutes: 30,
      });
      setBookingDraftId(draft.id);
      const intent = await createIntent.mutateAsync({
        bookingDraftId: draft.id,
        billingName: billingName || undefined,
        billingEmail: billingEmail || undefined,
        billingCountry: billingCountry || undefined,
      });
      setClientSecret(intent.clientSecret);
      setProviderIntentId(intent.providerIntentId);
    } catch {
      setPaymentError("Unable to start payment. Please log in as a patient and try again.");
      goStep(4);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = (appointmentId: string) => {
    setConfirmed(true);
    setBookingRef(appointmentId.slice(0, 13).toUpperCase());
    window.location.href = `/book-consultation/confirmation?appointmentId=${appointmentId}`;
  };

  const resetBooking = () => {
    setConfirmed(false);
    setCurrentStep(1);
    setSelDate("");
    setSelTime("");
    setUploadedFiles([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const calendarDays = useMemo(() => {
    const first = new Date(calYear, calMonth, 1).getDay();
    const total = new Date(calYear, calMonth + 1, 0).getDate();
    const days: Array<{ day: number; past: boolean; unavailable: boolean; today: boolean; selected: boolean } | null> = [];

    for (let i = 0; i < first; i++) days.push(null);

    for (let d = 1; d <= total; d++) {
      const dt = new Date(calYear, calMonth, d);
      const isPast = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
      const isSel = selDate === `${MONTHS[calMonth]} ${d}, ${calYear}`;
      const unavailable = !isDayAvailable(selectedDoctor?.weeklySchedule, dt);
      days.push({ day: d, past: isPast, unavailable, today: isToday, selected: isSel });
    }

    return days;
  }, [calMonth, calYear, selDate, today, selectedDoctor?.weeklySchedule]);

  const confirmDateTime = selDate && selTime ? `${selDate} · ${selTime}` : "Select date and time";

  return (
    <div className="book-consultation-page">
      <h2 className="sr-only">Book a medical consultation — select specialty, doctor, date, and payment</h2>

      <div className="page-hero">
        <h1>Book Your Doctor Consultation</h1>
        <p>
          Choose your specialty, select a doctor, pick a time, and get expert medical care — video, phone, or chat.
          Same-day appointments available.
        </p>
        <div className="hero-badges">
          <div className="hbadge">
            <i className="ti ti-video" aria-hidden="true" /> Video · Phone · Chat
          </div>
          <div className="hbadge">
            <i className="ti ti-clock" aria-hidden="true" /> Same-day available
          </div>
          <div className="hbadge">
            <i className="ti ti-shield-check" aria-hidden="true" /> HIPAA secure
          </div>
          <div className="hbadge">
            <i className="ti ti-certificate" aria-hidden="true" /> Board-certified doctors
          </div>
        </div>
      </div>

      <div className="booking-intro-wrap">
        {!confirmed && (
          <div className="booking-intro">
            <Link href="/" className="back-home">
              <i className="ti ti-arrow-left" aria-hidden="true" /> Back to Home
            </Link>
            <h2 className="booking-title">Book Consultation</h2>
            <p className="booking-subtitle">Book an appointment with our trusted healthcare specialists</p>

            <div className="steps-bar">
              <div className="steps-inner">
                {STEPS.map((step, index) => (
                  <Fragment key={step.num}>
                    <div
                      className={`step${currentStep === step.num ? " active" : ""}${currentStep > step.num ? " done" : ""}`}
                    >
                      <div className="step-num">{step.num}</div>
                      <div className="step-text">
                        <div className="step-label">{step.label}</div>
                        <div className="step-sublabel">{step.sublabel}</div>
                      </div>
                    </div>
                    {index < STEPS.length - 1 && <div className="step-line" />}
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {!confirmed && (
        <div id="booking-flow">
          <div className="main">
            <div id="step-content">
              {currentStep === 1 && (
                <div id="step1">
                  <div className="form-panel form-panel-accent">
                    <div className="panel-header">
                      <div className="panel-icon">
                        <i className="ti ti-stethoscope" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="panel-title">Select Specialty</div>
                        <div className="panel-sub panel-sub-inline">
                          Choose the medical specialty that best matches your health concern
                        </div>
                      </div>
                    </div>
                    <div className="spec-select-wrap">
                      <select
                        className="spec-select"
                        value={spec}
                        onChange={(e) => setSpec(e.target.value)}
                        aria-label="Select a specialty"
                      >
                        <option value="">Select a specialty</option>
                        {specialties.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <i className="ti ti-chevron-down spec-select-chevron" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="top-doctors-section">
                    <div className="top-doctors-head">
                      <div>
                        <h3 className="top-doctors-title">Top Doctors</h3>
                        <p className="top-doctors-sub">Our top specialists in this field</p>
                      </div>
                      {matchingDoctors.length > 3 && (
                        <button type="button" className="show-all-link" onClick={() => goStep(2)}>
                          Show all available doctors <i className="ti ti-arrow-right" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    <div className="top-doc-grid">
                      {doctorsLoading ? (
                        <p style={{ color: "var(--gray-500)" }}>Loading doctors...</p>
                      ) : topDoctors.length > 0 ? (
                        topDoctors.map((d) => (
                          <div
                            key={d.id}
                            className={`top-doc-card${doctorId === d.id ? " sel" : ""}`}
                            onClick={() => setDoctorId(d.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setDoctorId(d.id);
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="top-doc-video">
                              <i className="ti ti-video" aria-hidden="true" />
                            </div>
                            <div className="top-doc-av">
                              {d.avatarUrl ? (
                                <img src={d.avatarUrl} alt="" />
                              ) : (
                                <span style={{ background: d.bg }}>{d.init}</span>
                              )}
                            </div>
                            <h4>{d.name}</h4>
                            <div className="top-doc-spec">{d.specialtyName}</div>
                            <div className="top-doc-rating">
                              <i className="ti ti-star-filled" aria-hidden="true" /> {d.rating.toFixed(1)} ({d.reviews}{" "}
                              reviews)
                            </div>
                            <div className="top-doc-exp">{d.exp} years experience</div>
                            <Link
                              href={`/our-doctors/${d.id}`}
                              className="top-doc-profile-btn"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Profile
                            </Link>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: "var(--gray-500)" }}>No doctors available for this specialty.</p>
                      )}
                    </div>

                    {matchingDoctors.length > 3 && (
                      <div className="show-all-bottom">
                        <button type="button" className="show-all-link" onClick={() => goStep(2)}>
                          Show all available doctors <i className="ti ti-arrow-right" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="nav-btns">
                    <div />
                    <button type="button" className="btn-next" onClick={() => goStep(2)} disabled={!spec}>
                      Continue to Select Doctor <i className="ti ti-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div id="step2">
                  <div className="form-panel">
                    <div className="panel-title">
                      <i className="ti ti-user-md" aria-hidden="true" /> Select Doctor
                    </div>
                    <div className="panel-sub">All doctors are board-certified with verified credentials</div>
                    <div className="doc-grid">
                      {doctorsLoading ? (
                        <p style={{ color: "var(--gray-500)" }}>Loading doctors...</p>
                      ) : matchingDoctors.length > 0 ? (
                        matchingDoctors.map((d) => (
                          <div
                            key={d.id}
                            className={`doc-card${doctorId === d.id ? " sel" : ""}`}
                            onClick={() => setDoctorId(d.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") setDoctorId(d.id);
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="doc-av" style={{ background: d.bg }}>
                              {d.avatarUrl ? <img src={d.avatarUrl} alt="" /> : d.init}
                            </div>
                            <h4>{d.name}</h4>
                            <div className="dspec">{d.specLabel}</div>
                            <div className="dexp">{d.exp} yrs experience</div>
                            <div className="drating">★★★★★ {d.rating.toFixed(1)} ({d.reviews})</div>
                            <div className="dfee">{formatCurrency(d.fee)} / 20 min</div>
                            <div className="doc-badge">
                              <i className="ti ti-circle-check" aria-hidden="true" />{" "}
                              {d.online ? "Available today" : "Book appointment"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: "var(--gray-500)" }}>No doctors available for this specialty.</p>
                      )}
                    </div>
                  </div>

                  <div className="form-panel panel-spaced">
                    <div className="panel-title">
                      <i className="ti ti-device-laptop" aria-hidden="true" /> Consultation Type
                    </div>
                    <div className="panel-sub">Select how you&apos;d like to connect with your doctor</div>
                    <div className="type-grid">
                      {consultationTypes.map((t) => (
                        <div
                          key={t.name}
                          className={`type-tile${consultType === t.name ? " sel" : ""}`}
                          onClick={() => setConsultType(t.name)}
                          onKeyDown={(e) => e.key === "Enter" && setConsultType(t.name)}
                          role="button"
                          tabIndex={0}
                        >
                          <i className={`ti ${t.icon}`} aria-hidden="true" />
                          <h4>{t.label}</h4>
                          <p>{t.desc}</p>
                          <div className="price">{t.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="nav-btns">
                    <button type="button" className="btn-back" onClick={() => goStep(1)}>
                      <i className="ti ti-arrow-left" aria-hidden="true" /> Back
                    </button>
                    <button type="button" className="btn-next" onClick={() => goStep(3)}>
                      Continue to Date & Time <i className="ti ti-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div id="step3">
                  <div className="form-panel">
                    <div className="panel-title">
                      <i className="ti ti-calendar" aria-hidden="true" /> Select Date & Time
                    </div>
                    <div className="panel-sub">Choose your preferred appointment date and time slot</div>
                    <div className="cal-wrap">
                      <div>
                        <div className="cal-box">
                          <div className="cal-head">
                            <button type="button" onClick={() => changeMonth(-1)}>
                              ‹
                            </button>
                            <span>
                              {MONTHS[calMonth]} {calYear}
                            </span>
                            <button type="button" onClick={() => changeMonth(1)}>
                              ›
                            </button>
                          </div>
                          <div className="cal-grid">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                              <div key={d} className="cal-day-name">
                                {d}
                              </div>
                            ))}
                            {calendarDays.map((item, i) =>
                              item === null ? (
                                <div key={`empty-${i}`} className="cal-day empty" />
                              ) : (
                                <button
                                  key={item.day}
                                  type="button"
                                  className={`cal-day${item.past || item.unavailable ? " past" : ""}${item.today ? " today" : ""}${item.selected ? " sel" : ""}`}
                                  onClick={() => !item.past && !item.unavailable && pickDate(item.day)}
                                  disabled={item.past || item.unavailable}
                                >
                                  {item.day}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="time-label">Available Times</div>
                        <div className="cal-box">
                          <div className="time-grid">
                            {!selDate ? (
                              <p style={{ gridColumn: "1 / -1", color: "var(--gray-500)", fontSize: "0.85rem" }}>
                                Select a date to see available times.
                              </p>
                            ) : availableTimes.length === 0 ? (
                              <p style={{ gridColumn: "1 / -1", color: "var(--gray-500)", fontSize: "0.85rem" }}>
                                No available times for this day.
                              </p>
                            ) : (
                              availableTimes.map((t) => {
                                const selected = selTime === t;
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    className={`time-slot${selected ? " sel" : ""}`}
                                    onClick={() => pickTime(t)}
                                  >
                                    {t}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="nav-btns">
                    <button type="button" className="btn-back" onClick={() => goStep(2)}>
                      <i className="ti ti-arrow-left" aria-hidden="true" /> Back
                    </button>
                    <button type="button" className="btn-next" onClick={() => goStep(4)}>
                      Continue to Patient Info <i className="ti ti-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div id="step4">
                  <div className="form-panel">
                    <div className="panel-title">
                      <i className="ti ti-user" aria-hidden="true" /> Patient Information
                    </div>
                    <div className="panel-sub">Your details are encrypted and HIPAA-protected</div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input
                          type="text"
                          placeholder="John"
                          value={billingName.split(" ")[0] ?? ""}
                          onChange={(e) => {
                            const last = billingName.split(" ").slice(1).join(" ");
                            setBillingName(last ? `${e.target.value} ${last}` : e.target.value);
                          }}
                        />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input
                          type="text"
                          placeholder="Smith"
                          value={billingName.split(" ").slice(1).join(" ")}
                          onChange={(e) => {
                            const first = billingName.split(" ")[0] ?? "";
                            setBillingName(first ? `${first} ${e.target.value}` : e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          placeholder="john@example.com"
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input type="tel" placeholder="+1 (555) 000-0000" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Date of Birth</label>
                        <input type="date" />
                      </div>
                      <div className="form-group">
                        <label>Biological Sex</label>
                        <select defaultValue="">
                          <option value="">Select...</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row single">
                      <div className="form-group">
                        <label>Reason for Consultation</label>
                        <textarea placeholder="Briefly describe your symptoms, concerns, or what you'd like to discuss with the doctor..." />
                      </div>
                    </div>
                    <div className="form-row single">
                      <div className="form-group">
                        <label>Current Medications (optional)</label>
                        <input type="text" placeholder="e.g. Metformin 500mg, Lisinopril 10mg, or None" />
                      </div>
                    </div>
                    <div className="form-row single">
                      <div className="form-group">
                        <label>Known Allergies (optional)</label>
                        <input type="text" placeholder="e.g. Penicillin, Aspirin, or None" />
                      </div>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <div className="upload-label">Upload Medical Reports (optional)</div>
                      <div
                        className="upload-zone"
                        onClick={() => fileInputRef.current?.click()}
                        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                        role="button"
                        tabIndex={0}
                      >
                        <i className="ti ti-cloud-upload" aria-hidden="true" />
                        <p>Drag & drop files here, or click to browse</p>
                        <span>PDF, JPG, PNG — max 10MB per file</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png"
                          style={{ display: "none" }}
                          onChange={(e) => handleFiles(e.target.files)}
                        />
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="file-list">
                          {uploadedFiles.map((f, i) => (
                            <div key={`${f.name}-${i}`} className="file-item">
                              <i className="ti ti-file" style={{ fontSize: 14, color: "#1a56a0" }} aria-hidden="true" />
                              <span>{f.name}</span>
                              <span className="file-size">{(f.size / 1024).toFixed(0)} KB</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="nav-btns">
                    <button type="button" className="btn-back" onClick={() => goStep(3)}>
                      <i className="ti ti-arrow-left" aria-hidden="true" /> Back
                    </button>
                    <button
                      type="button"
                      className="btn-next"
                      onClick={proceedToPayment}
                      disabled={createDraft.isPending || !billingEmail}
                    >
                      Continue to Payment <i className="ti ti-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div id="step5">
                  <div className="form-panel">
                    <div className="panel-title">
                      <i className="ti ti-credit-card" aria-hidden="true" /> Secure Payment
                    </div>
                    <div className="panel-sub">Complete your booking with Stripe — 256-bit SSL encrypted</div>

                    <div className="payment-summary-box">
                      <div className="payment-row">
                        <span className="payment-row-label">Doctor</span>
                        <span className="payment-row-val">{doc}</span>
                      </div>
                      <div className="payment-row">
                        <span className="payment-row-label">Specialty</span>
                        <span className="payment-row-val">{spec}</span>
                      </div>
                      <div className="payment-row">
                        <span className="payment-row-label">Date & Time</span>
                        <span className="payment-row-val">{confirmDateTime}</span>
                      </div>
                      <div className="payment-row">
                        <span className="payment-row-label">Consultation Type</span>
                        <span className="payment-row-val">{consultType}</span>
                      </div>
                      <div className="payment-divider" />
                      <div className="payment-row">
                        <span className="payment-row-label">Consultation fee</span>
                        <span className="payment-row-val">${fee.toFixed(2)}</span>
                      </div>
                      <div className="payment-row">
                        <span className="payment-row-label">Platform fee</span>
                        <span className="payment-row-val">${platform.toFixed(2)}</span>
                      </div>
                      <div className="payment-row">
                        <span className="payment-row-label">Tax (8%)</span>
                        <span className="payment-row-val">${tax.toFixed(2)}</span>
                      </div>
                      <div className="payment-divider" />
                      <div className="payment-row">
                        <span className="payment-total-label">Total</span>
                        <span className="payment-total-val">${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="form-row" style={{ marginTop: 16 }}>
                      <div className="form-group">
                        <label>Billing Name</label>
                        <input
                          type="text"
                          placeholder="John Smith"
                          value={billingName}
                          onChange={(e) => setBillingName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Billing Email</label>
                        <input
                          type="email"
                          placeholder="john@example.com"
                          value={billingEmail}
                          onChange={(e) => setBillingEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-row single">
                      <div className="form-group">
                        <label>Country</label>
                        <select value={billingCountry} onChange={(e) => setBillingCountry(e.target.value)}>
                          <option value="US">United States</option>
                          <option value="PK">Pakistan</option>
                          <option value="GB">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                          <option value="AE">United Arab Emirates</option>
                        </select>
                      </div>
                    </div>

                    {paymentError && <div className="payment-error-banner">{paymentError}</div>}

                    {paymentLoading ? (
                      <div className="payment-loading">
                        <span className="pay-spinner" aria-hidden="true" />
                        <p>Preparing secure payment...</p>
                      </div>
                    ) : clientSecret && providerIntentId ? (
                      <StripePaymentWrapper
                        clientSecret={clientSecret}
                        providerIntentId={providerIntentId}
                        amountLabel={`$${total.toFixed(2)}`}
                        onSuccess={handlePaymentSuccess}
                        onError={setPaymentError}
                      />
                    ) : (
                      <div className="payment-error-banner">
                        Payment could not be initialized.{" "}
                        <button type="button" className="retry-link" onClick={proceedToPayment}>
                          Retry
                        </button>
                      </div>
                    )}

                    <div className="trust-badges">
                      <div className="trust-badge">
                        <i className="ti ti-lock" aria-hidden="true" /> 256-bit SSL Secure
                      </div>
                      <div className="trust-badge">
                        <i className="ti ti-brand-stripe" aria-hidden="true" /> Powered by Stripe
                      </div>
                      <div className="trust-badge">
                        <i className="ti ti-shield-check" aria-hidden="true" /> Encrypted Payment
                      </div>
                    </div>
                    <div className="accepted-cards">
                      <span>Accepted:</span>
                      {["Visa", "Mastercard", "Amex", "UnionPay", "Discover"].map((c) => (
                        <span key={c} className="card-brand">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="nav-btns">
                    <button type="button" className="btn-back" onClick={() => goStep(4)}>
                      <i className="ti ti-arrow-left" aria-hidden="true" /> Back
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="summary-card">
              <h4>
                <i className="ti ti-clipboard-list" aria-hidden="true" /> Booking Summary
              </h4>
              <div className="sum-row">
                <span className="sum-label">Specialty</span>
                <span className={`sum-val${!spec ? " placeholder" : ""}`}>{spec || "Not selected"}</span>
              </div>
              <div className="sum-row">
                <span className="sum-label">Doctor</span>
                <span className={`sum-val${!selectedDoctor ? " placeholder" : ""}`}>
                  {selectedDoctor ? doc : "Not selected"}
                </span>
              </div>
              <div className="sum-row">
                <span className="sum-label">Consultation Type</span>
                <span className={`sum-val${!consultType ? " placeholder" : ""}`}>
                  {consultType || "Not selected"}
                </span>
              </div>
              <div className="sum-row">
                <span className="sum-label">Date</span>
                <span className={`sum-val${!selDate ? " placeholder" : ""}`}>{selDate || "Not selected"}</span>
              </div>
              <div className="sum-row">
                <span className="sum-label">Time</span>
                <span className={`sum-val${!selTime ? " placeholder" : ""}`}>{selTime || "Not selected"}</span>
              </div>
              <div className="sum-divider" />
              <div className="sum-total">
                <span>Consultation Fee</span>
                <span>${fee.toFixed(2)}</span>
              </div>
              <div className="policy-list">
                <div className="policy-item">
                  <i className="ti ti-circle-check" aria-hidden="true" /> Free reschedule up to 2h before
                </div>
                <div className="policy-item">
                  <i className="ti ti-circle-check" aria-hidden="true" /> Full refund if cancelled 24h+ before
                </div>
                <div className="policy-item">
                  <i className="ti ti-circle-check" aria-hidden="true" /> Board-certified specialist
                </div>
                <div className="policy-item">
                  <i className="ti ti-circle-check" aria-hidden="true" /> HIPAA-secure platform
                </div>
              </div>
              <div className="guarantee-box">
                <i className="ti ti-shield-check" aria-hidden="true" /> Satisfaction guaranteed — if unsatisfied with
                your consultation, we&apos;ll offer a free follow-up.
              </div>
            </div>
          </div>

          <div className="booking-support">
            <i className="ti ti-info-circle" aria-hidden="true" />
            <span>
              Need help? Call us at{" "}
              <a href={`tel:${CONTACT_PHONE_TEL}`}>{CONTACT_PHONE}</a> or email{" "}
              <a href="mailto:support@drinsight.org">support@drinsight.org</a>
            </span>
          </div>
        </div>
      )}

      <div className={`confirm-page${confirmed ? " show" : ""}`}>
        <div className="confirm-circle">
          <i className="ti ti-circle-check" aria-hidden="true" />
        </div>
        <h2>Booking Confirmed!</h2>
        <p>
          Your consultation has been successfully booked. A confirmation email with joining instructions has been sent
          to your inbox.
        </p>
        <div className="confirm-details">
          <div className="cd-row">
            <span>Doctor</span>
            <span>{doc}</span>
          </div>
          <div className="cd-row">
            <span>Specialty</span>
            <span>{spec}</span>
          </div>
          <div className="cd-row">
            <span>Type</span>
            <span>{consultType}</span>
          </div>
          <div className="cd-row">
            <span>Date & Time</span>
            <span>{confirmDateTime}</span>
          </div>
          <div className="cd-row">
            <span>Amount Paid</span>
            <span style={{ color: "#1a56a0" }}>${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="confirm-btns">
          <button type="button" className="cbtn-primary" onClick={() => window.scrollTo(0, 0)}>
            Add to Calendar
          </button>
          <button type="button" className="cbtn-secondary" onClick={resetBooking}>
            Book Another
          </button>
        </div>
        <div className="ref-num">Booking reference: {bookingRef}</div>
      </div>
    </div>
  );
}
