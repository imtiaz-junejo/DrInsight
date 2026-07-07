"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/public/section-heading";
import { CONTACT_PHONE } from "@/lib/site-contact";
import { api } from "@/lib/api";

type Method = "email" | "sms";
type AlertType = "error" | "success" | "info" | null;
type ViewState = "form" | "success";

const STEPS = [
  {
    num: 1,
    title: "Enter your registered email or phone",
    desc: "We'll verify your identity before sending the reset link.",
  },
  {
    num: 2,
    title: "Check your inbox or messages",
    desc: "A secure one-time reset link will arrive within 2 minutes.",
  },
  {
    num: 3,
    title: "Create a new strong password",
    desc: "Your new password must meet our security requirements.",
  },
  {
    num: 4,
    title: "Sign in and access your dashboard",
    desc: "All your health records and consultations remain intact.",
  },
];

export function ForgotPasswordForm() {
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [view, setView] = useState<ViewState>("form");
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<AlertType>(null);
  const [successTarget, setSuccessTarget] = useState("");
  const [successIsSms, setSuccessIsSms] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [resendSecs, setResendSecs] = useState(60);

  const showAlert = useCallback((msg: string, type: AlertType) => {
    setAlertMsg(msg);
    setAlertType(type);
    if (type !== "info") {
      setTimeout(() => {
        setAlertMsg("");
        setAlertType(null);
      }, 4000);
    }
  }, []);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (payload: { email: string }) => {
      const { data } = await api.post<{ message: string }>("/auth/forgot-password", payload);
      return data;
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message;
        const status = err.response?.status;

        if (Array.isArray(message)) {
          showAlert(message.join(", "), "error");
          return;
        }
        if (typeof message === "string" && message) {
          showAlert(message, "error");
          return;
        }
        if (!err.response) {
          showAlert("Cannot reach the server. Make sure the backend is running on port 4000.", "error");
          return;
        }
        if (status === 500 || status === 502 || status === 503) {
          showAlert("Unable to send the reset email right now. Please try again later.", "error");
          return;
        }
      }
      showAlert("Something went wrong. Please try again.", "error");
    },
  });

  const selectMethod = useCallback((next: Method) => {
    setMethod(next);
  }, []);

  const submitEmailReset = useCallback(
    async (trimmedEmail: string) => {
      await forgotPasswordMutation.mutateAsync({ email: trimmedEmail });
      setSuccessTarget(trimmedEmail);
      setSuccessIsSms(false);
      setView("success");
    },
    [forgotPasswordMutation],
  );

  const handleForgotPassword = useCallback(async () => {
    if (method === "email") {
      const trimmed = email.trim();
      if (!trimmed) {
        showAlert("⚠️ Please enter your registered email address.", "error");
        return;
      }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(trimmed)) {
        showAlert("⚠️ Please enter a valid email address.", "error");
        return;
      }

      try {
        await submitEmailReset(trimmed);
      } catch {
        // Error handled in mutation onError
      }
    } else {
      const trimmed = phone.trim();
      if (!trimmed) {
        showAlert("⚠️ Please enter your registered phone number.", "error");
        return;
      }
      if (trimmed.replace(/\D/g, "").length < 10) {
        showAlert("⚠️ Please enter a valid phone number.", "error");
        return;
      }

      showAlert("ℹ️ SMS password reset is not available yet. Please use email instead.", "info");
    }
  }, [method, email, phone, showAlert, submitEmailReset]);

  const startResend = useCallback(async () => {
    if (resendCooldown || successIsSms) return;

    const trimmed = successTarget.trim();
    if (!trimmed) return;

    try {
      await submitEmailReset(trimmed);
    } catch {
      return;
    }

    setResendCooldown(true);
    setResendSecs(60);

    resendTimerRef.current = setInterval(() => {
      setResendSecs((prev) => {
        if (prev <= 1) {
          if (resendTimerRef.current) clearInterval(resendTimerRef.current);
          setResendCooldown(false);
          showAlert("✓ A new reset link has been sent.", "success");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resendCooldown, successIsSms, successTarget, showAlert, submitEmailReset]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && view === "form" && !forgotPasswordMutation.isPending) {
        void handleForgotPassword();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [view, forgotPasswordMutation.isPending, handleForgotPassword]);

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  const submitLabel = method === "email" ? "Send Reset Link →" : "Send OTP →";
  const submitting = forgotPasswordMutation.isPending;

  return (
    <div className="page-wrap">
      <div className="page-left">
        <div className="bg-pattern" />
        <div className="deco-circle deco-c1" />
        <div className="deco-circle deco-c2" />
        <div className="ll-content">
          <div className="ll-eyebrow">ACCOUNT RECOVERY</div>
          <h1 className="ll-h1">
            Regain Access to Your <span>Health Portal</span>
          </h1>
          <p className="ll-para">
            Forgot your password? No worries — we&apos;ll get you back in securely. Choose how you&apos;d like to
            receive your reset link below.
          </p>

          <div className="ll-steps">
            {STEPS.map((step) => (
              <div key={step.num} className="ll-step">
                <div className="ll-step-num">{step.num}</div>
                <div className="ll-step-body">
                  <div className="ll-step-title">{step.title}</div>
                  <div className="ll-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="ll-trust">
            <span className="ll-pill">🔒 256-bit SSL</span>
            <span className="ll-pill">⏱ Expires in 15 mins</span>
            <span className="ll-pill">🛡️ HIPAA Secure</span>
          </div>
        </div>
      </div>

      <div className="page-right">
        <div className="page-card">
          {view === "form" && (
            <div id="formState">
              <div className="card-icon">🔑</div>
              <SectionTitle className="card-h2 text-center">Forgot Password?</SectionTitle>
              <p className="card-sub">
                Select how you&apos;d like to receive your password reset link. The link expires in 15 minutes.
              </p>

              <div className={cn("alert", alertType && alertType)}>{alertMsg || null}</div>

              <div className="method-grid">
                <button
                  type="button"
                  className={cn("method-card", method === "email" && "selected")}
                  onClick={() => selectMethod("email")}
                >
                  <div className="mc-icon">📧</div>
                  <div className="mc-title">Email</div>
                  <div className="mc-desc">Reset link to inbox</div>
                </button>
                <button
                  type="button"
                  className={cn("method-card", method === "sms" && "selected")}
                  onClick={() => selectMethod("sms")}
                >
                  <div className="mc-icon">📱</div>
                  <div className="mc-title">SMS</div>
                  <div className="mc-desc">OTP via text message</div>
                </button>
              </div>

              {method === "email" ? (
                <div className="form-group">
                  <label className="form-label">Registered Email Address</label>
                  <div className="input-wrap">
                    <span className="input-icon">✉️</span>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="form-hint">Enter the email address linked to your DrInsight account.</div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Registered Phone Number</label>
                  <div className="input-wrap">
                    <span className="input-icon">📱</span>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder={CONTACT_PHONE}
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-hint">
                    Enter the mobile number linked to your DrInsight account. Standard rates may apply.
                  </div>
                </div>
              )}

              <button type="button" className="submit-btn" disabled={submitting} onClick={() => void handleForgotPassword()}>
                {submitting ? (
                  <>
                    <span className="spinner" />
                    Sending…
                  </>
                ) : (
                  submitLabel
                )}
              </button>

              <div className="divider-text">or</div>

              <div className="back-link">
                Remember your password? <Link href="/login">&nbsp;Sign in here</Link>
              </div>
              <div className="back-link" style={{ marginBottom: 20 }}>
                New to DrInsight? <Link href="/register">&nbsp;Create a free account</Link>
              </div>

              <div className="security-box">
                🔒 Password reset links are single-use and expire after 15 minutes. DrInsight staff will never ask
                for your password via phone or email.
              </div>
            </div>
          )}

          {view === "success" && (
            <div className="success-state">
              <div className="success-check">✓</div>
              <div className="success-title">Reset Link Sent!</div>
              <p className="success-msg">
                {successIsSms ? (
                  <>
                    We&apos;ve sent a one-time passcode to
                    <br />
                    <span className="success-email">{successTarget}</span>
                    <br />
                    <br />
                    Enter the OTP on the next screen to reset your password.
                  </>
                ) : (
                  <>
                    We&apos;ve sent a password reset link to
                    <br />
                    <span className="success-email">{successTarget}</span>
                    <br />
                    <br />
                    Check your inbox (and spam folder) and click the link within 15 minutes.
                  </>
                )}
              </p>
              <Link href="/login" className="submit-btn" style={{ marginBottom: 12, textDecoration: "none" }}>
                ← Back to Login
              </Link>
              {!successIsSms && (
                <div className="resend-note">
                  Didn&apos;t receive it? &nbsp;
                  {resendCooldown ? (
                    <span className="countdown">
                      Resend in <span className="countdown-num">{resendSecs}</span>s
                    </span>
                  ) : (
                    <button type="button" onClick={() => void startResend()}>
                      Resend link
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
