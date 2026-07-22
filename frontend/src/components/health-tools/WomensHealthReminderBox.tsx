"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  useMyWhrSubscriptions,
  useSubscribeWhrReminder,
  useUnsubscribeWhrReminder,
  whrToolFromKey,
} from "@/services/whr-api-hooks";

type ToolKey = "pregnancy" | "ovulation" | "period";

export interface WhrPrediction {
  cycleKey?: string;
  reminderDate?: string;
  edd?: string;
  ovDate?: string;
  nextPeriod?: string;
  schedule?: Array<{ week: number; date: string; title: string }>;
}

const WHR_ALREADY_SUBSCRIBED_MSG = "Email already subscribed";

const TOOL_PROMPTS: Record<ToolKey, string> = {
  pregnancy:
    "📩 Submit your email address and get <strong>free reminders</strong> — we'll email you before each antenatal visit and test throughout your pregnancy.",
  ovulation:
    "📩 Submit your email address and get a <strong>free reminder</strong> — we'll email you 1 day before your predicted fertile window.",
  period:
    "📩 Submit your email address and get a <strong>free reminder</strong> — we'll email you 1 day before your next expected period.",
};

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function WomensHealthReminderBox({
  toolKey,
  prediction,
}: {
  toolKey: ToolKey;
  prediction: WhrPrediction | null;
}) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [email, setEmail] = useState("");
  const [subscribedInSession, setSubscribedInSession] = useState(false);
  const [dismissedSubscription, setDismissedSubscription] = useState(false);
  const [err, setErr] = useState("");
  const [existsMsg, setExistsMsg] = useState("");
  const subscribe = useSubscribeWhrReminder();
  const unsubscribe = useUnsubscribeWhrReminder();
  const lastScheduledCycle = useRef<string | null>(null);
  const scheduling = useRef(false);

  const mySubsQuery = useMyWhrSubscriptions(isAuthenticated);
  const toolApi = whrToolFromKey(toolKey);
  const apiSubscription = isAuthenticated
    ? mySubsQuery.data?.find((s) => s.tool === toolApi && s.enabled)
    : undefined;

  const resolvedEmail = (user?.email || email).trim();
  const isSubscribedView =
    !dismissedSubscription && (subscribedInSession || Boolean(isAuthenticated && apiSubscription));

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!isAuthenticated) {
      setSubscribedInSession(false);
      setDismissedSubscription(false);
      lastScheduledCycle.current = null;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (apiSubscription?.enabled) {
      setDismissedSubscription(false);
    }
  }, [apiSubscription?.enabled]);

  useEffect(() => {
    if (apiSubscription?.status && apiSubscription.status !== "PENDING") {
      const cycleKey =
        typeof apiSubscription.predictionJson?.cycleKey === "string"
          ? apiSubscription.predictionJson.cycleKey
          : null;
      if (cycleKey) lastScheduledCycle.current = cycleKey;
    }
  }, [apiSubscription]);

  const activateSubscribedView = useCallback(() => {
    setSubscribedInSession(true);
    setDismissedSubscription(false);
    setErr("");
    setExistsMsg("");
  }, []);

  const resetToFreshView = useCallback(() => {
    setSubscribedInSession(false);
    setDismissedSubscription(true);
    setErr("");
    setExistsMsg("");
    lastScheduledCycle.current = null;
  }, []);

  const schedule = useCallback(
    async (showFeedback: boolean): Promise<boolean> => {
      if (!validEmail(resolvedEmail)) {
        if (showFeedback) setErr("Please enter a valid email address to receive reminders.");
        return false;
      }

      if (scheduling.current) return false;
      scheduling.current = true;

      try {
        const result = await subscribe.mutateAsync({
          tool: toolApi,
          email: resolvedEmail,
          cycleKey: prediction?.cycleKey,
          reminderDate: prediction?.reminderDate,
          predictionJson: prediction ? (prediction as Record<string, unknown>) : { pending: true },
        });

        if (result.duplicate) {
          if (showFeedback) {
            setExistsMsg(WHR_ALREADY_SUBSCRIBED_MSG);
            setErr("");
          }
          return false;
        }

        if (prediction?.cycleKey) {
          lastScheduledCycle.current = prediction.cycleKey;
        }

        activateSubscribedView();
        return true;
      } catch {
        if (showFeedback) {
          setErr("Could not schedule reminder. Please check your connection and try again.");
        }
        return false;
      } finally {
        scheduling.current = false;
      }
    },
    [activateSubscribedView, prediction, resolvedEmail, subscribe, toolApi],
  );

  const cancel = useCallback(async () => {
    if (validEmail(resolvedEmail)) {
      try {
        await unsubscribe.mutateAsync({ email: resolvedEmail, tool: toolApi });
      } catch {
        // still reset local state if API fails
      }
    }
    resetToFreshView();
  }, [resolvedEmail, resetToFreshView, toolApi, unsubscribe]);

  const handleSubmit = useCallback(() => {
    setExistsMsg("");
    void schedule(true);
  }, [schedule]);

  const handleOptInChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        void schedule(true);
        return;
      }
      void cancel();
    },
    [cancel, schedule],
  );

  useEffect(() => {
    if (!isSubscribedView || !prediction?.cycleKey) return;
    if (lastScheduledCycle.current === prediction.cycleKey) return;
    void schedule(false);
  }, [isSubscribedView, prediction, schedule]);

  return (
    <div className={`whr-box${isSubscribedView ? " whr-box--compact" : ""}`} id={`whr-${toolKey}`}>
      <div className="whr-hd">
        <span>📧</span>
        Email Reminders
        <span className={`whr-chip ${isSubscribedView ? "on" : "off"}`}>
          {isSubscribedView ? "✓ Reminders On" : "Off"}
        </span>
      </div>

      {!isSubscribedView ? (
        <>
          {!user?.email ? (
            <div
              className="whr-prompt"
              dangerouslySetInnerHTML={{ __html: TOOL_PROMPTS[toolKey] }}
            />
          ) : null}

          {!user?.email ? (
            <div className="form-row single">
              <div className="form-group">
                <label htmlFor={`whr-${toolKey}-email`}>Email Address</label>
                <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                  <input
                    type="email"
                    id={`whr-${toolKey}-email`}
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setExistsMsg("");
                      setErr("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="calc-btn"
                    style={{ width: "auto", marginTop: 0, padding: "8px 18px", flexShrink: 0 }}
                    onClick={handleSubmit}
                    disabled={subscribe.isPending}
                  >
                    {subscribe.isPending ? "Saving…" : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="whr-registered">
              ✉️ Reminders will be sent to your registered email: <strong>{user.email}</strong>
            </div>
          )}
        </>
      ) : null}

      <div className="whr-check">
        <input
          type="checkbox"
          id={`whr-${toolKey}-opt`}
          checked={isSubscribedView}
          disabled={subscribe.isPending || unsubscribe.isPending}
          onChange={(e) => handleOptInChange(e.target.checked)}
        />
        <label htmlFor={`whr-${toolKey}-opt`}>Receive Email Reminders</label>
      </div>

      {err ? (
        <div className="whr-err" style={{ display: "block" }}>
          {err}
        </div>
      ) : null}
      {existsMsg ? (
        <div className="whr-info exists" style={{ display: "block" }} role="status">
          {existsMsg}
        </div>
      ) : null}
    </div>
  );
}
