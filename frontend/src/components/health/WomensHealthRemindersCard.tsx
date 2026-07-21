"use client";

import Link from "next/link";
import { formatDate } from "@/lib/data-mappers";
import { DashCard } from "@/components/patient/ui/PatientPrimitives";
import {
  useMyWhrSubscriptions,
  useToggleMyWhrSubscription,
  type WhrToolType,
} from "@/services/whr-api-hooks";

const TOOL_META: Record<
  WhrToolType,
  { icon: string; label: string; defaultSub: string }
> = {
  PREGNANCY: {
    icon: "🤰",
    label: "Pregnancy Due Date Calculator",
    defaultSub: "Weekly Pregnancy Care Schedule — enable to receive care emails through your due date",
  },
  OVULATION: {
    icon: "🌸",
    label: "Pregnancy Planner (Ovulation)",
    defaultSub: "One reminder per cycle — next email 1 day before predicted ovulation",
  },
  PERIOD: {
    icon: "🩸",
    label: "Menstrual Period Tracker",
    defaultSub: "One reminder per cycle — enable to get an email 1 day before your expected period",
  },
};

function buildSubtitle(tool: WhrToolType, reminderDate: string | null, prediction: Record<string, unknown> | null) {
  if (reminderDate) {
    const formatted = formatDate(reminderDate);
    if (tool === "OVULATION") {
      return `One reminder per cycle — next email: ${formatted} (1 day before predicted ovulation)`;
    }
    if (tool === "PERIOD") {
      return `One reminder per cycle — next email: ${formatted} (1 day before expected period)`;
    }
    if (prediction && Array.isArray(prediction.schedule) && prediction.schedule.length > 0) {
      const next = prediction.schedule[0] as { week?: number; title?: string };
      return `Weekly Pregnancy Care Schedule — next email: Week ${next.week ?? "—"} (${next.title ?? "care update"}), ${formatted}`;
    }
    return `Weekly Pregnancy Care Schedule — next email scheduled for ${formatted}`;
  }
  return TOOL_META[tool].defaultSub;
}

export function WomensHealthRemindersCard({
  userEmail,
  showToast,
  role,
}: {
  userEmail?: string;
  showToast: (message: string) => void;
  role: "patient" | "doctor";
}) {
  const subsQuery = useMyWhrSubscriptions();
  const toggle = useToggleMyWhrSubscription();
  const subs = subsQuery.data ?? [];

  const handleToggle = (tool: WhrToolType, currentlyOn: boolean) => {
    toggle.mutate(
      { tool, enabled: !currentlyOn },
      {
        onSuccess: () =>
          showToast(
            !currentlyOn
              ? "📧 Email reminders enabled — sent to your registered email"
              : "🔕 Email reminders disabled for this tool",
          ),
        onError: () => showToast("Could not update reminder preference"),
      },
    );
  };

  return (
    <DashCard
      title="📧 Women's Health Email Reminders"
      headerExtra={
        userEmail ? (
          <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
            Sent to your registered email: {userEmail}
          </span>
        ) : null
      }
    >
      {(Object.keys(TOOL_META) as WhrToolType[]).map((tool) => {
        const meta = TOOL_META[tool];
        const sub = subs.find((s) => s.tool === tool);
        const on = sub?.enabled ?? false;
        return (
          <div
            key={tool}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              padding: "13px 0",
              borderBottom: "1px solid var(--gray-100)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: "1.3rem" }}>{meta.icon}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--gray-900)" }}>{meta.label}</div>
                <div style={{ fontSize: "0.76rem", color: "var(--gray-500)" }}>
                  {buildSubtitle(tool, sub?.reminderDate ?? null, sub?.predictionJson ?? null)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span
                className={`st-chip${on ? " st-active" : ""}`}
                style={on ? undefined : { background: "var(--gray-100)", color: "var(--gray-600)" }}
              >
                {on ? "✓ Reminders On" : "Off"}
              </span>
              <button
                type="button"
                className={`ca-btn${on ? " danger" : " primary"}`}
                disabled={toggle.isPending}
                onClick={() => handleToggle(tool, on)}
              >
                {on ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: "0.74rem", color: "var(--gray-400)", paddingTop: 12 }}>
        Manage predictions and reminder dates from the{" "}
        <Link href="/health-tools" style={{ color: "var(--blue)", fontWeight: 600 }}>
          Health Tools
        </Link>{" "}
        page — predictions are estimates and reminders update automatically when you recalculate.
        {role === "doctor" ? " Physicians can track personal wellness metrics here too." : ""}
      </div>
    </DashCard>
  );
}
