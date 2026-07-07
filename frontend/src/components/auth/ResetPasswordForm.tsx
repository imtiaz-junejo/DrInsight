"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/public/section-heading";
import { api } from "@/lib/api";

type ViewState = "loading" | "form" | "success" | "expired";
type AlertType = "error" | "success" | "warning" | null;

const PW_HINTS: Record<number, string> = {
  0: "Enter a password",
  1: "Weak — add more variety",
  2: "Fair — getting better",
  3: "Good — add a symbol for best",
  4: "Strong password ✓",
};

const PW_COLOR: Record<number, string> = {
  1: "weak",
  2: "fair",
  3: "good",
  4: "strong",
};

function getPasswordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

function formatCountdown(totalSecs: number) {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const REQ_ITEMS = [
  { dot: "8+", text: "At least 8 characters long" },
  { dot: "Aa", text: "Mix of uppercase and lowercase letters" },
  { dot: "123", text: "At least one number" },
  { dot: "!@#", text: "At least one special character" },
  { dot: "≠", text: "Cannot match your previous password" },
];

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const expiryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [view, setView] = useState<ViewState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState<AlertType>(null);
  const [expiryDisplay, setExpiryDisplay] = useState("59:59");
  const [expiryWarning, setExpiryWarning] = useState(false);
  const [redirectSecs, setRedirectSecs] = useState(5);

  const pwScore = getPasswordScore(password);
  const hasLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSym = /[^A-Za-z0-9]/.test(password);

  const showAlert = useCallback((msg: string, type: AlertType) => {
    setAlertMsg(msg);
    setAlertType(type);
    if (type !== "warning") {
      setTimeout(() => {
        setAlertMsg("");
        setAlertType(null);
      }, 4000);
    }
  }, []);

  const showExpired = useCallback(() => {
    if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    setView("expired");
  }, []);

  const startExpiryCountdown = useCallback(
    (expiresAt: string) => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);

      const tick = () => {
        const remainingSecs = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
        if (remainingSecs <= 0) {
          showExpired();
          return;
        }
        setExpiryDisplay(formatCountdown(remainingSecs));
        setExpiryWarning(remainingSecs < 120);
      };

      tick();
      expiryTimerRef.current = setInterval(tick, 1000);
    },
    [showExpired],
  );

  const resetPasswordMutation = useMutation({
    mutationFn: async (payload: { token: string; password: string; confirmPassword: string }) => {
      const { data } = await api.post<{ message: string }>("/auth/reset-password", payload);
      return data;
    },
    onSuccess: () => {
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
      setView("success");
    },
    onError: (err) => {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message;
        if (Array.isArray(message)) {
          showAlert(message.join(", "), "error");
          return;
        }
        if (typeof message === "string" && message) {
          if (message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid")) {
            showExpired();
            return;
          }
          showAlert(message, "error");
          return;
        }
        if (!err.response) {
          showAlert("Cannot reach the server. Make sure the backend is running on port 4000.", "error");
          return;
        }
      }
      showAlert("Something went wrong. Please try again.", "error");
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function validateToken() {
      if (!token.trim()) {
        setView("expired");
        return;
      }

      try {
        const { data } = await api.get<{ valid: boolean; expiresAt?: string }>(
          "/auth/reset-password/validate",
          { params: { token } },
        );

        if (cancelled) return;

        if (!data.valid || !data.expiresAt) {
          setView("expired");
          return;
        }

        setView("form");
        startExpiryCountdown(data.expiresAt);
      } catch {
        if (!cancelled) setView("expired");
      }
    }

    void validateToken();

    return () => {
      cancelled = true;
      if (expiryTimerRef.current) clearInterval(expiryTimerRef.current);
    };
  }, [token, startExpiryCountdown]);

  useEffect(() => {
    if (view !== "success") return;

    setRedirectSecs(5);
    redirectTimerRef.current = setInterval(() => {
      setRedirectSecs((prev) => {
        if (prev <= 1) {
          if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (redirectTimerRef.current) clearInterval(redirectTimerRef.current);
    };
  }, [view]);

  useEffect(() => {
    if (view === "success" && redirectSecs === 0) {
      router.push("/login");
    }
  }, [view, redirectSecs, router]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && view === "form" && !resetPasswordMutation.isPending) {
        void handleReset();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  function getMatchIndicator() {
    if (!confirmPassword) return { text: "", color: "", inputClass: "" };
    if (password === confirmPassword) {
      return { text: "✓ Passwords match", color: "var(--green)", inputClass: "valid" };
    }
    return { text: "✗ Passwords do not match", color: "var(--red)", inputClass: "invalid" };
  }

  const match = getMatchIndicator();

  async function handleReset() {
    if (!password) {
      showAlert("⚠️ Please enter a new password.", "error");
      return;
    }
    if (password.length < 8) {
      showAlert("⚠️ Password must be at least 8 characters.", "error");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      showAlert("⚠️ Password must contain at least one uppercase letter.", "error");
      return;
    }
    if (!/[0-9]/.test(password)) {
      showAlert("⚠️ Password must contain at least one number.", "error");
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      showAlert("⚠️ Password must contain at least one special character.", "error");
      return;
    }
    if (!confirmPassword) {
      showAlert("⚠️ Please confirm your new password.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showAlert("⚠️ Passwords do not match.", "error");
      return;
    }
    if (!token.trim()) {
      showExpired();
      return;
    }

    await resetPasswordMutation.mutateAsync({
      token,
      password,
      confirmPassword,
    });
  }

  return (
    <div className="page-wrap">
      <div className="page-left">
        <div className="bg-pattern" />
        <div className="deco-circle deco-c1" />
        <div className="deco-circle deco-c2" />
        <div className="ll-content">
          <div className="ll-eyebrow">SET NEW PASSWORD</div>
          <h1 className="ll-h1">
            Create a <span>Stronger, Safer</span> Password
          </h1>
          <p className="ll-para">
            A strong password is your first line of defense for your health data. Follow the requirements below to keep
            your account secure.
          </p>

          <div className="req-list">
            {REQ_ITEMS.map((item) => (
              <div key={item.dot} className="req-item">
                <div className="req-dot">{item.dot}</div>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="ll-trust">
            <span className="ll-pill">🔒 AES-256 Encrypted</span>
            <span className="ll-pill">🛡️ HIPAA Secure</span>
            <span className="ll-pill">✓ One-time Link</span>
          </div>
        </div>
      </div>

      <div className="page-right">
        <div className="page-card">
          {view === "loading" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <span className="spinner" style={{ borderColor: "rgba(26,86,160,.2)", borderTopColor: "var(--blue)" }} />
            </div>
          )}

          {view === "form" && (
            <div id="formState">
              <div className="card-icon">🛡️</div>
              <SectionTitle className="card-h2 text-center">Reset Your Password</SectionTitle>
              <p className="card-sub">Enter and confirm your new password below. Make it strong and memorable.</p>

              <div className={cn("expiry-bar", expiryWarning && "warning")}>
                <span>
                  <span className="exp-icon">⏱</span>
                  &nbsp;Link expires in: <strong>{expiryDisplay}</strong>
                </span>
                <span style={{ fontSize: ".76rem", opacity: 0.8 }}>One-time use only</span>
              </div>

              <div className={cn("alert", alertType && alertType)}>{alertMsg || null}</div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPw1 ? "text" : "password"}
                    className="form-input"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw1((v) => !v)}
                    aria-label={showPw1 ? "Hide password" : "Show password"}
                  >
                    {showPw1 ? "🙈" : "👁️"}
                  </button>
                </div>
                <div className="pw-strength">
                  <div className="pw-bars">
                    {[1, 2, 3, 4].map((n, i) => (
                      <div
                        key={n}
                        className={cn("pw-seg", i < pwScore && pwScore > 0 && PW_COLOR[pwScore])}
                      />
                    ))}
                  </div>
                  <div className="pw-hint">{PW_HINTS[pwScore] ?? PW_HINTS[0]}</div>
                </div>
                <div className="req-checks">
                  <div className={cn("req-check", hasLen && "met")}>
                    <span className="rc-dot">✓</span>8+ characters
                  </div>
                  <div className={cn("req-check", hasUpper && "met")}>
                    <span className="rc-dot">✓</span>Uppercase letter
                  </div>
                  <div className={cn("req-check", hasNum && "met")}>
                    <span className="rc-dot">✓</span>Number
                  </div>
                  <div className={cn("req-check", hasSym && "met")}>
                    <span className="rc-dot">✓</span>Special character
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <div className="input-wrap">
                  <span className="input-icon">🔐</span>
                  <input
                    type={showPw2 ? "text" : "password"}
                    className={cn("form-input", match.inputClass)}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw2((v) => !v)}
                    aria-label={showPw2 ? "Hide password" : "Show password"}
                  >
                    {showPw2 ? "🙈" : "👁️"}
                  </button>
                </div>
                <div className="match-indicator" style={{ color: match.color }}>
                  {match.text}
                </div>
              </div>

              <button
                type="button"
                className="submit-btn"
                disabled={resetPasswordMutation.isPending}
                onClick={() => void handleReset()}
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <span className="spinner" />
                    Updating…
                  </>
                ) : (
                  "Set New Password →"
                )}
              </button>

              <div className="back-link">
                <Link href="/forgot-password">← Request a new reset link</Link>
              </div>
              <div className="back-link" style={{ marginBottom: 20 }}>
                Remember your password? <Link href="/login">&nbsp;Sign in</Link>
              </div>

              <div className="security-box">
                🔒 This is a one-time secure link. Once used, it will expire immediately. DrInsight staff will never
                contact you asking for your password.
              </div>
            </div>
          )}

          {view === "success" && (
            <div className="success-state">
              <div className="success-check">✓</div>
              <div className="success-title">Password Updated!</div>
              <p className="success-msg">
                Your DrInsight password has been reset successfully. You can now sign in with your new password.
              </p>
              <div className="redirect-bar">
                <span>🔄</span>
                <span>
                  Redirecting to login in <strong>{redirectSecs}</strong>s…
                </span>
              </div>
              <Link href="/login" className="submit-btn" style={{ marginBottom: 0, textDecoration: "none" }}>
                Sign In Now →
              </Link>
            </div>
          )}

          {view === "expired" && (
            <div className="expired-state">
              <div className="expired-icon">⚠️</div>
              <div className="expired-title">Link Expired</div>
              <p className="expired-msg">
                This password reset link has expired. Reset links are valid for 15 minutes only for your security.
                <br />
                <br />
                Please request a new link to continue.
              </p>
              <Link href="/forgot-password" className="submit-btn" style={{ marginBottom: 12, textDecoration: "none" }}>
                Request New Link →
              </Link>
              <div className="back-link">
                <Link href="/login">← Back to Login</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
