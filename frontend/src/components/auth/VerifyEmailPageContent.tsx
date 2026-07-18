"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { api } from "@/lib/api";
import { Logo } from "@/components/layout/Logo";
import "@/styles/complete-profile-page.css";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token. Please request a new verification email.");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const validate = await api.get<{ valid: boolean }>("/auth/email-verification/validate", {
          params: { token },
        });
        if (!validate.data.valid) {
          if (!cancelled) {
            setStatus("error");
            setMessage("This verification link is invalid or has expired. Please request a new one.");
          }
          return;
        }

        const result = await api.post<{ message: string }>("/auth/email-verification/verify", { token });
        if (!cancelled) {
          setStatus("success");
          setMessage(result.data.message || "Email verified successfully.");
        }
      } catch (err) {
        if (cancelled) return;
        let msg = "This verification link is invalid or has expired. Please request a new one.";
        if (isAxiosError(err)) {
          const responseMessage = err.response?.data?.message;
          if (typeof responseMessage === "string" && responseMessage) msg = responseMessage;
        }
        setStatus("error");
        setMessage(msg);
      }
    }

    void verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="complete-profile-page">
      <div className="cp-progress-header">
        <div className="cp-progress-inner">
          <div className="cp-progress-logo">
            <Link href="/">
              <Logo />
            </Link>
          </div>
        </div>
      </div>

      <div className="cp-wrap">
        <div className="cp-card register-page" style={{ marginTop: 32 }}>
          <div className="cp-intro" style={{ marginBottom: 20 }}>
            <div className="cp-intro-eyebrow">Email verification</div>
            <h1>{status === "success" ? "You're all set" : status === "error" ? "Verification failed" : "Verifying…"}</h1>
            <p>{message}</p>
          </div>

          {status === "success" && (
            <Link href="/complete-profile" className="btn-next" style={{ display: "inline-block", textAlign: "center" }}>
              Return to Complete Profile
            </Link>
          )}

          {status === "error" && (
            <Link href="/complete-profile" className="btn-next" style={{ display: "inline-block", textAlign: "center" }}>
              Back to Complete Profile
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function VerifyEmailPageContent() {
  return (
    <Suspense fallback={<div className="complete-profile-page"><div className="cp-loading">Loading…</div></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
