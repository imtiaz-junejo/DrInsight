"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatStatCount } from "@/lib/data-mappers";
import { usePlatformStats } from "@/services/api-hooks";
import { useAuthStore, type AuthUser } from "@/store/auth.store";
import { AuthSocialButtons } from "@/components/auth/AuthSocialButtons";
import { SectionTitle } from "@/components/public/section-heading";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingSelect } from "@/components/ui/floating-select";
import {
  clearOAuthLoadingProvider,
  dashboardForRole,
  resolvePostLoginPath,
  startOAuth,
  type OAuthProviderName,
} from "@/lib/oauth";
import { BOOKING_RETURN_PATH, isBookingAuthFlow } from "@/lib/booking-auth";
import { invalidateAuthProfile } from "@/services/patient-api-hooks";

type AccountType = "patient" | "physician" | "";
type SubType =
  | "indiv"
  | "parent"
  | "caregiver"
  | "student"
  | "specialist"
  | "gp"
  | "surgeon"
  | "resident"
  | "";

type RegisterResponse =
  | { accessToken: string; refreshToken: string; user: AuthUser }
  | { requiresApproval: true; message: string; user: AuthUser };

const PATIENT_SUBS = [
  { id: "indiv" as const, icon: "👤", title: "Individual Patient", desc: "Managing my own health" },
  { id: "parent" as const, icon: "👨‍👩‍👦", title: "Parent / Guardian", desc: "Managing health of a child" },
  { id: "caregiver" as const, icon: "👴", title: "Caregiver for Elder", desc: "Caring for an elderly family member" },
  { id: "student" as const, icon: "🎓", title: "Medical Student", desc: "Studying medicine or health science" },
];

const PHYSICIAN_SUBS = [
  { id: "specialist" as const, icon: "🩺", title: "Specialist Doctor", desc: "Board-certified in a specialty" },
  { id: "gp" as const, icon: "🔬", title: "General Practitioner", desc: "Primary care / family medicine" },
  { id: "surgeon" as const, icon: "💊", title: "Surgeon", desc: "Surgical specialty practice" },
  { id: "resident" as const, icon: "🏥", title: "Resident / Fellow", desc: "Postgraduate training" },
];

const PATIENT_HEALTH_TAGS = [
  "❤️ Cardiology",
  "🧠 Neurology",
  "🦋 Endocrinology",
  "🍽️ Gastroenterology",
  "🫘 Nephrology",
  "🧴 Dermatology",
  "🧠 Mental Health",
  "🧒 Pediatrics",
  "🦴 Rheumatology",
  "🫁 Pulmonology",
  "🎗️ Oncology",
  "🦠 Infectious Disease",
  "💊 Medications",
  "🏃 Sports Medicine",
  "😴 Sleep Medicine",
  "🧬 Genetics",
];

const PHYSICIAN_CLINICAL_TAGS = [
  "❤️ Cardiology",
  "🧠 Neurology",
  "🦋 Endocrinology",
  "🍽️ Gastroenterology",
  "🧴 Dermatology",
  "🧠 Mental Health",
  "🫁 Pulmonology",
  "🎗️ Oncology",
];

const LEFT_DEFAULT = {
  eyebrow: "FREE ACCOUNT — NO CREDIT CARD REQUIRED",
  para: "Access trusted medical information, expert consultations, and powerful health tools — all in one place.",
  benefits: [
    { icon: "🔖", title: "Save Articles & Guides", desc: "Bookmark any article for quick access anytime" },
    { icon: "💬", title: "Ask the Doctor", desc: "Submit questions and track responses from specialists" },
    { icon: "📅", title: "Book Consultations", desc: "Schedule video, phone, or chat with our doctors" },
    { icon: "📊", title: "Health Dashboard", desc: "Track your health tool results and history" },
  ],
};

const LEFT_PATIENT = {
  eyebrow: "FREE PATIENT ACCOUNT",
  para: "Everything you need to manage your health in one secure, trusted platform.",
  benefits: LEFT_DEFAULT.benefits,
};

const LEFT_PHYSICIAN = {
  eyebrow: "PHYSICIAN ACCOUNT",
  para: "Connect with patients and build your medical reputation on a trusted platform.",
  benefits: [
    { icon: "✍️", title: "Publish Articles", desc: "Reach patients with your expertise" },
    { icon: "🔬", title: "Review & Shape Content", desc: "Peer-review articles in your specialty" },
    { icon: "💬", title: "Answer Patient Questions", desc: "Respond to Ask the Doctor queries" },
    { icon: "🎓", title: "CPD/CME Recognition", desc: "Receive recognition letters for contributions" },
  ],
};

function getPasswordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const PW_HINTS: Record<number, string> = {
  0: "Enter a password to see strength",
  1: "Weak — too short",
  2: "Fair — add numbers or symbols",
  3: "Good — add uppercase for best security",
  4: "Strong password ✓",
};

const PW_COLOR: Record<number, string> = {
  1: "weak",
  2: "fair",
  3: "good",
  4: "strong",
};

export function RegisterForm() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const fromBooking = isBookingAuthFlow(searchParams);
  const bookingRedirect = searchParams.get("redirect") || BOOKING_RETURN_PATH;
  const setAuth = useAuthStore((state) => state.setAuth);

  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>("");
  const [subType, setSubType] = useState<SubType>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [oauthLoading, setOauthLoading] = useState<OAuthProviderName | null>(null);
  const [oauthPendingCode, setOauthPendingCode] = useState<string | null>(null);
  const [oauthCompleteEmail, setOauthCompleteEmail] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  const [country, setCountry] = useState("");
  const [primarySpecialty, setPrimarySpecialty] = useState("Cardiology");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [patientTags, setPatientTags] = useState<Set<string>>(new Set());
  const [physicianTags, setPhysicianTags] = useState<Set<string>>(new Set());
  const [contribSelected, setContribSelected] = useState<Set<number>>(new Set());

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [twofa, setTwofa] = useState(false);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);
  const [agree4, setAgree4] = useState(false);

  const pwScore = getPasswordScore(password);
  const { data: stats } = usePlatformStats();

  const leftPanel = useMemo(() => {
    const patientCount = stats ? formatStatCount(stats.patientsServed ?? stats.patientCount) : "—";
    const doctorCount = stats ? formatStatCount(stats.doctorCount) : "—";
    const panelStats = [
      { num: patientCount, label: "Active patients" },
      { num: doctorCount, label: "Specialist doctors" },
      { num: accountType === "physician" ? String(stats?.specialtyCount ?? "—") : "Free", label: accountType === "physician" ? "Specialties" : "Always free to join" },
    ];

    if (accountType === "patient") {
      return {
        ...LEFT_PATIENT,
        title: (
          <>
            Your Personal <span>Health Hub</span>
          </>
        ),
        stats: panelStats,
      };
    }
    if (accountType === "physician") {
      return {
        ...LEFT_PHYSICIAN,
        title: (
          <>
            Join Our <span>Expert Medical Network</span>
          </>
        ),
        stats: panelStats,
      };
    }
    return {
      ...LEFT_DEFAULT,
      title: (
        <>
          Join <span>{patientCount}</span> Informed Patients
        </>
      ),
      stats: panelStats,
    };
  }, [accountType, stats]);

  const step2Subtitle =
    accountType === "physician" ? "Your professional details" : "Tell us a little about yourself";

  const registerMutation = useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: "PATIENT" | "DOCTOR";
      phone?: string;
      dateOfBirth?: string;
      gender?: string;
      specialty?: string;
      licenseNumber?: string;
    }) => {
      const { data } = await api.post<RegisterResponse>("/auth/register", payload);
      return data;
    },
    onSuccess: (data) => {
      if ("requiresApproval" in data && data.requiresApproval) {
        setSuccessMsg(
          "Welcome! Your account is under review. We'll verify your credentials within 24–48 hours and notify you by email.",
        );
        setSuccess(true);
        setError("");
        return;
      }
      if ("accessToken" in data && data.accessToken) {
        setAuth(data.user, data.accessToken, data.refreshToken);
        void invalidateAuthProfile(queryClient);
        if (fromBooking && data.user.role === "PATIENT") {
          setSuccessMsg("Welcome to DrInsight! Resuming your consultation booking...");
          setSuccess(true);
          setError("");
          window.setTimeout(() => {
            window.location.assign(resolvePostLoginPath(data.user.role, bookingRedirect));
          }, 1200);
          return;
        }
        setSuccessMsg("Welcome to DrInsight! We've sent a verification email to your inbox.");
        setSuccess(true);
        setError("");
      }
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message;
        if (Array.isArray(message)) {
          showErr(message.join(", "));
          return;
        }
        if (typeof message === "string" && message) {
          showErr(message);
          return;
        }
        if (!err.response) {
          showErr("Cannot reach the server. Make sure the backend is running on port 4000.");
          return;
        }
      }
      showErr("Unable to create account. Check your details and try again.");
    },
  });

  const showErr = useCallback((msg: string) => {
    setError(msg);
  }, []);

  useEffect(() => {
    clearOAuthLoadingProvider();
    setOauthLoading(null);

    const params = new URLSearchParams(window.location.search);
    const pending = params.get("oauthPending");
    if (pending) {
      setOauthPendingCode(pending);
      setAccountType("patient");
    } else if (params.get("from") === "booking" || params.get("account") === "patient") {
      setAccountType("patient");
    }
  }, []);

  const completeOAuthMutation = useMutation({
    mutationFn: async (payload: { code: string; email: string }) => {
      const { data } = await api.post<{
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
      }>("/auth/oauth/complete-registration", payload);
      return data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      setError("");
      void invalidateAuthProfile(queryClient);
      const destination = fromBooking
        ? resolvePostLoginPath(data.user.role, bookingRedirect)
        : dashboardForRole(data.user.role);
      window.location.assign(destination);
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message;
        if (Array.isArray(message)) {
          showErr(message.join(", "));
          return;
        }
        if (typeof message === "string" && message) {
          showErr(message);
          return;
        }
      }
      showErr("Unable to complete Facebook registration. Please try again.");
    },
  });

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(timer);
  }, [error]);

  function handleOAuth(provider: OAuthProviderName) {
    setError("");
    setOauthLoading(provider);
    startOAuth(provider, fromBooking ? bookingRedirect : searchParams.get("redirect"));
  }

  function handleCompleteOAuthRegistration() {
    const email = oauthCompleteEmail.trim().toLowerCase();
    if (!oauthPendingCode) return;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErr("Please enter a valid email address.");
      return;
    }
    setError("");
    completeOAuthMutation.mutate({ code: oauthPendingCode, email });
  }

  function selectType(type: "patient" | "physician") {
    setAccountType(type);
    setSubType("");
  }

  function selectSub(sub: SubType) {
    setSubType(sub);
  }

  function toggleTag(tag: string, isPhysician: boolean) {
    if (isPhysician) {
      setPhysicianTags((prev) => {
        const next = new Set(prev);
        if (next.has(tag)) next.delete(tag);
        else next.add(tag);
        return next;
      });
    } else {
      setPatientTags((prev) => {
        const next = new Set(prev);
        if (next.has(tag)) next.delete(tag);
        else next.add(tag);
        return next;
      });
    }
  }

  function toggleContrib(index: number) {
    setContribSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function hideErr() {
    setError("");
  }

  function goStep(step: number) {
    if (step === 2 && currentStep === 1) {
      if (!accountType) {
        showErr("Please select an account type (Patient or Physician).");
        return;
      }
      if (!subType) {
        showErr("Please select your sub-type.");
        return;
      }
    }
    if (step === 3 && currentStep === 2) {
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        showErr("Please fill in first name, last name, and email.");
        return;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email.trim())) {
        showErr("Please enter a valid email address.");
        return;
      }
    }
    if (step === 4 && currentStep === 3) {
      const tags = accountType === "physician" ? physicianTags : patientTags;
      if (tags.size === 0) {
        showErr("Please select at least one health interest.");
        return;
      }
    }
    hideErr();
    setCurrentStep(step);
  }

  function submitForm() {
    if (password.length < 8) {
      showErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      showErr("Passwords do not match.");
      return;
    }
    if (!agree1 || !agree2) {
      showErr("Please accept the required agreements to continue.");
      return;
    }
    if (accountType === "physician" && !agree4) {
      showErr("Physicians must confirm license validity.");
      return;
    }

    const specialty =
      accountType === "physician"
        ? subType === "specialist"
          ? primarySpecialty
          : subType === "gp"
            ? "General Practice"
            : subType === "surgeon"
              ? "Surgery"
              : subType === "resident"
                ? "Resident"
                : "General Medicine"
        : undefined;

    registerMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      phone: phone.trim() || undefined,
      dateOfBirth: dob || undefined,
      gender: accountType === "patient" ? gender : undefined,
      role: accountType === "physician" ? "DOCTOR" : "PATIENT",
      specialty,
      licenseNumber: accountType === "physician" ? licenseNumber.trim() || `PENDING-${Date.now()}` : undefined,
    });
  }

  function renderExtraFields() {
    if (accountType === "patient") {
      if (subType === "indiv" || subType === "") {
        return null;
      }
      if (subType === "parent") {
        return (
          <div className="form-row">
            <div className="form-group">
              <FloatingInput type="date" label="Child's Date of Birth" />
            </div>
            <div className="form-group">
              <FloatingSelect label="Relationship" defaultValue="Parent">
                <option>Parent</option>
                <option>Legal Guardian</option>
                <option>Other</option>
              </FloatingSelect>
            </div>
          </div>
        );
      }
      if (subType === "caregiver") {
        return (
          <div className="form-group">
            <FloatingSelect label="Patient's Approximate Age Range" defaultValue="60–70">
              <option>60–70</option>
              <option>70–80</option>
              <option>80–90</option>
              <option>90+</option>
            </FloatingSelect>
          </div>
        );
      }
      if (subType === "student") {
        return (
          <div className="form-row">
            <div className="form-group">
              <FloatingInput type="text" label="University / Institution" />
            </div>
            <div className="form-group">
              <FloatingSelect label="Year of Study" defaultValue="Year 1">
                <option>Year 1</option>
                <option>Year 2</option>
                <option>Year 3</option>
                <option>Year 4</option>
                <option>Year 5</option>
                <option>Year 6</option>
                <option>Postgrad</option>
              </FloatingSelect>
            </div>
          </div>
        );
      }
    }

    if (accountType === "physician") {
      let extra = (
        <div className="form-row">
          <div className="form-group">
            <FloatingInput type="text" label="Hospital / Clinic" />
          </div>
          <div className="form-group">
            <FloatingInput type="text" label="City of Practice" />
          </div>
        </div>
      );

      if (subType === "specialist") {
        extra = (
          <>
            {extra}
            <div className="form-group">
              <FloatingSelect
                label="Primary Specialty"
                value={primarySpecialty}
                onChange={(e) => setPrimarySpecialty(e.target.value)}
              >
                <option>Cardiology</option>
                <option>Neurology</option>
                <option>Endocrinology</option>
                <option>Gastroenterology</option>
                <option>Dermatology</option>
                <option>Oncology</option>
                <option>Pulmonology</option>
                <option>Other</option>
              </FloatingSelect>
            </div>
          </>
        );
      } else if (subType === "gp") {
        extra = (
          <>
            {extra}
            <div className="form-group">
              <FloatingSelect label="Years in Practice" defaultValue="1–5">
                <option>1–5</option>
                <option>5–10</option>
                <option>10–20</option>
                <option>20+</option>
              </FloatingSelect>
            </div>
          </>
        );
      } else if (subType === "surgeon") {
        extra = (
          <>
            {extra}
            <div className="form-row">
              <div className="form-group">
                <FloatingInput type="text" label="Surgical Specialty" />
              </div>
              <div className="form-group">
                <FloatingSelect label="Type of Practice" defaultValue="Public Hospital">
                  <option>Public Hospital</option>
                  <option>Private</option>
                  <option>Academic</option>
                </FloatingSelect>
              </div>
            </div>
          </>
        );
      } else if (subType === "resident") {
        extra = (
          <>
            {extra}
            <div className="form-row">
              <div className="form-group">
                <FloatingInput type="text" label="Training Program" />
              </div>
              <div className="form-group">
                <FloatingSelect label="Year of Training" defaultValue="PGY-1">
                  <option>PGY-1</option>
                  <option>PGY-2</option>
                  <option>PGY-3</option>
                  <option>PGY-4</option>
                  <option>PGY-5</option>
                  <option>PGY-6</option>
                  <option>PGY-7</option>
                </FloatingSelect>
              </div>
            </div>
          </>
        );
      }

      return extra;
    }

    return null;
  }

  const displayStep = success ? 5 : currentStep;

  return (
    <div className="reg-wrap">
      <div className="reg-left">
        <div className="bg-pattern" />
        <div className="deco-circle deco-c1" />
        <div className="deco-circle deco-c2" />
        <div className="ll-content">
          <div className="ll-eyebrow">{leftPanel.eyebrow}</div>
          <h1 className="ll-h1">{leftPanel.title}</h1>
          <p className="ll-para">{leftPanel.para}</p>
          <div className="benefit-cards">
            {leftPanel.benefits.map((b) => (
              <div key={b.title} className="benefit-card">
                <span className="bc-icon">{b.icon}</span>
                <div>
                  <div className="bc-title">{b.title}</div>
                  <div className="bc-desc">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="ll-stats">
            {leftPanel.stats.map((s) => (
              <div key={s.label}>
                <span className="ll-stat-num">{s.num}</span>
                <span className="ll-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="reg-right">
        <div className="reg-card">
          <div className="step-bar">
            {[1, 2, 3, 4].flatMap((i) => [
              <div key={`step-${i}`} className="step-item">
                <div
                  className={cn(
                    "step-dot",
                    i < displayStep ? "done" : i === displayStep ? "active" : "pending",
                  )}
                >
                  {i < displayStep ? "✓" : i}
                </div>
                <span className="step-label">
                  {i === 1 ? "Account Type" : i === 2 ? "Your Details" : i === 3 ? "Specialty Info" : "Security"}
                </span>
              </div>,
              i < 4 ? (
                <div key={`line-${i}`} className={cn("step-line", i < displayStep && "done")} />
              ) : null,
            ])}
          </div>

          <div className={cn("alert", error && "error")}>{error ? `⚠️ ${error}` : null}</div>

          {!success && oauthPendingCode && (
            <div id="oauth-complete">
              <SectionTitle className="step-title">Complete Facebook Registration</SectionTitle>
              <p className="step-subtitle">
                Facebook authenticated successfully, but your account does not expose an email address.
                Enter your email to finish creating your patient account.
              </p>
              <div className="form-group">
                <FloatingInput
                  type="email"
                  label="Email Address"
                  value={oauthCompleteEmail}
                  onChange={(e) => setOauthCompleteEmail(e.target.value)}
                />
              </div>
              <div className="btn-row">
                <button
                  type="button"
                  className="btn-next"
                  onClick={handleCompleteOAuthRegistration}
                  disabled={completeOAuthMutation.isPending}
                >
                  {completeOAuthMutation.isPending ? "Creating account..." : "Complete Registration →"}
                </button>
              </div>
              <p className="login-link">
                Already have an account? <Link href="/login">Sign in here</Link>
              </p>
            </div>
          )}

          {!success && !oauthPendingCode && currentStep === 1 && (
            <div id="step1">
              <SectionTitle className="step-title">Create Your Account</SectionTitle>
              <p className="step-subtitle">Choose how you&apos;ll be using DrInsight</p>

              {fromBooking && (
                <div className="register-booking-notice">
                  Create a free Patient account to continue booking your consultation. Your selections will be
                  restored automatically.
                </div>
              )}

              <div className="type-grid">
                <div
                  className={cn("type-card", accountType === "patient" && "selected")}
                  onClick={() => selectType("patient")}
                  onKeyDown={(e) => e.key === "Enter" && selectType("patient")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="tc-icon">🏥</div>
                  <div className="tc-title">Register as PATIENT</div>
                  <div className="tc-desc">I&apos;m seeking medical info or consultations</div>
                </div>
                <div
                  className={cn("type-card", accountType === "physician" && "selected")}
                  onClick={() => selectType("physician")}
                  onKeyDown={(e) => e.key === "Enter" && selectType("physician")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="tc-icon">👨‍⚕️</div>
                  <div className="tc-title">Register as PHYSICIAN</div>
                  <div className="tc-desc">I&apos;m a licensed healthcare professional</div>
                </div>
              </div>

              {accountType === "patient" && (
                <div id="patientSubs">
                  <div className="sub-section-label">I am a…</div>
                  <div className="sub-grid">
                    {PATIENT_SUBS.map((s) => (
                      <div
                        key={s.id}
                        className={cn("sub-card", subType === s.id && "selected")}
                        onClick={() => selectSub(s.id)}
                        onKeyDown={(e) => e.key === "Enter" && selectSub(s.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="sc-icon">{s.icon}</div>
                        <div className="sc-title">{s.title}</div>
                        <div className="sc-desc">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {accountType === "physician" && (
                <div id="physicianSubs">
                  <div className="sub-section-label">I am a…</div>
                  <div className="sub-grid">
                    {PHYSICIAN_SUBS.map((s) => (
                      <div
                        key={s.id}
                        className={cn("sub-card", subType === s.id && "selected")}
                        onClick={() => selectSub(s.id)}
                        onKeyDown={(e) => e.key === "Enter" && selectSub(s.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="sc-icon">{s.icon}</div>
                        <div className="sc-title">{s.title}</div>
                        <div className="sc-desc">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <AuthSocialButtons
                className="social-grid"
                onOAuth={handleOAuth}
                oauthLoading={oauthLoading}
              />
              <div className="divider">or register with email</div>
              <div className="btn-row">
                <button type="button" className="btn-next" onClick={() => goStep(2)}>
                  Continue with Email →
                </button>
              </div>
              <p className="login-link">
                Already have an account? <Link href="/login">Sign in here</Link>
              </p>
            </div>
          )}

          {!success && !oauthPendingCode && currentStep === 2 && (
            <div id="step2">
              <SectionTitle className="step-title">Personal Information</SectionTitle>
              <p className="step-subtitle">{step2Subtitle}</p>

              <div className="form-row">
                <div className="form-group">
                  <FloatingInput
                    type="text"
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <FloatingInput
                    type="text"
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <FloatingInput
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <FloatingInput
                  type="tel"
                  label="Phone Number"
                  hint="Optional"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <FloatingInput
                    type="date"
                    label="Date of Birth"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <FloatingSelect label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
                    <option value="">Select country…</option>
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Pakistan</option>
                    <option>India</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Other</option>
                  </FloatingSelect>
                </div>
              </div>

              {accountType === "patient" && (
                <div className="form-group">
                  <FloatingSelect
                    label="Biological Sex / Gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Prefer not to say</option>
                    <option>Other</option>
                  </FloatingSelect>
                </div>
              )}

              <div id="extraFields">{renderExtraFields()}</div>

              <div className="btn-row">
                <button type="button" className="btn-back" onClick={() => goStep(1)}>
                  ← Back
                </button>
                <button type="button" className="btn-next" onClick={() => goStep(3)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {!success && !oauthPendingCode && currentStep === 3 && (
            <div id="step3">
              {accountType !== "physician" && (
                <div id="step3patient">
                  <SectionTitle className="step-title">Your Health Profile</SectionTitle>
                  <p className="step-subtitle">Help us personalise your experience</p>
                  <div className="form-group">
                    <label className="form-label">
                      Health Interests{" "}
                      <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(select all that apply)</span>
                    </label>
                    <div className="tag-cloud">
                      {PATIENT_HEALTH_TAGS.map((tag) => (
                        <span
                          key={tag}
                          className={cn("tag-pill", patientTags.has(tag) && "selected")}
                          onClick={() => toggleTag(tag, false)}
                          onKeyDown={(e) => e.key === "Enter" && toggleTag(tag, false)}
                          role="button"
                          tabIndex={0}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Content Type</label>
                    <RadioPills
                      options={[
                        "📖 Patient-friendly articles",
                        "🔬 Clinical / technical content",
                        "📋 Both",
                      ]}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Newsletter Frequency</label>
                    <RadioPills
                      options={["Daily digest", "Weekly highlights", "Monthly roundup", "No newsletter"]}
                    />
                  </div>
                  <div className="form-group">
                    <FloatingSelect label="Language Preference" defaultValue="English">
                      <option>English</option>
                      <option>Urdu</option>
                      <option>Arabic</option>
                      <option>Hindi</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Spanish</option>
                      <option>Other</option>
                    </FloatingSelect>
                  </div>
                </div>
              )}

              {accountType === "physician" && (
                <div id="step3physician">
                  <SectionTitle className="step-title">Professional Profile</SectionTitle>
                  <p className="step-subtitle">Help us match you with relevant clinical content</p>
                  <div className="form-group">
                    <FloatingInput
                      type="text"
                      label="Medical License Number"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                    />
                    <p className="input-note">⚠️ License will be verified before author/reviewer access is granted</p>
                  </div>
                  <div className="form-group">
                    <FloatingSelect label="Regulatory Body / Medical Council" defaultValue="Pakistan Medical Commission (PMC)">
                      <option>Pakistan Medical Commission (PMC)</option>
                      <option>General Medical Council (GMC — UK)</option>
                      <option>American Medical Association (AMA)</option>
                      <option>Medical Council of India (MCI)</option>
                      <option>Australian Medical Association (AMA-AU)</option>
                      <option>Other</option>
                    </FloatingSelect>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Clinical Interests</label>
                    <div className="tag-cloud">
                      {PHYSICIAN_CLINICAL_TAGS.map((tag) => (
                        <span
                          key={tag}
                          className={cn("tag-pill", physicianTags.has(tag) && "selected")}
                          onClick={() => toggleTag(tag, true)}
                          onKeyDown={(e) => e.key === "Enter" && toggleTag(tag, true)}
                          role="button"
                          tabIndex={0}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Would you like to contribute?</label>
                    <div className="contrib-grid">
                      {[
                        { icon: "✍️", title: "Write Articles", desc: "Share your clinical expertise with patients" },
                        { icon: "🔬", title: "Review Content", desc: "Peer-review articles in your specialty" },
                        { icon: "💬", title: "Answer Patient Questions", desc: "Respond to Ask the Doctor queries" },
                      ].map((c, i) => (
                        <div
                          key={c.title}
                          className={cn("contrib-card", contribSelected.has(i) && "selected")}
                          onClick={() => toggleContrib(i)}
                          onKeyDown={(e) => e.key === "Enter" && toggleContrib(i)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="cc-icon">{c.icon}</div>
                          <div className="cc-title">{c.title}</div>
                          <div className="cc-desc">{c.desc}</div>
                        </div>
                      ))}
                    </div>
                    {contribSelected.size > 0 && (
                      <div className="contrib-note">
                        📋 You&apos;ll need to complete a contributor agreement after registration
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="btn-row">
                <button type="button" className="btn-back" onClick={() => goStep(2)}>
                  ← Back
                </button>
                <button type="button" className="btn-next" onClick={() => goStep(4)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {!success && !oauthPendingCode && currentStep === 4 && (
            <div id="step4">
              <SectionTitle className="step-title">Secure Your Account</SectionTitle>
              <p className="step-subtitle">Create a strong password to protect your health data</p>

              <div className="form-group">
                <FloatingInput
                  type={showPw1 ? "text" : "password"}
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showPasswordToggle
                  passwordVisible={showPw1}
                  onPasswordToggle={() => setShowPw1((v) => !v)}
                />
                <div className="pw-bar">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn("pw-seg", i <= pwScore && pwScore > 0 && PW_COLOR[pwScore])}
                    />
                  ))}
                </div>
                <div className="pw-hint">{PW_HINTS[pwScore] ?? PW_HINTS[0]}</div>
              </div>

              <div className="form-group">
                <FloatingInput
                  type={showPw2 ? "text" : "password"}
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  showPasswordToggle
                  passwordVisible={showPw2}
                  onPasswordToggle={() => setShowPw2((v) => !v)}
                  suffix={
                    confirmPassword ? (
                      <span
                        className="absolute right-10 top-1/2 z-10 -translate-y-1/2 text-[.9rem]"
                        style={{ color: password === confirmPassword ? "var(--green)" : "var(--red)" }}
                      >
                        {password === confirmPassword ? "✓" : "✗"}
                      </span>
                    ) : null
                  }
                />
              </div>

              <div className="toggle-row">
                <label className="toggle-switch">
                  <input type="checkbox" checked={twofa} onChange={(e) => setTwofa(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
                <span className="toggle-label">Enable 2FA via email OTP</span>
              </div>
              {twofa && (
                <div className="twofa-note">
                  📧 A verification code will be sent to your email each time you log in
                </div>
              )}

              <div className="agree-row">
                <input type="checkbox" id="agree1" checked={agree1} onChange={(e) => setAgree1(e.target.checked)} />
                <label htmlFor="agree1">
                  I agree to the <Link href="/terms-conditions">Terms &amp; Conditions</Link> and{" "}
                  <Link href="/privacy-policy">Privacy Policy</Link>
                </label>
              </div>
              <div className="agree-row">
                <input type="checkbox" id="agree2" checked={agree2} onChange={(e) => setAgree2(e.target.checked)} />
                <label htmlFor="agree2">
                  I understand this platform provides educational health information only — not a substitute for
                  professional medical advice
                </label>
              </div>
              <div className="agree-row">
                <input type="checkbox" id="agree3" checked={agree3} onChange={(e) => setAgree3(e.target.checked)} />
                <label htmlFor="agree3">Send me weekly health insights from our doctors (optional)</label>
              </div>
              {accountType === "physician" && (
                <div className="agree-row" id="physicianAgree">
                  <input type="checkbox" id="agree4" checked={agree4} onChange={(e) => setAgree4(e.target.checked)} />
                  <label htmlFor="agree4">
                    I confirm that my medical license is valid and in good standing. I understand misrepresentation
                    will result in permanent account suspension.
                  </label>
                </div>
              )}

              <div className="btn-row">
                <button type="button" className="btn-back" onClick={() => goStep(3)}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn-next"
                  id="submitBtn"
                  disabled={registerMutation.isPending}
                  onClick={submitForm}
                >
                  {registerMutation.isPending
                    ? "Creating account..."
                    : accountType === "physician"
                      ? "🩺 Create My Physician Account"
                      : "🎉 Create My Free Account"}
                </button>
              </div>
            </div>
          )}

          {success && (
            <div id="successState">
              <div className="success-state">
                <div className="success-icon">✅</div>
                <h3 className="success-h3">Account Created Successfully!</h3>
                <p className="success-para" id="successMsg">
                  {successMsg}
                </p>
                <Link
                  href={
                    fromBooking && accountType !== "physician"
                      ? bookingRedirect
                      : accountType === "physician"
                        ? "/login"
                        : "/patient"
                  }
                  className="success-btn"
                >
                  {fromBooking && accountType !== "physician"
                    ? "Continue Booking →"
                    : "Go to My Dashboard →"}
                </Link>
                <button type="button" className="resend-link">
                  Didn&apos;t receive the email? Resend verification
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RadioPills({ options }: { options: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="radio-pills">
      {options.map((opt) => (
        <span
          key={opt}
          className={cn("radio-pill", selected === opt && "selected")}
          onClick={() => setSelected(opt)}
          onKeyDown={(e) => e.key === "Enter" && setSelected(opt)}
          role="button"
          tabIndex={0}
        >
          {opt}
        </span>
      ))}
    </div>
  );
}
