"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState, VitalsGrid } from "@/components/patient/ui/PatientShared";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import {
  useCreatePatientVital,
  usePatientHealthToolHistory,
  usePatientHealthVitals,
} from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

const VITAL_TYPES = [
  { type: "BLOOD_PRESSURE", label: "Blood Pressure", unit: "mmHg", placeholder: "122/80" },
  { type: "HEART_RATE", label: "Heart Rate", unit: "bpm", placeholder: "72" },
  { type: "OXYGEN_SATURATION", label: "Oxygen Sat.", unit: "%", placeholder: "98" },
  { type: "BMI", label: "BMI", unit: "kg/m²", placeholder: "23.4" },
  { type: "BLOOD_SUGAR", label: "Blood Sugar", unit: "%", placeholder: "6.2" },
  { type: "TEMPERATURE", label: "Temperature", unit: "°C", placeholder: "36.6" },
] as const;

export function HealthPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const vitalsQuery = usePatientHealthVitals();
  const toolHistoryQuery = usePatientHealthToolHistory(20);
  const createVital = useCreatePatientVital();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(VITAL_TYPES[0].type);
  const [formValue, setFormValue] = useState("");

  const vitals = vitalsQuery.data?.data ?? [];
  const toolHistory = toolHistoryQuery.data ?? [];

  const handleLog = () => {
    if (!formValue.trim()) {
      showToast("Enter a value");
      return;
    }
    const meta = VITAL_TYPES.find((v) => v.type === formType)!;
    createVital.mutate(
      { type: formType, value: formValue.trim(), unit: meta.unit },
      {
        onSuccess: () => {
          showToast("Vital reading saved");
          setFormValue("");
          setShowForm(false);
        },
        onError: () => showToast("Could not save reading"),
      },
    );
  };

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="Health Metrics"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={() => setShowForm((v) => !v)}>+ Log Reading</DashButton>}
      />

      {showForm ? (
        <DashCard title="➕ Log a Vital Reading">
          <div className="form-row">
            <div className="form-group">
              <label>Metric</label>
              <select value={formType} onChange={(e) => setFormType(e.target.value as typeof formType)}>
                {VITAL_TYPES.map((v) => (
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
                onChange={(e) => setFormValue(e.target.value)}
                placeholder={VITAL_TYPES.find((v) => v.type === formType)?.placeholder}
              />
            </div>
          </div>
          <DashButton variant="solid" onClick={handleLog}>
            {createVital.isPending ? "Saving..." : "Save Reading"}
          </DashButton>
        </DashCard>
      ) : null}

      <DashCard
        title="❤️ Current Vitals"
        headerExtra={
          vitalsQuery.data?.lastRecordedAt ? (
            <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
              Last recorded: {formatDate(vitalsQuery.data.lastRecordedAt)}
            </span>
          ) : null
        }
      >
        {vitalsQuery.isLoading ? (
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
              {toolHistoryQuery.isLoading ? (
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
    </>
  );
}
