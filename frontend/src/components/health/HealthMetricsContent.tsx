"use client";

import Link from "next/link";
import { formatDate } from "@/lib/data-mappers";
import { EmptyState, VitalsGrid, type VitalItem } from "@/components/patient/ui/PatientShared";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { todayFormatted } from "@/lib/patient-utils";
import { WomensHealthRemindersCard } from "@/components/health/WomensHealthRemindersCard";

export const HEALTH_VITAL_TYPES = [
  { type: "BLOOD_PRESSURE", label: "Blood Pressure", unit: "mmHg", placeholder: "122/80" },
  { type: "HEART_RATE", label: "Heart Rate", unit: "bpm", placeholder: "72" },
  { type: "OXYGEN_SATURATION", label: "Oxygen Sat.", unit: "%", placeholder: "98" },
  { type: "BMI", label: "BMI", unit: "kg/m²", placeholder: "23.4" },
  { type: "BLOOD_SUGAR", label: "Blood Sugar", unit: "%", placeholder: "6.2" },
  { type: "TEMPERATURE", label: "Temperature", unit: "°C", placeholder: "36.6" },
  { type: "LDL_CHOLESTEROL", label: "LDL Cholesterol", unit: "mg/dL", placeholder: "145" },
  { type: "STEPS", label: "Daily Average", unit: "steps", placeholder: "7240" },
] as const;

export type HealthVitalType = (typeof HEALTH_VITAL_TYPES)[number]["type"];

export interface HealthToolHistoryRow {
  id: string;
  resultSummary?: string | null;
  notes?: string | null;
  createdAt: string;
  tool: { name: string; iconEmoji?: string | null; slug: string };
}

export interface HealthMetricsContentProps {
  role: "patient" | "doctor";
  subtitle: string;
  vitals: VitalItem[];
  vitalsLoading: boolean;
  lastRecordedAt?: string | null;
  toolHistory: HealthToolHistoryRow[];
  toolHistoryLoading: boolean;
  showForm: boolean;
  onToggleForm: () => void;
  formType: HealthVitalType;
  onFormTypeChange: (type: HealthVitalType) => void;
  formValue: string;
  onFormValueChange: (value: string) => void;
  onSaveVital: () => void;
  savingVital?: boolean;
  userEmail?: string;
  showToast: (message: string) => void;
}

export function HealthMetricsContent({
  role,
  subtitle,
  vitals,
  vitalsLoading,
  lastRecordedAt,
  toolHistory,
  toolHistoryLoading,
  showForm,
  onToggleForm,
  formType,
  onFormTypeChange,
  formValue,
  onFormValueChange,
  onSaveVital,
  savingVital,
  userEmail,
  showToast,
}: HealthMetricsContentProps) {
  return (
    <>
      <DashPageHeader
        subtitle={subtitle}
        title="Health Metrics"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={onToggleForm}>+ Log Reading</DashButton>}
      />

      {showForm ? (
        <DashCard title="➕ Log a Vital Reading">
          <div className="form-row">
            <div className="form-group">
              <label>Metric</label>
              <select value={formType} onChange={(e) => onFormTypeChange(e.target.value as HealthVitalType)}>
                {HEALTH_VITAL_TYPES.map((v) => (
                  <option key={v.type} value={v.type}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Value</label>
              <input
                type="text"
                value={formValue}
                onChange={(e) => onFormValueChange(e.target.value)}
                placeholder={HEALTH_VITAL_TYPES.find((v) => v.type === formType)?.placeholder}
              />
            </div>
          </div>
          <DashButton variant="solid" onClick={onSaveVital}>
            {savingVital ? "Saving..." : "Save Reading"}
          </DashButton>
        </DashCard>
      ) : null}

      <DashCard
        title="❤️ Current Vitals"
        headerExtra={
          lastRecordedAt ? (
            <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
              Last recorded: {formatDate(lastRecordedAt)}
            </span>
          ) : null
        }
      >
        {vitalsLoading ? (
          <EmptyState message="Loading vitals..." />
        ) : vitals.length > 0 ? (
          <VitalsGrid vitals={vitals} columns={3} />
        ) : (
          <EmptyState message="No vitals recorded yet." />
        )}
      </DashCard>

      <DashCard title="📋 Health Tool History" actions={<Link href="/health-tools" className="card-action">Run New Tool →</Link>}>
        <div style={{ overflowX: "auto" }}>
          <table className="pt-table rtbl">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Result</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {toolHistoryLoading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 24, color: "var(--gray-400)" }}>
                    Loading history...
                  </td>
                </tr>
              ) : toolHistory.length > 0 ? (
                toolHistory.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {row.tool.iconEmoji ?? "🔧"} {row.tool.name}
                    </td>
                    <td>
                      <span className="st-chip st-active">{row.resultSummary ?? "Completed"}</span>
                    </td>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>{row.notes ?? "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "var(--gray-400)", padding: "24px 12px", fontSize: "0.82rem" }}>
                    No health tool history yet. Run a tool to see results here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DashCard>

      <WomensHealthRemindersCard userEmail={userEmail} showToast={showToast} role={role} />
    </>
  );
}
