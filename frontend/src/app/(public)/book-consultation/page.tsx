"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/styles/book-consultation-page.css";
import { formatCurrency, mapDoctorProfile } from "@/lib/data-mappers";
import {
  useConfirmDevPayment,
  useCreateBookingDraft,
  useCreatePaymentIntent,
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

const TIMES = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "05:00 PM",
  "05:30 PM",
];

const UNAVAIL = [2, 5, 9, 12];

const SPECIALTIES = [
  { name: "Cardiology", emoji: "❤️", bg: "#fee2e2" },
  { name: "Neurology", emoji: "🧠", bg: "#f3f0ff" },
  { name: "Dermatology", emoji: "🦷", bg: "#fff7ed" },
  { name: "Diabetes & Endocrinology", emoji: "🩸", bg: "#fffbeb" },
  { name: "Mental Health", emoji: "🧘", bg: "#eef2ff" },
  { name: "Women's Health", emoji: "🤰", bg: "#fdf2f8" },
  { name: "Pediatrics", emoji: "👶", bg: "#f0fdf4" },
  { name: "Orthopedics", emoji: "🩻", bg: "#e0f7fa" },
  { name: "General Medicine", emoji: "💊", bg: "#f1f5f9" },
  { name: "Gastroenterology", emoji: "🔬", bg: "#fafafa" },
  { name: "Oncology", emoji: "🧬", bg: "#fdf4ff" },
  { name: "Pulmonology", emoji: "🫁", bg: "#e0f7fa" },
];

const CONSULTATION_TYPE_MAP: Record<string, "VIDEO" | "AUDIO" | "CHAT"> = {
  "Video Consultation": "VIDEO",
  "Phone Consultation": "AUDIO",
  "Chat Consultation": "CHAT",
};

const CONSULTATION_TYPES = [
  { name: "Video Consultation", label: "Video", icon: "ti-video", desc: "Face-to-face via secure video call", price: "From $75" },
  { name: "Phone Consultation", label: "Phone", icon: "ti-phone-call", desc: "Speak directly by telephone", price: "From $59" },
  { name: "Chat Consultation", label: "Chat", icon: "ti-message-2", desc: "Real-time secure text messaging", price: "From $49" },
];

const PAYMENT_METHODS = [
  { name: "Credit / Debit Card", label: "Card", icon: "ti-credit-card" },
  { name: "PayPal", label: "PayPal", icon: "ti-brand-paypal" },
  { name: "Apple Pay", label: "Apple Pay", icon: "ti-brand-apple" },
];

const STEPS = [
  { num: 1, label: "Specialty & Doctor" },
  { num: 2, label: "Date & Time" },
  { num: 3, label: "Patient Info" },
  { num: 4, label: "Payment" },
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
  const createDraft = useCreateBookingDraft();
  const createIntent = useCreatePaymentIntent();
  const confirmDev = useConfirmDevPayment();

  const allDoctors = useMemo(
    () => (doctorsData?.data ?? []).map(mapDoctorProfile),
    [doctorsData],
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("MED-2026-A4F7K");

  const [spec, setSpec] = useState("Cardiology");
  const [doctorId, setDoctorId] = useState("");
  const [consultType, setConsultType] = useState("Video Consultation");
  const [payMethod, setPayMethod] = useState("Credit / Debit Card");

  const [calMonth, setCalMonth] = useState(5);
  const [calYear, setCalYear] = useState(2026);
  const [selDate, setSelDate] = useState("");
  const [selTime, setSelTime] = useState("");

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const matchingDoctors = useMemo(
    () => allDoctors.filter((d) => d.specLabel.toLowerCase().includes(spec.toLowerCase()) || d.spec === spec.toLowerCase()),
    [allDoctors, spec],
  );

  const selectedDoctor = useMemo(
    () => allDoctors.find((d) => d.id === doctorId) ?? matchingDoctors[0],
    [allDoctors, doctorId, matchingDoctors],
  );

  const doc = selectedDoctor?.name ?? "Select a doctor";
  const fee = selectedDoctor?.fee ?? 0;

  const { tax, total } = calcPayment(fee);

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

  const confirmBooking = async () => {
    if (!selectedDoctor || !selDate || !selTime) {
      alert("Please select a doctor, date, and time.");
      return;
    }
    try {
      const scheduledAt = parseScheduledAt(selDate, selTime, MONTHS);
      const draft = await createDraft.mutateAsync({
        doctorId: selectedDoctor.id,
        scheduledAt,
        consultationType: CONSULTATION_TYPE_MAP[consultType] ?? "VIDEO",
        durationMinutes: 20,
      });
      const intent = await createIntent.mutateAsync(draft.id);
      await confirmDev.mutateAsync(intent.providerIntentId);
      setBookingRef(intent.id.slice(0, 13).toUpperCase());
      setConfirmed(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      alert("Booking failed. Please log in as a patient and try again.");
    }
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
    const days: Array<{ day: number; past: boolean; today: boolean; selected: boolean } | null> = [];

    for (let i = 0; i < first; i++) days.push(null);

    for (let d = 1; d <= total; d++) {
      const dt = new Date(calYear, calMonth, d);
      const isPast = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isToday = d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
      const isSel = selDate === `${MONTHS[calMonth]} ${d}, ${calYear}`;
      days.push({ day: d, past: isPast, today: isToday, selected: isSel });
    }

    return days;
  }, [calMonth, calYear, selDate, today]);

  const confirmDateTime =
    (selDate || "June 12, 2026") + " · " + (selTime || "10:00 AM");

  return (
    <div className="book-consultation-page">
      <h2 className="sr-only">Book a medical consultation — select specialty, doctor, date, and payment</h2>

      <div className="breadcrumb">
        <div className="breadcrumb-inner">
          <i className="ti ti-home" style={{ fontSize: 13 }} aria-hidden="true" />
          <Link href="/">Home</Link> › <span className="cur">Book Consultation</span>
        </div>
      </div>

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

      <div className="steps-bar">
        <div className="steps-inner">
          {STEPS.map((step, index) => (
            <Fragment key={step.num}>
              <div
                className={`step${currentStep === step.num ? " active" : ""}${currentStep > step.num ? " done" : ""}`}
              >
                <div className="step-num">{step.num}</div>
                <div className="step-label">{step.label}</div>
              </div>
              {index < STEPS.length - 1 && <div className="step-line" />}
            </Fragment>
          ))}
        </div>
      </div>

      {!confirmed && (
        <div id="booking-flow">
          <div className="main">
            <div id="step-content">
              {currentStep === 1 && (
                <div id="step1">
                  <div className="form-panel">
                    <div className="panel-title">
                      <i className="ti ti-stethoscope" aria-hidden="true" /> Select Specialty
                    </div>
                    <div className="panel-sub">Choose the medical specialty that best matches your health concern</div>
                    <div className="spec-grid">
                      {SPECIALTIES.map((s) => (
                        <div
                          key={s.name}
                          className={`spec-tile${spec === s.name ? " sel" : ""}`}
                          onClick={() => setSpec(s.name)}
                          onKeyDown={(e) => e.key === "Enter" && setSpec(s.name)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="spec-ico" style={{ background: s.bg }}>
                            {s.emoji}
                          </div>
                          <div className="spec-name">{s.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-panel panel-spaced">
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
                              {d.init}
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
                      {CONSULTATION_TYPES.map((t) => (
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
                    <div />
                    <button type="button" className="btn-next" onClick={() => goStep(2)}>
                      Continue to Date & Time <i className="ti ti-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div id="step2">
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
                                  className={`cal-day${item.past ? " past" : ""}${item.today ? " today" : ""}${item.selected ? " sel" : ""}`}
                                  onClick={() => !item.past && pickDate(item.day)}
                                  disabled={item.past}
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
                            {TIMES.map((t, i) => {
                              const unavailable = UNAVAIL.includes(i);
                              const selected = selTime === t && !unavailable;
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  className={`time-slot${unavailable ? " unavail" : ""}${selected ? " sel" : ""}`}
                                  onClick={() => !unavailable && pickTime(t)}
                                  disabled={unavailable}
                                >
                                  {t}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="nav-btns">
                    <button type="button" className="btn-back" onClick={() => goStep(1)}>
                      <i className="ti ti-arrow-left" aria-hidden="true" /> Back
                    </button>
                    <button type="button" className="btn-next" onClick={() => goStep(3)}>
                      Continue to Patient Info <i className="ti ti-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div id="step3">
                  <div className="form-panel">
                    <div className="panel-title">
                      <i className="ti ti-user" aria-hidden="true" /> Patient Information
                    </div>
                    <div className="panel-sub">Your details are encrypted and HIPAA-protected</div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>First Name</label>
                        <input type="text" placeholder="John" defaultValue="" />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" placeholder="Smith" defaultValue="" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" placeholder="john@example.com" />
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
                    <button type="button" className="btn-back" onClick={() => goStep(2)}>
                      <i className="ti ti-arrow-left" aria-hidden="true" /> Back
                    </button>
                    <button type="button" className="btn-next" onClick={() => goStep(4)}>
                      Continue to Payment <i className="ti ti-arrow-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div id="step4">
                  <div className="form-panel">
                    <div className="panel-title">
                      <i className="ti ti-lock" aria-hidden="true" /> Secure Payment
                    </div>
                    <div className="panel-sub">256-bit SSL encryption — your payment details are fully protected</div>

                    <div className="pay-method-label">Payment Method</div>
                    <div className="payment-method">
                      {PAYMENT_METHODS.map((p) => (
                        <div
                          key={p.name}
                          className={`pay-tile${payMethod === p.name ? " sel" : ""}`}
                          onClick={() => setPayMethod(p.name)}
                          onKeyDown={(e) => e.key === "Enter" && setPayMethod(p.name)}
                          role="button"
                          tabIndex={0}
                        >
                          <i className={`ti ${p.icon}`} aria-hidden="true" />
                          {p.label}
                        </div>
                      ))}
                    </div>

                    {payMethod === "Credit / Debit Card" && (
                      <div className="payment-box" id="card-form">
                        <div className="form-row single" style={{ marginBottom: 10 }}>
                          <div className="form-group">
                            <label>Card Number</label>
                            <input type="text" placeholder="1234  5678  9012  3456" maxLength={19} />
                          </div>
                        </div>
                        <div className="form-row" style={{ marginBottom: 10 }}>
                          <div className="form-group">
                            <label>Expiry Date</label>
                            <input type="text" placeholder="MM / YY" maxLength={7} />
                          </div>
                          <div className="form-group">
                            <label>CVV</label>
                            <input type="text" placeholder="•••" maxLength={4} />
                          </div>
                        </div>
                        <div className="form-row single" style={{ marginBottom: 0 }}>
                          <div className="form-group">
                            <label>Cardholder Name</label>
                            <input type="text" placeholder="John Smith" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="payment-box" style={{ marginTop: 0 }}>
                      <div className="payment-row">
                        <span className="payment-row-label">Consultation fee</span>
                        <span className="payment-row-val">${fee.toFixed(2)}</span>
                      </div>
                      <div className="payment-row">
                        <span className="payment-row-label">Platform fee</span>
                        <span className="payment-row-val">$5.00</span>
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

                    <div className="secure-badge">
                      <i className="ti ti-lock" aria-hidden="true" style={{ fontSize: 14, color: "#059669" }} /> Payments
                      secured by 256-bit SSL &nbsp;|&nbsp;{" "}
                      <i className="ti ti-shield-check" aria-hidden="true" style={{ fontSize: 14, color: "#059669" }} />{" "}
                      HIPAA compliant
                    </div>
                    <div className="disclaimer">
                      <i className="ti ti-info-circle" aria-hidden="true" /> Free rescheduling up to 2 hours before
                      your appointment. Full refund if cancelled 24+ hours in advance.
                    </div>
                  </div>
                  <div className="nav-btns">
                    <button type="button" className="btn-back" onClick={() => goStep(3)}>
                      <i className="ti ti-arrow-left" aria-hidden="true" /> Back
                    </button>
                    <button
                      type="button"
                      className="btn-confirm"
                      onClick={confirmBooking}
                      disabled={createDraft.isPending || createIntent.isPending || confirmDev.isPending}
                    >
                      <i className="ti ti-circle-check" aria-hidden="true" />{" "}
                      {createDraft.isPending || createIntent.isPending || confirmDev.isPending
                        ? "Processing..."
                        : "Confirm & Pay"}
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
                <span className="sum-val">{spec}</span>
              </div>
              <div className="sum-row">
                <span className="sum-label">Doctor</span>
                <span className="sum-val">{doc}</span>
              </div>
              <div className="sum-row">
                <span className="sum-label">Type</span>
                <span className="sum-val">{consultType}</span>
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
                <span>Consultation</span>
                <span>${fee}</span>
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
