"use client";

import { PATIENT_QUESTIONS } from "@/components/patient/data/patient-demo-data";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { todayFormatted } from "@/lib/patient-utils";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function QuestionsPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="My Questions"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={() => showToast("Opening question form...")}>+ Ask New Question</DashButton>}
      />

      <DashCard title="💬 All Questions">
        {PATIENT_QUESTIONS.map((item) => (
          <div key={item.q} style={{ padding: "16px 0", borderBottom: "1px solid var(--gray-100)" }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "0.86rem",
                color: "var(--gray-900)",
                marginBottom: 8,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
              }}
            >
              <span style={{ color: "var(--blue)", flexShrink: 0 }}>❓</span>
              {item.q}
            </div>
            <div
              style={{
                fontSize: "0.82rem",
                color: "var(--gray-500)",
                lineHeight: 1.6,
                paddingLeft: 20,
                borderLeft: "2px solid var(--blue-light)",
                marginBottom: 6,
              }}
            >
              {item.a}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>
              {item.date} &nbsp;·&nbsp;{" "}
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 50,
                  background: item.status === "completed" ? "var(--blue-light)" : "#fffbeb",
                  color: item.status === "completed" ? "var(--blue)" : "#d97706",
                }}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </DashCard>
    </>
  );
}
