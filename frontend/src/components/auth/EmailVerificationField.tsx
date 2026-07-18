"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { FloatingInput } from "@/components/ui/floating-input";
import {
  useEmailVerificationStatus,
  useSendEmailVerification,
} from "@/services/profile-api-hooks";

export function EmailVerificationField({
  email,
  initialVerified,
  onVerifiedChange,
}: {
  email: string;
  initialVerified: boolean;
  onVerifiedChange?: (verified: boolean) => void;
}) {
  const statusQuery = useEmailVerificationStatus({ enabled: !initialVerified });
  const sendMutation = useSendEmailVerification();
  const [verified, setVerified] = useState(initialVerified);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVerified(initialVerified);
  }, [initialVerified]);

  useEffect(() => {
    if (statusQuery.data?.verified) {
      setVerified(true);
      onVerifiedChange?.(true);
    }
    if (statusQuery.data?.cooldownSeconds) {
      setCooldown(statusQuery.data.cooldownSeconds);
    }
  }, [statusQuery.data, onVerifiedChange]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    function handleFocus() {
      void statusQuery.refetch();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [statusQuery]);

  async function handleVerify() {
    setMessage(null);
    setError(null);
    try {
      const result = await sendMutation.mutateAsync();
      if (result.verified) {
        setVerified(true);
        onVerifiedChange?.(true);
        setMessage("Your email is already verified.");
        return;
      }
      setMessage(result.message);
      setCooldown(result.cooldownSeconds ?? 60);
    } catch (err) {
      let msg = "Could not send verification email. Please try again.";
      if (isAxiosError(err)) {
        const responseMessage = err.response?.data?.message;
        if (typeof responseMessage === "string") {
          msg = responseMessage;
          const match = msg.match(/(\d+)\s+seconds/);
          if (match) setCooldown(Number(match[1]));
        }
      }
      setError(msg);
    }
  }

  return (
    <div className="form-group">
      <div className="cp-email-verify-row">
        <FloatingInput type="email" label="Email Address" value={email} readOnly />
        {!verified && (
          <button
            type="button"
            className="cp-verify-btn"
            disabled={sendMutation.isPending || cooldown > 0}
            onClick={() => void handleVerify()}
          >
            {sendMutation.isPending ? "Sending…" : cooldown > 0 ? `Resend (${cooldown}s)` : "Verify Email"}
          </button>
        )}
      </div>
      {verified && (
        <div className="cp-email-verified-badge show">
          <span>✅</span> Verified
        </div>
      )}
      {message && <p className="cp-email-verify-note">{message}</p>}
      {error && <p className="cp-upload-error">{error}</p>}
      {!verified && (
        <p className="cp-email-verify-note">
          We&apos;ll send a secure verification link to your inbox. The link expires in 24 hours.
        </p>
      )}
    </div>
  );
}
