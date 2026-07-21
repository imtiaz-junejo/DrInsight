"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import {
  clearWhrEntry,
  loadWhrEmailCaptured,
  loadWhrEntry,
  saveWhrEntry,
} from "@/components/health-tools/whr-storage";
import {
  usePublicWhrStatus,
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

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function infoHtml(tool: ToolKey, email: string, entry: WhrPrediction) {
  const e = `<strong>${email}</strong>`;
  if (tool === "ovulation") {
    return `✅ <strong>Ovulation reminder scheduled.</strong> One email — “Your Fertile Window Starts Tomorrow” — will be sent on <strong>${fmtDate(entry.reminderDate)}</strong> (1 day before predicted ovulation on ${fmtDate(entry.ovDate)}) to ${e}. Only one reminder is sent per cycle.`;
  }
  if (tool === "period") {
    return `✅ <strong>Period reminder scheduled.</strong> One email — “Period Reminder” — will be sent on <strong>${fmtDate(entry.reminderDate)}</strong> (1 day before your expected period on ${fmtDate(entry.nextPeriod)}) to ${e}. Only one reminder is sent per cycle.`;
  }
  const next =
    entry.schedule
      ?.slice(0, 3)
      .map(
        (s) =>
          `<div class="whr-sched-row"><span>📬</span><span><strong>Week ${s.week}</strong> — ${fmtDate(s.date)}: ${s.title}</span></div>`,
      )
      .join("") ?? "";
  return `✅ <strong>Pregnancy Care Schedule created.</strong> ${entry.schedule?.length ?? 0} emails scheduled through your due date (${fmtDate(entry.edd)}), sent to ${e}. Each email includes your pregnancy week, recommended investigations, doctor visit reminder, care tips and warning signs — reminders in the same week are combined into one email.${next ? `<div class="whr-sched">${next}</div>` : ""}`;
}

export function WomensHealthReminderBox({
  toolKey,
  prediction,
}: {
  toolKey: ToolKey;
  prediction: WhrPrediction | null;
}) {
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [chipOn, setChipOn] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [infoWarn, setInfoWarn] = useState(false);
  const subscribe = useSubscribeWhrReminder();
  const unsubscribe = useUnsubscribeWhrReminder();
  const pendingConfirm = useRef(false);
  const lastScheduledCycle = useRef<string | null>(null);
  const restored = useRef(false);
  const scheduling = useRef(false);

  const resolvedEmail = (user?.email || email).trim();
  const statusQuery = usePublicWhrStatus(validEmail(resolvedEmail) ? resolvedEmail : null);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      return;
    }
    const storedEmail = loadWhrEmailCaptured(toolKey);
    if (storedEmail) setEmail(storedEmail);
  }, [toolKey, user?.email]);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const stored = loadWhrEntry(toolKey);
    const capturedEmail = loadWhrEmailCaptured(toolKey);
    if (capturedEmail) {
      setEmailCaptured(true);
      if (!user?.email) setEmail(capturedEmail);
    }
    if (!stored) return;
    setOptIn(true);
    setChipOn(true);
    setEmailCaptured(true);
    pendingConfirm.current = stored.status === "pending";
  }, [toolKey, user?.email]);

  useEffect(() => {
    if (!statusQuery.data) return;
    const toolApi = whrToolFromKey(toolKey);
    const sub = statusQuery.data.find((s) => s.tool === toolApi);
    if (!sub) return;

    setEmailCaptured(true);

    if (!sub.enabled) {
      setOptIn(false);
      setChipOn(false);
      clearWhrEntry(toolKey);
      pendingConfirm.current = false;
      lastScheduledCycle.current = null;
      if (sub.status === "DISABLED_BY_ADMIN") {
        setInfo("🔕 Email reminders were disabled by an administrator. You can contact support to re-enable them.");
        setInfoWarn(true);
      }
      return;
    }

    setOptIn(true);
    setChipOn(true);
    if (sub.status === "PENDING" || !sub.cycleKey) {
      pendingConfirm.current = true;
    } else {
      pendingConfirm.current = false;
      lastScheduledCycle.current = sub.cycleKey;
    }
  }, [statusQuery.data, toolKey]);

  const persistLocal = useCallback(
    (entry: WhrPrediction | null, status: "scheduled" | "pending") => {
      if (!validEmail(resolvedEmail)) return;
      saveWhrEntry(toolKey, {
        tool: toolKey,
        email: resolvedEmail,
        enabled: true,
        createdAt: new Date().toISOString(),
        status,
        ...(entry ?? {}),
      });
      setEmailCaptured(true);
    },
    [resolvedEmail, toolKey],
  );

  const schedule = useCallback(
    async (showInfo: boolean): Promise<boolean> => {
      if (!validEmail(resolvedEmail)) {
        if (showInfo) setErr("Please enter a valid email address to receive reminders.");
        setChipOn(false);
        return false;
      }

      if (!prediction?.cycleKey) {
        if (showInfo) {
          pendingConfirm.current = true;
          setErr("");
          if (scheduling.current) return false;
          scheduling.current = true;
          try {
            await subscribe.mutateAsync({
              tool: whrToolFromKey(toolKey),
              email: resolvedEmail,
              predictionJson: { pending: true },
            });
            persistLocal(null, "pending");
            setOptIn(true);
            setChipOn(true);
            setInfo(
              "✅ Email saved. Now run the calculator above — your reminder will be scheduled automatically from the predicted dates.",
            );
            setInfoWarn(true);
            return true;
          } catch {
            setErr("Could not save email. Please check your connection and try again.");
            setChipOn(false);
            return false;
          } finally {
            scheduling.current = false;
          }
        }
        return true;
      }

      setErr("");
      if (scheduling.current) return false;
      scheduling.current = true;
      try {
        const result = await subscribe.mutateAsync({
          tool: whrToolFromKey(toolKey),
          email: resolvedEmail,
          cycleKey: prediction.cycleKey,
          reminderDate: prediction.reminderDate,
          predictionJson: prediction as Record<string, unknown>,
        });

        persistLocal(prediction, "scheduled");
        setChipOn(true);
        lastScheduledCycle.current = prediction.cycleKey;
        pendingConfirm.current = false;

        if (showInfo) {
          if (result.duplicate) {
            setInfo(
              `ℹ️ A reminder for this exact cycle is already scheduled — only one email is sent per cycle, so no duplicate was created.<br><br>${infoHtml(toolKey, resolvedEmail, prediction)}`,
            );
          } else {
            setInfo(infoHtml(toolKey, resolvedEmail, prediction));
          }
          setInfoWarn(false);
        }
        return true;
      } catch {
        if (showInfo || pendingConfirm.current) {
          setErr("Could not schedule reminder. Please check your connection and try again.");
        }
        setChipOn(false);
        return false;
      } finally {
        scheduling.current = false;
      }
    },
    [persistLocal, prediction, resolvedEmail, subscribe, toolKey],
  );

  const cancel = useCallback(async () => {
    if (validEmail(resolvedEmail)) {
      try {
        await unsubscribe.mutateAsync({ email: resolvedEmail, tool: whrToolFromKey(toolKey) });
      } catch {
        // still clear local state if API fails
      }
    }
    clearWhrEntry(toolKey);
    setChipOn(false);
    setErr("");
    pendingConfirm.current = false;
    lastScheduledCycle.current = null;
    setInfo("🔕 Email reminders turned off for this tool. You can re-enable them at any time.");
    setInfoWarn(true);
  }, [resolvedEmail, toolKey, unsubscribe]);

  const handleSubmit = useCallback(() => {
    if (!validEmail(resolvedEmail)) {
      setErr("Please enter a valid email address to receive reminders.");
      return;
    }
    setErr("");
    setOptIn(true);
    pendingConfirm.current = true;
    void schedule(true);
  }, [resolvedEmail, schedule]);

  useEffect(() => {
    if (!optIn || !prediction?.cycleKey) return;
    if (lastScheduledCycle.current === prediction.cycleKey) return;
    void schedule(pendingConfirm.current);
  }, [optIn, prediction, schedule]);

  const showEmailCapture = !emailCaptured;

  return (
    <div className={`whr-box${emailCaptured ? " whr-box--compact" : ""}`} id={`whr-${toolKey}`}>
      <div className="whr-hd">
        <span>📧</span>
        Email Reminders
        <span className={`whr-chip ${chipOn ? "on" : "off"}`}>{chipOn ? "✓ Reminders On" : "Off"}</span>
      </div>

      {showEmailCapture && !user?.email ? (
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
                onChange={(e) => setEmail(e.target.value)}
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
      ) : null}

      {showEmailCapture && user?.email ? (
        <div className="whr-registered">
          ✉️ Reminders will be sent to your registered email: <strong>{user.email}</strong>
        </div>
      ) : null}

      <div className="whr-check">
        <input
          type="checkbox"
          id={`whr-${toolKey}-opt`}
          checked={optIn}
          disabled={subscribe.isPending || unsubscribe.isPending}
          onChange={(e) => {
            const checked = e.target.checked;
            setOptIn(checked);
            if (checked) {
              if (!validEmail(resolvedEmail)) {
                setErr("Please enter a valid email address to receive reminders.");
                setOptIn(false);
                return;
              }
              pendingConfirm.current = true;
              void schedule(true);
            } else {
              void cancel();
            }
          }}
        />
        <label htmlFor={`whr-${toolKey}-opt`}>Receive Email Reminders</label>
      </div>

      {err ? (
        <div className="whr-err" style={{ display: "block" }}>
          {err}
        </div>
      ) : null}
      {info && !emailCaptured ? (
        <div
          className={`whr-info${infoWarn ? " warn" : ""}`}
          style={{ display: "block" }}
          dangerouslySetInnerHTML={{ __html: info }}
        />
      ) : null}
    </div>
  );
}
