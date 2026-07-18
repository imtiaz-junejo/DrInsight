"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@/styles/book-consultation-page.css";
import { SectionTitle } from "@/components/public/section-heading";
import { formatCurrency, mapDoctorProfile } from "@/lib/data-mappers";
import { CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-contact";
import type { DoctorScheduleDay } from "@/services/api-hooks";
import { StripePaymentWrapper } from "@/components/payments/StripePaymentWrapper";
import { BookingStep1 } from "@/components/booking/BookingStep1";
import { BookingStep2 } from "@/components/booking/BookingStep2";
import {
  CONSULTATION_TYPE_MAP,
  getDoctorFees,
  getSelectedFee,
  resolveConsultTypeLabel,
  asScheduleDays,
  type BookingCategory,
  type ConsultTypeKey,
} from "@/lib/booking-flow";
import {
  extractApiErrorMessage,
  validatePatientInfoForm,
  type PatientInfoErrors,
  type PatientInfoField,
} from "@/lib/booking-validation";
import {
  bookingLoginUrl,
  bookingRegisterUrl,
  verifyPatientSession,
} from "@/lib/booking-auth";
import { extractPatientFormFields } from "@/lib/patient-profile";
import { useAuthStore } from "@/store/auth.store";
import {
  usePendingBookingStore,
  type PendingBookingData,
} from "@/store/pending-booking.store";
import {
  useCreateBookingDraft,
  useCreatePaymentIntent,
  useDoctorSpecialties,
  useDoctors,
} from "@/services/api-hooks";
import { useAuthProfile } from "@/services/patient-api-hooks";

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
  { num: 1, label: "Specialty & Doctor", sublabel: "Choose your specialist" },
  { num: 2, label: "Date & Time", sublabel: "Pick a convenient slot" },
  { num: 3, label: "Patient Info", sublabel: "Your information" },
  { num: 4, label: "Payment", sublabel: "Secure checkout" },
];

type UploadedFile = { name: string; size: number };

type Step3Alert = {
  title: string;
  messages: string[];
  actionHref?: string;
  actionLabel?: string;
};

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

  const rawDoctors = doctorsData?.data ?? [];
  const allDoctors = useMemo(
    () => rawDoctors.map(mapDoctorProfile),
    [rawDoctors],
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const [bookingCategory, setBookingCategory] = useState<BookingCategory>("");
  const [consultTypeKey, setConsultTypeKey] = useState<ConsultTypeKey | null>(null);
  const [spec, setSpec] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [consultType, setConsultType] = useState("Video Consultation");
  const [selectedFee, setSelectedFee] = useState(0);

  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingCountry, setBillingCountry] = useState("US");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [consultationReason, setConsultationReason] = useState("");
  const [patientFormErrors, setPatientFormErrors] = useState<PatientInfoErrors>({});
  const [step3Alert, setStep3Alert] = useState<Step3Alert | null>(null);
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
  const [authVerifying, setAuthVerifying] = useState(false);
  const [nonPatientBlock, setNonPatientBlock] = useState(false);
  const [restoredBanner, setRestoredBanner] = useState(false);
  const restoreAttempted = useRef(false);
  const isRestoringRef = useRef(false);
  const lastPrefilledKey = useRef<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isBootstrapped = useAuthStore((s) => s.isBootstrapped);
  const setUser = useAuthStore((s) => s.setUser);
  const pendingBooking = usePendingBookingStore((s) => s.booking);
  const pendingHasHydrated = usePendingBookingStore((s) => s.hasHydrated);
  const savePendingBooking = usePendingBookingStore((s) => s.saveBooking);
  const clearPendingBooking = usePendingBookingStore((s) => s.clearBooking);
  const setAwaitingAuth = usePendingBookingStore((s) => s.setAwaitingAuth);

  const shouldLoadProfile = isBootstrapped && isAuthenticated && user?.role === "PATIENT" && currentStep >= 3;
  const profileQuery = useAuthProfile({ enabled: shouldLoadProfile });

  const selectedDoctor = useMemo(
    () => allDoctors.find((d) => d.id === doctorId) ?? null,
    [allDoctors, doctorId],
  );

  const selectedDoctorProfile = useMemo(
    () => rawDoctors.find((d) => d.id === doctorId) ?? null,
    [rawDoctors, doctorId],
  );

  const activeSchedule = useMemo(() => {
    if (!selectedDoctorProfile) return selectedDoctor?.weeklySchedule;
    if (bookingCategory === "physical") {
      return asScheduleDays(selectedDoctorProfile.clinicSchedule) ?? selectedDoctorProfile.weeklySchedule;
    }
    return asScheduleDays(selectedDoctorProfile.onlineSchedule) ?? selectedDoctorProfile.weeklySchedule;
  }, [bookingCategory, selectedDoctor?.weeklySchedule, selectedDoctorProfile]);

  const availableTimes = useMemo(() => {
    if (!selDate) return [];
    const parts = selDate.replace(",", "").split(" ");
    const month = MONTHS.indexOf(parts[0]);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return slotsFromSchedule(activeSchedule, WEEKDAY_NAMES[date.getDay()]);
  }, [selDate, activeSchedule]);

  const doc = selectedDoctor?.name ?? "Select a doctor";
  const fee = selectedFee || (selectedDoctor ? getSelectedFee(getDoctorFees(selectedDoctor.fee), bookingCategory, consultTypeKey) : 0);

  const { platform, tax, total } = calcPayment(fee);

  useEffect(() => {
    if (allDoctors.length === 0) return;
    const paramId = searchParams.get("doctorId");
    if (paramId) {
      const found = allDoctors.find((d) => d.id === paramId);
      if (found) {
        setDoctorId(found.id);
        setSpec(found.specialtyName);
        setBookingCategory("online");
        setConsultTypeKey("video");
        setConsultType("Video Consultation");
        setSelectedFee(found.fee);
      }
    }
  }, [searchParams, allDoctors]);

  const handleCategoryChange = useCallback((category: BookingCategory) => {
    setBookingCategory(category);
    setConsultTypeKey(null);
    setDoctorId("");
    setSelectedFee(0);
    if (category === "physical") {
      setConsultType("Physical Appointment");
    } else {
      setConsultType("");
    }
  }, []);

  const handleConsultTypeKeyChange = useCallback((key: ConsultTypeKey) => {
    setConsultTypeKey(key);
    setDoctorId("");
    setSelectedFee(0);
    setConsultType(resolveConsultTypeLabel("online", key));
  }, []);

  const handleSpecChange = useCallback((value: string) => {
    setSpec(value);
    setDoctorId("");
    setSelectedFee(0);
  }, []);

  const handleDoctorSelect = useCallback((id: string, feeAmount: number, label: string) => {
    setDoctorId(id);
    setSelectedFee(feeAmount);
    setConsultType(label);
  }, []);

  const goStep = useCallback((n: number) => {
    setCurrentStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const applyPendingBooking = useCallback((saved: PendingBookingData) => {
    isRestoringRef.current = true;
    setSpec(saved.spec);
    setDoctorId(saved.doctorId);
    setConsultType(saved.consultType);
    setSelDate(saved.selDate);
    setSelTime(saved.selTime);
    setCalMonth(saved.calMonth);
    setCalYear(saved.calYear);
    if (saved.billingName) setBillingName(saved.billingName);
    if (saved.billingEmail) setBillingEmail(saved.billingEmail);
    if (saved.billingCountry) setBillingCountry(saved.billingCountry);
    window.setTimeout(() => {
      isRestoringRef.current = false;
    }, 0);
  }, []);

  useEffect(() => {
    if (!isBootstrapped || !pendingHasHydrated || restoreAttempted.current) return;
    if (!pendingBooking?.spec || !pendingBooking?.doctorId || !pendingBooking?.selDate || !pendingBooking?.selTime) {
      return;
    }

    if (isAuthenticated && user?.role === "PATIENT") {
      restoreAttempted.current = true;
      applyPendingBooking(pendingBooking);
      if (pendingBooking.awaitingAuth) {
        setAwaitingAuth(false);
      }
      setRestoredBanner(true);
      goStep(3);
      return;
    }

    if (isAuthenticated && user && user.role !== "PATIENT" && pendingBooking.awaitingAuth) {
      restoreAttempted.current = true;
      applyPendingBooking(pendingBooking);
      setAwaitingAuth(false);
      setNonPatientBlock(true);
      goStep(2);
    }
  }, [
    applyPendingBooking,
    goStep,
    isAuthenticated,
    isBootstrapped,
    pendingBooking,
    pendingHasHydrated,
    setAwaitingAuth,
    user,
  ]);

  useEffect(() => {
    if (currentStep !== 3) {
      lastPrefilledKey.current = null;
      return;
    }
    if (!profileQuery.isSuccess || !profileQuery.data) return;

    const profile = profileQuery.data;
    const prefillKey = `${profile.id}:${profileQuery.dataUpdatedAt}`;
    if (lastPrefilledKey.current === prefillKey) return;
    lastPrefilledKey.current = prefillKey;

    const fields = extractPatientFormFields(profile);
    const fullName = `${fields.firstName} ${fields.lastName}`.trim();
    if (fullName) setBillingName(fullName);
    if (fields.email) setBillingEmail(fields.email);
    if (fields.phone) setPatientPhone(fields.phone);
    if (fields.dateOfBirth) setPatientDob(fields.dateOfBirth);
    if (fields.gender) setPatientGender(fields.gender);
  }, [currentStep, profileQuery.isSuccess, profileQuery.data, profileQuery.dataUpdatedAt]);

  useEffect(() => {
    if (!restoredBanner) return;
    const timer = setTimeout(() => setRestoredBanner(false), 8000);
    return () => clearTimeout(timer);
  }, [restoredBanner]);

  useEffect(() => {
    if (isRestoringRef.current) return;
    if (currentStep > 1 && !doctorId) {
      goStep(1);
    }
  }, [currentStep, doctorId, goStep]);

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

  const clearPatientFieldError = useCallback((field: PatientInfoField) => {
    setPatientFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const showStep3ValidationAlert = useCallback((validation: ReturnType<typeof validatePatientInfoForm>) => {
    setStep3Alert({
      title: "Please complete the required fields",
      messages: Object.values(validation.errors),
    });
    window.setTimeout(() => {
      document.querySelector<HTMLElement>(".book-consultation-page .form-group.has-error")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  }, []);

  const handleContinueToPatientDetails = async () => {
    if (!selDate || !selTime || !spec || !doctorId) return;

    setAuthVerifying(true);
    setNonPatientBlock(false);

    try {
      const { status, user: verifiedUser } = await verifyPatientSession();

      if (status === "patient" && verifiedUser) {
        setUser(verifiedUser);
        savePendingBooking({
          spec,
          doctorId,
          consultType,
          selDate,
          selTime,
          calMonth,
          calYear,
          currentStep: 3,
          billingName: billingName || `${verifiedUser.firstName} ${verifiedUser.lastName}`.trim(),
          billingEmail: billingEmail || verifiedUser.email,
          billingCountry,
          awaitingAuth: false,
        });
        goStep(3);
        return;
      }

      if (status === "unauthenticated") {
        savePendingBooking({
          spec,
          doctorId,
          consultType,
          selDate,
          selTime,
          calMonth,
          calYear,
          currentStep: 3,
          billingName,
          billingEmail,
          billingCountry,
          awaitingAuth: true,
        });
        window.location.href = bookingLoginUrl();
        return;
      }

      setNonPatientBlock(true);
    } finally {
      setAuthVerifying(false);
    }
  };

  const proceedToPayment = async () => {
    setStep3Alert(null);
    setPatientFormErrors({});
    setPaymentError("");

    if (!selectedDoctor || !selDate || !selTime || !spec || !doctorId) {
      setStep3Alert({
        title: "Booking details incomplete",
        messages: ["Please go back and select a doctor, date, and time before continuing to payment."],
      });
      return;
    }

    const validation = validatePatientInfoForm({
      billingName,
      billingEmail,
      phone: patientPhone,
      dateOfBirth: patientDob,
      gender: patientGender,
      reason: consultationReason,
    });

    if (!validation.valid) {
      setPatientFormErrors(validation.errors);
      showStep3ValidationAlert(validation);
      return;
    }

    setPaymentLoading(true);

    try {
      const { status, user: verifiedUser } = await verifyPatientSession();

      if (status === "unauthenticated") {
        savePendingBooking({
          spec,
          doctorId,
          consultType,
          selDate,
          selTime,
          calMonth,
          calYear,
          currentStep: 3,
          billingName,
          billingEmail,
          billingCountry,
          awaitingAuth: true,
        });
        setStep3Alert({
          title: "Sign in required",
          messages: ["Please sign in with a patient account to continue to payment."],
          actionHref: bookingLoginUrl(),
          actionLabel: "Sign in to continue",
        });
        return;
      }

      if (status === "non-patient") {
        setNonPatientBlock(true);
        setStep3Alert({
          title: "Patient account required",
          messages: ["Only patient accounts can book consultations. Register or sign in with a patient account."],
          actionHref: bookingRegisterUrl(),
          actionLabel: "Register as patient",
        });
        return;
      }

      if (verifiedUser) {
        setUser(verifiedUser);
      }

      const scheduledAt = parseScheduledAt(selDate, selTime, MONTHS);
      const draft = await createDraft.mutateAsync({
        doctorId: selectedDoctor.id,
        scheduledAt,
        consultationType: CONSULTATION_TYPE_MAP[consultType] ?? "VIDEO",
        durationMinutes: 30,
        reason: consultationReason.trim() || undefined,
      });
      setBookingDraftId(draft.id);
      const intent = await createIntent.mutateAsync({
        bookingDraftId: draft.id,
        billingName: billingName.trim() || undefined,
        billingEmail: billingEmail.trim() || undefined,
        billingCountry: billingCountry || undefined,
      });
      setClientSecret(intent.clientSecret);
      setProviderIntentId(intent.providerIntentId);
      goStep(4);
    } catch (err) {
      const message = extractApiErrorMessage(
        err,
        "Unable to start payment. Please log in as a patient and try again.",
      );
      setStep3Alert({
        title: "Unable to continue to payment",
        messages: [message],
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = (appointmentId: string) => {
    clearPendingBooking();
    setConfirmed(true);
    setBookingRef(appointmentId.slice(0, 13).toUpperCase());
    window.location.href = `/book-consultation/confirmation?appointmentId=${appointmentId}`;
  };

  const resetBooking = () => {
    clearPendingBooking();
    setConfirmed(false);
    setNonPatientBlock(false);
    setRestoredBanner(false);
    setCurrentStep(1);
    setBookingCategory("");
    setConsultTypeKey(null);
    setSpec("");
    setDoctorId("");
    setConsultType("Video Consultation");
    setSelectedFee(0);
    setSelDate("");
    setSelTime("");
    setPatientPhone("");
    setPatientDob("");
    setPatientGender("");
    setConsultationReason("");
    setPatientFormErrors({});
    setStep3Alert(null);
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
      const unavailable = !isDayAvailable(activeSchedule, dt);
      days.push({ day: d, past: isPast, unavailable, today: isToday, selected: isSel });
    }

    return days;
  }, [calMonth, calYear, selDate, today, activeSchedule]);

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
            <SectionTitle className="booking-title">Book Consultation</SectionTitle>
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
          {restoredBanner && (
            <div className="booking-restored-banner step-section-enter" role="status">
              <i className="ti ti-circle-check" aria-hidden="true" />
              <span>Welcome back! Your booking has been restored.</span>
            </div>
          )}

          {nonPatientBlock && (
            <div className="booking-auth-block step-section-enter" role="alert">
              <div className="booking-auth-block-icon">
                <i className="ti ti-user-exclamation" aria-hidden="true" />
              </div>
              <div className="booking-auth-block-body">
                <h3>Patient account required</h3>
                <p>
                  Only Patient accounts can book consultations. Please register a Patient account to continue.
                </p>
                <div className="booking-auth-block-actions">
                  <Link href={bookingRegisterUrl()} className="booking-auth-block-primary">
                    Register as Patient
                  </Link>
                  <button type="button" className="booking-auth-block-secondary" onClick={() => setNonPatientBlock(false)}>
                    Back
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="main">
            <div id="step-content" key={currentStep} className="step-panel step-panel-enter">
              {currentStep === 1 && (
                <BookingStep1
                  category={bookingCategory}
                  consultTypeKey={consultTypeKey}
                  spec={spec}
                  doctorId={doctorId}
                  doctorsLoading={doctorsLoading}
                  specialties={(specialtiesData ?? []).map((s) => ({ name: s.name, count: s.count }))}
                  rawDoctors={rawDoctors}
                  onCategoryChange={handleCategoryChange}
                  onConsultTypeKeyChange={handleConsultTypeKeyChange}
                  onSpecChange={handleSpecChange}
                  onDoctorSelect={handleDoctorSelect}
                  onContinue={() => goStep(2)}
                />
              )}

              {currentStep === 2 && selectedDoctor && (
                <BookingStep2
                  calMonth={calMonth}
                  calYear={calYear}
                  selDate={selDate}
                  selTime={selTime}
                  calendarDays={calendarDays}
                  availableTimes={availableTimes}
                  authVerifying={authVerifying}
                  onChangeMonth={changeMonth}
                  onPickDate={pickDate}
                  onPickTime={pickTime}
                  onBack={() => goStep(1)}
                  onContinue={handleContinueToPatientDetails}
                />
              )}

              {currentStep === 3 && (
                <div id="step3">
                  {step3Alert && (
                    <div className="booking-validation-alert step-section-enter" role="alert">
                      <div className="booking-validation-alert-icon">
                        <i className="ti ti-alert-circle" aria-hidden="true" />
                      </div>
                      <div className="booking-validation-alert-body">
                        <h3>{step3Alert.title}</h3>
                        {step3Alert.messages.length === 1 ? (
                          <p>{step3Alert.messages[0]}</p>
                        ) : (
                          <ul className="booking-validation-alert-list">
                            {step3Alert.messages.map((message) => (
                              <li key={message}>{message}</li>
                            ))}
                          </ul>
                        )}
                        <div className="booking-validation-alert-actions">
                          {step3Alert.actionHref && step3Alert.actionLabel && (
                            <Link href={step3Alert.actionHref} className="booking-validation-alert-primary">
                              {step3Alert.actionLabel}
                            </Link>
                          )}
                          <button
                            type="button"
                            className="booking-validation-alert-dismiss"
                            onClick={() => setStep3Alert(null)}
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-panel step-section-enter">
                    <div className="panel-title">
                      <i className="ti ti-user" aria-hidden="true" /> Patient Information
                    </div>
                    <div className="panel-sub">Your details are encrypted and HIPAA-protected</div>
                    <div className="form-row">
                      <div className={`form-group${patientFormErrors.firstName ? " has-error" : ""}`}>
                        <label>First Name</label>
                        <input
                          type="text"
                          placeholder="John"
                          value={billingName.split(" ")[0] ?? ""}
                          onChange={(e) => {
                            const last = billingName.split(" ").slice(1).join(" ");
                            setBillingName(last ? `${e.target.value} ${last}` : e.target.value);
                            clearPatientFieldError("firstName");
                          }}
                        />
                        {patientFormErrors.firstName && (
                          <span className="field-error">{patientFormErrors.firstName}</span>
                        )}
                      </div>
                      <div className={`form-group${patientFormErrors.lastName ? " has-error" : ""}`}>
                        <label>Last Name</label>
                        <input
                          type="text"
                          placeholder="Smith"
                          value={billingName.split(" ").slice(1).join(" ")}
                          onChange={(e) => {
                            const first = billingName.split(" ")[0] ?? "";
                            setBillingName(first ? `${first} ${e.target.value}` : e.target.value);
                            clearPatientFieldError("lastName");
                          }}
                        />
                        {patientFormErrors.lastName && (
                          <span className="field-error">{patientFormErrors.lastName}</span>
                        )}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className={`form-group${patientFormErrors.email ? " has-error" : ""}`}>
                        <label>Email Address</label>
                        <input
                          type="email"
                          placeholder="john@example.com"
                          value={billingEmail}
                          onChange={(e) => {
                            setBillingEmail(e.target.value);
                            clearPatientFieldError("email");
                          }}
                        />
                        {patientFormErrors.email && (
                          <span className="field-error">{patientFormErrors.email}</span>
                        )}
                      </div>
                      <div className={`form-group${patientFormErrors.phone ? " has-error" : ""}`}>
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={patientPhone}
                          onChange={(e) => {
                            setPatientPhone(e.target.value);
                            clearPatientFieldError("phone");
                          }}
                        />
                        {patientFormErrors.phone && (
                          <span className="field-error">{patientFormErrors.phone}</span>
                        )}
                      </div>
                    </div>
                    <div className="form-row">
                      <div className={`form-group${patientFormErrors.dateOfBirth ? " has-error" : ""}`}>
                        <label>Date of Birth</label>
                        <input
                          type="date"
                          value={patientDob}
                          onChange={(e) => {
                            setPatientDob(e.target.value);
                            clearPatientFieldError("dateOfBirth");
                          }}
                        />
                        {patientFormErrors.dateOfBirth && (
                          <span className="field-error">{patientFormErrors.dateOfBirth}</span>
                        )}
                      </div>
                      <div className={`form-group${patientFormErrors.gender ? " has-error" : ""}`}>
                        <label>Biological Sex</label>
                        <select
                          value={patientGender}
                          onChange={(e) => {
                            setPatientGender(e.target.value);
                            clearPatientFieldError("gender");
                          }}
                        >
                          <option value="">Select...</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Prefer not to say</option>
                          <option>Other</option>
                        </select>
                        {patientFormErrors.gender && (
                          <span className="field-error">{patientFormErrors.gender}</span>
                        )}
                      </div>
                    </div>
                    <div className="form-row single">
                      <div className={`form-group${patientFormErrors.reason ? " has-error" : ""}`}>
                        <label>Reason for Consultation</label>
                        <textarea
                          placeholder="Briefly describe your symptoms, concerns, or what you'd like to discuss with the doctor..."
                          value={consultationReason}
                          onChange={(e) => {
                            setConsultationReason(e.target.value);
                            clearPatientFieldError("reason");
                          }}
                        />
                        {patientFormErrors.reason && (
                          <span className="field-error">{patientFormErrors.reason}</span>
                        )}
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
                    <button
                      type="button"
                      className="btn-next"
                      onClick={proceedToPayment}
                      disabled={paymentLoading || createDraft.isPending || createIntent.isPending}
                    >
                      {paymentLoading || createDraft.isPending || createIntent.isPending ? (
                        <>
                          <span className="pay-spinner" aria-hidden="true" /> Preparing payment...
                        </>
                      ) : (
                        <>
                          Continue to Payment <i className="ti ti-arrow-right" aria-hidden="true" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div id="step4">
                  <div className="form-panel step-section-enter">
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
                    <button type="button" className="btn-back" onClick={() => goStep(3)}>
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
              <a href="mailto:drinsightofficial@gmail.com">drinsightofficial@gmail.com</a>
            </span>
          </div>
        </div>
      )}

      <div className={`confirm-page${confirmed ? " show" : ""}`}>
        <div className="confirm-circle">
          <i className="ti ti-circle-check" aria-hidden="true" />
        </div>
        <SectionTitle>Booking Confirmed!</SectionTitle>
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
