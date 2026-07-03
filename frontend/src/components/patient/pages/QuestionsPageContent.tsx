"use client";

import { EmptyState } from "@/components/patient/ui/PatientShared";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { doctorFullName, formatDate } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import { useAskDoctorQuestions } from "@/services/api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function QuestionsPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const questionsQuery = useAskDoctorQuestions({ limit: 20 });

  const answeredQuestions = (questionsQuery.data?.data ?? []).filter((q) => q.answer);

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="My Questions"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={() => showToast("Opening question form...")}>+ Ask New Question</DashButton>}
      />

      <div
        style={{
          background: "var(--blue-light)",
          border: "1px solid var(--blue)",
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 20,
          fontSize: "0.82rem",
          color: "var(--gray-700)",
          lineHeight: 1.5,
        }}
      >
        <strong>Public Q&amp;A:</strong> Questions and answers on MedAuthority are shared publicly. Your personal question history is not shown here — browse answered questions from the community below.
      </div>

      <DashCard title="💬 Answered Questions">
        {questionsQuery.isLoading ? (
          <EmptyState message="Loading questions..." />
        ) : answeredQuestions.length > 0 ? (
          answeredQuestions.map((item) => (
            <div key={item.id} style={{ padding: "16px 0", borderBottom: "1px solid var(--gray-100)" }}>
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
                {item.question}
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
                {item.answeredBy
                  ? `${doctorFullName(item.answeredBy)} answered: ${item.answer}`
                  : item.answer}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>
                {formatDate(item.answeredAt ?? item.createdAt)} &nbsp;·&nbsp;{" "}
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 50,
                    background: "var(--blue-light)",
                    color: "var(--blue)",
                  }}
                >
                  answered
                </span>
              </div>
            </div>
          ))
        ) : (
          <EmptyState message="No answered questions available yet." />
        )}
      </DashCard>
    </>
  );
}
