"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore, type AuthUser } from "@/store/auth.store";

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
  title: (
    <>
      Join <span>500,000+</span> Informed Patients
    </>
  ),
  para: "Access trusted medical information, expert consultations, and powerful health tools — all in one place.",
  benefits: [
    { icon: "🔖", title: "Save Articles & Guides", desc: "Bookmark any article for quick access anytime" },
    { icon: "💬", title: "Ask the Doctor", desc: "Submit questions and track responses from specialists" },
    { icon: "📅", title: "Book Consultations", desc: "Schedule video, phone, or chat with our doctors" },
    { icon: "📊", title: "Health Dashboard", desc: "Track your health tool results and history" },
  ],
  stats: [
    { num: "500K+", label: "Active patients" },
    { num: "200+", label: "Specialist doctors" },
    { num: "Free", label: "Always free to join" },
  ],
};

const LEFT_PATIENT = {
  eyebrow: "FREE PATIENT ACCOUNT",
  title: (
    <>
      Your Personal <span>Health Hub</span>
    </>
  ),
  para: "Everything you need to manage your health in one secure, trusted platform.",
  benefits: LEFT_DEFAULT.benefits,
  stats: LEFT_DEFAULT.stats,
};

const LEFT_PHYSICIAN = {
  eyebrow: "PHYSICIAN ACCOUNT",
  title: (
    <>
      Join Our <span>Expert Medical Network</span>
    </>
  ),
  para: "Connect with half a million patients and build your global medical reputation.",
  benefits: [
    { icon: "✍️", title: "Publish Articles", desc: "Reach 500,000+ readers with your expertise" },
    { icon: "🔬", title: "Review & Shape Content", desc: "Peer-review articles in your specialty" },
    { icon: "💬", title: "Answer Patient Questions", desc: "Respond to Ask the Doctor queries" },
    { icon: "🎓", title: "CPD/CME Recognition", desc: "Receive recognition letters for contributions" },
  ],
  stats: [
    { num: "500K+", label: "Active patients" },
    { num: "200+", label: "Specialist doctors" },
    { num: "🌍", label: "Global platform" },
  ],
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

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
  const setAuth = useAuthStore((state) => state.setAuth);

  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>("");
  const [subType, setSubType] = useState<SubType>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
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

  const leftPanel = useMemo(() => {
    if (accountType === "patient") return LEFT_PATIENT;
    if (accountType === "physician") return LEFT_PHYSICIAN;
    return LEFT_DEFAULT;
  }, [accountType]);

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
        setSuccessMsg("Welcome to MedAuthority! We've sent a verification email to your inbox.");
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
    if (!error) return;
    const timer = setTimeout(() => setError(""), 4000);
    return () => clearTimeout(timer);
  }, [error]);

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
      role: accountType === "physician" ? "DOCTOR" : "PATIENT",
      specialty,
      licenseNumber: accountType === "physician" ? licenseNumber.trim() || `PENDING-${Date.now()}` : undefined,
    });
  }

  function renderExtraFields() {
    if (accountType === "patient") {
      if (subType === "indiv" || subType === "") {
        return (
          <div className="form-group">
            <label className="form-label">Gender</label>
            <div className="input-wrap">
              <span className="input-icon">👤</span>
              <select className="form-select" defaultValue="Male">
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        );
      }
      if (subType === "parent") {
        return (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Child&apos;s Date of Birth</label>
              <div className="input-wrap">
                <span className="input-icon">📅</span>
                <input type="date" className="form-input" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Relationship</label>
              <div className="input-wrap">
                <span className="input-icon">👨‍👩‍👦</span>
                <select className="form-select" defaultValue="Parent">
                  <option>Parent</option>
                  <option>Legal Guardian</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        );
      }
      if (subType === "caregiver") {
        return (
          <div className="form-group">
            <label className="form-label">Patient&apos;s Approximate Age Range</label>
            <div className="input-wrap">
              <span className="input-icon">👴</span>
              <select className="form-select" defaultValue="60–70">
                <option>60–70</option>
                <option>70–80</option>
                <option>80–90</option>
                <option>90+</option>
              </select>
            </div>
          </div>
        );
      }
      if (subType === "student") {
        return (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">University / Institution</label>
              <div className="input-wrap">
                <span className="input-icon">🎓</span>
                <input type="text" className="form-input" placeholder="University name" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <div className="input-wrap">
                <span className="input-icon">📅</span>
                <select className="form-select" defaultValue="Year 1">
                  <option>Year 1</option>
                  <option>Year 2</option>
                  <option>Year 3</option>
                  <option>Year 4</option>
                  <option>Year 5</option>
                  <option>Year 6</option>
                  <option>Postgrad</option>
                </select>
              </div>
            </div>
          </div>
        );
      }
    }

    if (accountType === "physician") {
      let extra = (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Hospital / Clinic</label>
            <div className="input-wrap">
              <span className="input-icon">🏥</span>
              <input type="text" className="form-input" placeholder="Institution name" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">City of Practice</label>
            <div className="input-wrap">
              <span className="input-icon">📍</span>
              <input type="text" className="form-input" placeholder="City" />
            </div>
          </div>
        </div>
      );

      if (subType === "specialist") {
        extra = (
          <>
            {extra}
            <div className="form-group">
              <label className="form-label">Primary Specialty</label>
              <div className="input-wrap">
                <span className="input-icon">🩺</span>
                <select
                  className="form-select"
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
                </select>
              </div>
            </div>
          </>
        );
      } else if (subType === "gp") {
        extra = (
          <>
            {extra}
            <div className="form-group">
              <label className="form-label">Years in Practice</label>
              <div className="input-wrap">
                <span className="input-icon">📅</span>
                <select className="form-select" defaultValue="1–5">
                  <option>1–5</option>
                  <option>5–10</option>
                  <option>10–20</option>
                  <option>20+</option>
                </select>
              </div>
            </div>
          </>
        );
      } else if (subType === "surgeon") {
        extra = (
          <>
            {extra}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Surgical Specialty</label>
                <div className="input-wrap">
                  <span className="input-icon">🔪</span>
                  <input type="text" className="form-input" placeholder="e.g. Cardiac Surgery" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Type of Practice</label>
                <div className="input-wrap">
                  <span className="input-icon">🏥</span>
                  <select className="form-select" defaultValue="Public Hospital">
                    <option>Public Hospital</option>
                    <option>Private</option>
                    <option>Academic</option>
                  </select>
                </div>
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
                <label className="form-label">Training Program</label>
                <div className="input-wrap">
                  <span className="input-icon">🎓</span>
                  <input type="text" className="form-input" placeholder="Specialty training" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Year of Training</label>
                <div className="input-wrap">
                  <span className="input-icon">📅</span>
                  <select className="form-select" defaultValue="PGY-1">
                    <option>PGY-1</option>
                    <option>PGY-2</option>
                    <option>PGY-3</option>
                    <option>PGY-4</option>
                    <option>PGY-5</option>
                    <option>PGY-6</option>
                    <option>PGY-7</option>
                  </select>
                </div>
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

          {!success && currentStep === 1 && (
            <div id="step1">
              <h2 className="step-title">Create Your Account</h2>
              <p className="step-subtitle">Choose how you&apos;ll be using MedAuthority</p>

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

              <div className="social-grid">
                <button type="button" className="social-btn">
                  <GoogleIcon />
                  Google
                </button>
                <button type="button" className="social-btn">
                  <FacebookIcon />
                  Facebook
                </button>
              </div>
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

          {!success && currentStep === 2 && (
            <div id="step2">
              <h2 className="step-title">Personal Information</h2>
              <p className="step-subtitle">{step2Subtitle}</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Smith"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon">✉️</span>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Phone Number <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(optional)</span>
                </label>
                <div className="input-wrap">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <div className="input-wrap">
                    <span className="input-icon">📅</span>
                    <input
                      type="date"
                      className="form-input"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <div className="input-wrap">
                    <span className="input-icon">🌍</span>
                    <select className="form-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                      <option value="">Select country…</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Pakistan</option>
                      <option>India</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>

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

          {!success && currentStep === 3 && (
            <div id="step3">
              {accountType !== "physician" && (
                <div id="step3patient">
                  <h2 className="step-title">Your Health Profile</h2>
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
                    <label className="form-label">Language Preference</label>
                    <div className="input-wrap">
                      <span className="input-icon">🌐</span>
                      <select className="form-select" defaultValue="English">
                        <option>English</option>
                        <option>Urdu</option>
                        <option>Arabic</option>
                        <option>Hindi</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Spanish</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {accountType === "physician" && (
                <div id="step3physician">
                  <h2 className="step-title">Professional Profile</h2>
                  <p className="step-subtitle">Help us match you with relevant clinical content</p>
                  <div className="form-group">
                    <label className="form-label">Medical License Number</label>
                    <div className="input-wrap">
                      <span className="input-icon">📋</span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="MD-12345678"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                      />
                    </div>
                    <p className="input-note">⚠️ License will be verified before author/reviewer access is granted</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Regulatory Body / Medical Council</label>
                    <div className="input-wrap">
                      <span className="input-icon">🏛️</span>
                      <select className="form-select" defaultValue="Pakistan Medical Commission (PMC)">
                        <option>Pakistan Medical Commission (PMC)</option>
                        <option>General Medical Council (GMC — UK)</option>
                        <option>American Medical Association (AMA)</option>
                        <option>Medical Council of India (MCI)</option>
                        <option>Australian Medical Association (AMA-AU)</option>
                        <option>Other</option>
                      </select>
                    </div>
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

          {!success && currentStep === 4 && (
            <div id="step4">
              <h2 className="step-title">Secure Your Account</h2>
              <p className="step-subtitle">Create a strong password to protect your health data</p>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPw1 ? "text" : "password"}
                    className="form-input"
                    placeholder="Create a strong password"
                    style={{ paddingRight: 42 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" className="pw-toggle-btn" onClick={() => setShowPw1((v) => !v)}>
                    👁️
                  </button>
                </div>
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
                <label className="form-label">Confirm Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPw2 ? "text" : "password"}
                    className="form-input"
                    placeholder="Repeat your password"
                    style={{ paddingRight: 42 }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" className="pw-toggle-btn" onClick={() => setShowPw2((v) => !v)}>
                    👁️
                  </button>
                  {confirmPassword && (
                    <span
                      className="pw-match"
                      style={{ color: password === confirmPassword ? "var(--green)" : "var(--red)" }}
                    >
                      {password === confirmPassword ? "✓" : "✗"}
                    </span>
                  )}
                </div>
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
                <Link href={accountType === "physician" ? "/login" : "/patient"} className="success-btn">
                  Go to My Dashboard →
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
