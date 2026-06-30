"use client";

import { DashCard, DashPageHeader, PersonAvatar } from "@/components/doctor/ui/DoctorPrimitives";
import { QA_PENDING } from "@/components/doctor/data/doctor-demo-data";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const ANSWERED = [
  {
    name: "Michael C.",
    question: "What does an ejection fraction of 45% mean?",
    answer:
      "An ejection fraction of 45% falls in the mildly reduced range. Normal is above 55%. This warrants further workup including echocardiography and lifestyle modification.",
    date: "May 28, 2026",
  },
  {
    name: "David T.",
    question: "Is it safe to fly with atrial fibrillation?",
    answer:
      "Most patients with well-controlled AF can fly safely. Ensure anticoagulation is therapeutic and avoid dehydration during the flight.",
    date: "May 25, 2026",
  },
];

const MORE_PENDING = [
  ...QA_PENDING,
  {
    initials: "LP",
    avatarBg: "linear-gradient(135deg,#d97706,#f59e0b)",
    name: "Linda Patel",
    spec: "Endocrinology · Jun 2",
    urgent: false,
    question: "What is the ideal HbA1c target for a 55-year-old diabetic patient with no complications?",
    modal: QA_PENDING[0].modal,
  },
  {
    initials: "AM",
    avatarBg: "linear-gradient(135deg,#7c3aed,#8b5cf6)",
    name: "Aisha Mirza",
    spec: "Cardiology · May 30",
    urgent: false,
    question: "Are palpitations always a sign of a serious heart problem, or can they be harmless?",
    modal: QA_PENDING[0].modal,
  },
];

export function QuestionsPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientModal = useDoctorUiStore((s) => s.openPatientModal);

  return (
    <>
      <DashPageHeader subtitle="👨‍⚕️ Physician Dashboard" title="Patient Questions" dateStr={todayFormatted()} />

      <DashCard
        title={
          <>
            💬 Pending Your Reply{" "}
            <span style={{ fontSize: "0.72rem", background: "var(--red)", color: "#fff", padding: "2px 8px", borderRadius: 50, marginLeft: 4 }}>
              12
            </span>
          </>
        }
      >
        {MORE_PENDING.map((q) => (
          <div key={q.name + q.spec} className="qa-item">
            <div className="qa-top">
              <PersonAvatar initials={q.initials} className="qa-av" style={{ background: q.avatarBg }} seed={q.name} />
              <div className="qa-meta">
                <div className="qa-pname">
                  {q.name}
                  {q.urgent ? <span className="qa-urgent">⚡ Urgent</span> : null}
                </div>
                <div className="qa-spec">{q.spec}</div>
              </div>
            </div>
            <div className="qa-q">&quot;{q.question}&quot;</div>
            <div className="qa-actions">
              <button type="button" className="qa-btn reply" onClick={() => showToast("Reply editor opened")}>
                ✏️ Reply Now
              </button>
              <button type="button" className="qa-btn" onClick={() => openPatientModal(q.modal)}>
                📋 Patient File
              </button>
              <button type="button" className="qa-btn" onClick={() => showToast("Calling patient...")}>
                📞 Call
              </button>
            </div>
          </div>
        ))}
      </DashCard>

      <DashCard title="✅ Recently Answered">
        {ANSWERED.map((item) => (
          <div key={item.name} style={{ padding: "16px 0", borderBottom: "1px solid var(--gray-100)" }}>
            <div style={{ fontWeight: 600, fontSize: "0.84rem", marginBottom: 8, display: "flex", gap: 7 }}>
              <span>✅</span>
              <span>
                <strong>{item.name}:</strong> {item.question}
              </span>
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
              {item.answer}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>
              {item.date} ·{" "}
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
        ))}
      </DashCard>
    </>
  );
}
