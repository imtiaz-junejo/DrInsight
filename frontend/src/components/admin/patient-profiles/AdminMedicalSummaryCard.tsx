"use client";

import type { ReactNode } from "react";
import { StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { bmiTagClassName } from "@/lib/admin-patient-profile-mapper";
import type { AdminPatientProfile } from "@/services/admin-api-hooks";

function displayValue(value?: string | null): string {
  return value?.trim() || "—";
}

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="admin-med-summary-row">
      <span className="admin-med-summary-label">{label}</span>
      <span className="admin-med-summary-value">{value}</span>
    </div>
  );
}

function ChipGroup({
  label,
  items,
  chipClass,
}: {
  label: string;
  items: string[];
  chipClass: string;
}) {
  return (
    <div className="admin-med-summary-chip-group">
      <div className="admin-med-summary-chip-label">{label}</div>
      <div className="admin-med-summary-chips">
        {items.length ? (
          items.map((item) => (
            <span key={item} className={`chip ${chipClass}`}>
              {item}
            </span>
          ))
        ) : (
          <span className="admin-med-summary-empty">—</span>
        )}
      </div>
    </div>
  );
}

export function AdminMedicalSummaryCard({ patient }: { patient: AdminPatientProfile }) {
  const summary = patient.medicalSummary;
  const allergies = patient.allergies ?? [];
  const chronicConditions = summary?.chronicConditions ?? [];

  return (
    <div className="admin-profile-card admin-profile-card--teal admin-med-summary-card">
      <div className="admin-profile-card-hd">
        <span className="admin-profile-card-icon" aria-hidden>
          🩺
        </span>
        <h3>Medical Summary</h3>
      </div>
      <div className="admin-profile-card-bd admin-med-summary-bd">
        <SummaryRow label="Blood Group" value={displayValue(patient.bloodGroup)} />
        <SummaryRow label="Height" value={displayValue(summary?.height)} />
        <SummaryRow label="Weight" value={displayValue(summary?.weight)} />
        <SummaryRow
          label="BMI"
          value={
            summary?.bmi ? (
              <>
                {summary.bmi}
                {summary.bmiTag ? (
                  <StatusChip label={summary.bmiTag} className={bmiTagClassName(summary.bmiTag)} />
                ) : null}
              </>
            ) : (
              "—"
            )
          }
        />

        <ChipGroup label="Allergies" items={allergies} chipClass="ch-r" />
        <ChipGroup label="Chronic Conditions" items={chronicConditions} chipClass="ch-b" />
      </div>
    </div>
  );
}
