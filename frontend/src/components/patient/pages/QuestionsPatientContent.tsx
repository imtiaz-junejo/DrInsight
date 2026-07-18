"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/patient/ui/PatientShared";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { doctorFullName, formatDate, getInitials, gradientForId } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import { useDoctors } from "@/services/api-hooks";
import {
  usePatientQuestions,
  useSubmitPatientQuestion,
  type PatientQuestion,
} from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

export type PatientQuestionView = "ask" | "pending" | "answered" | "rejected";

function QuestionCard({ item, view }: { item: PatientQuestion; view: PatientQuestionView }) {
  const doctorName = item.answeredBy
    ? doctorFullName(item.answeredBy)
    : item.doctor?.user
      ? doctorFullName(item.doctor.user)
      : "Medical Team";

  const statusChip =
    view === "pending" ? (
      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 50, background: "#fffbeb", color: "#d97706" }}>
        pending
      </span>
    ) : view === "answered" ? (
      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 50, background: "var(--blue-light)", color: "var(--blue)" }}>
        answered
      </span>
    ) : (
      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 50, background: "#fef2f2", color: "var(--red)" }}>
        rejected
      </span>
    );

  return (
    <div style={{ padding: "16px 0", borderBottom: "1px solid var(--gray-100)" }}>
      <div style={{ fontWeight: 600, fontSize: "0.86rem", color: "var(--gray-900)", marginBottom: 8, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <span style={{ color: "var(--blue)", flexShrink: 0 }}>❓</span>
        {item.title ?? item.question}
      </div>
      {view === "answered" && item.answer ? (
        <div style={{ fontSize: "0.82rem", color: "var(--gray-500)", lineHeight: 1.6, paddingLeft: 20, borderLeft: "2px solid var(--blue-light)", marginBottom: 6 }}>
          {doctorName} answered: {item.answer}
        </div>
      ) : view === "rejected" ? (
        <div style={{ fontSize: "0.82rem", color: "var(--gray-500)", lineHeight: 1.6, paddingLeft: 20, borderLeft: "2px solid #fecaca", marginBottom: 6 }}>
          {item.rejectReason ?? "This question could not be approved."}
        </div>
      ) : (
        <div style={{ fontSize: "0.82rem", color: "var(--gray-500)", lineHeight: 1.6, paddingLeft: 20, borderLeft: "2px solid var(--blue-light)", marginBottom: 6 }}>
          {item.question}
        </div>
      )}
      <div style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>
        {formatDate(item.answeredAt ?? item.createdAt)} &nbsp;·&nbsp; {statusChip}
      </div>
    </div>
  );
}

function AskQuestionWizard() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const submitMutation = useSubmitPatientQuestion();
  const doctorsQuery = useDoctors({ limit: 50 });
  const [step, setStep] = useState(1);
  const [dept, setDept] = useState<string | null>(null);
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const departments = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of doctorsQuery.data?.data ?? []) {
      const key = d.specialty ?? "General Medicine";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [doctorsQuery.data?.data]);

  const doctorsInDept = useMemo(
    () => (doctorsQuery.data?.data ?? []).filter((d) => (d.specialty ?? "General Medicine") === dept),
    [doctorsQuery.data?.data, dept],
  );

  const selectedDoctor = (doctorsQuery.data?.data ?? []).find((d) => d.id === doctorId);

  const stepBar = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
      {["1. Department", "2. Doctor", "3. Your Question"].map((label, index) => {
        const active = step === index + 1;
        const done = step > index + 1;
        return (
          <span
            key={label}
            style={{
              fontSize: "0.74rem",
              fontWeight: 700,
              padding: "6px 14px",
              borderRadius: 50,
              background: active ? "var(--blue)" : done ? "var(--blue-light)" : "var(--gray-100)",
              color: active ? "#fff" : done ? "var(--blue)" : "var(--gray-400)",
            }}
          >
            {done ? "✓ " : ""}
            {label}
          </span>
        );
      })}
    </div>
  );

  const handleSubmit = () => {
    if (!title.trim() || !details.trim() || !dept) {
      showToast("⚠️ Please complete all required fields");
      return;
    }
    submitMutation.mutate(
      {
        category: dept,
        title: title.trim(),
        question: details.trim(),
        doctorId: doctorId ?? undefined,
      },
      {
        onSuccess: () => {
          showToast("📨 Question submitted — awaiting review");
          setStep(1);
          setDept(null);
          setDoctorId(null);
          setTitle("");
          setDetails("");
        },
        onError: () => showToast("Could not submit question"),
      },
    );
  };

  if (step === 1) {
    return (
      <DashCard title="🏥 Step 1 — Select Department / Specialty">
        {stepBar}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12 }}>
          {departments.map((d) => (
            <button
              key={d.name}
              type="button"
              className="tool-card"
              style={{ border: "1.5px solid var(--gray-200)", borderRadius: 14, padding: "18px 16px", textAlign: "left" }}
              onClick={() => {
                setDept(d.name);
                setStep(2);
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{d.name}</div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, background: "var(--blue-light)", color: "var(--blue)", padding: "2px 9px", borderRadius: 50, marginTop: 8, display: "inline-block" }}>
                {d.count} doctor{d.count === 1 ? "" : "s"}
              </div>
            </button>
          ))}
        </div>
      </DashCard>
    );
  }

  if (step === 2) {
    return (
      <DashCard title={`Step 2 — Select a Doctor in ${dept}`}>
        {stepBar}
        <div className="cons-list">
          {doctorsInDept.map((d) => (
            <div key={d.id} className="cons-card upcoming">
              <div className="cons-top">
                <div className="dr-av" style={{ background: gradientForId(d.id) }}>
                  {getInitials(d.user?.firstName, d.user?.lastName)}
                </div>
                <div>
                  <div className="cons-dr-name">{doctorFullName(d.user)}</div>
                  <div className="cons-dr-spec">{d.specialty}</div>
                </div>
              </div>
              <div className="cons-actions">
                <button type="button" className="ca-btn primary" onClick={() => { setDoctorId(d.id); setStep(3); }}>
                  💬 Ask Question
                </button>
                <Link href={`/book-consultation?doctor=${d.id}`}>
                  <button type="button" className="ca-btn">📅 Book Appointment</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="ca-btn" style={{ marginTop: 14 }} onClick={() => setStep(1)}>
          ← Back to Departments
        </button>
      </DashCard>
    );
  }

  return (
    <DashCard title={`✍️ Step 3 — Your Question${selectedDoctor ? ` for ${doctorFullName(selectedDoctor.user)}` : ""}`}>
      {stepBar}
      <div className="form-row">
        <div className="form-group">
          <label>Question Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="One-line summary of your question" />
        </div>
      </div>
      <div className="form-group">
        <label>Question Details *</label>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Describe your symptoms, history and what you want to know..." rows={5} />
      </div>
      <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", margin: "8px 0 12px" }}>
        ℹ️ Your question is reviewed by our team first; the doctor only sees it after approval.
      </div>
      <DashButton variant="solid" onClick={handleSubmit}>
        {submitMutation.isPending ? "Submitting..." : "📨 Submit Question"}
      </DashButton>
      <button type="button" className="ca-btn" style={{ marginLeft: 8 }} onClick={() => setStep(2)}>
        ← Change Doctor
      </button>
    </DashCard>
  );
}

export function QuestionsPatientContent({ view }: { view: PatientQuestionView }) {
  const showToast = usePatientUiStore((s) => s.showToast);
  const listView = view === "ask" ? "pending" : view;
  const questionsQuery = usePatientQuestions(listView, { limit: 20 });

  const titles: Record<PatientQuestionView, string> = {
    ask: "Ask a Question",
    pending: "Pending Approval",
    answered: "Answered Questions",
    rejected: "Rejected Questions",
  };

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title={titles[view]}
        dateStr={todayFormatted()}
        actions={
          view !== "ask" ? (
            <Link href="/patient/questions/ask">
              <DashButton variant="solid" onClick={() => showToast("Opening question form...")}>
                + Ask New Question
              </DashButton>
            </Link>
          ) : null
        }
      />

      {view === "ask" ? (
        <AskQuestionWizard />
      ) : (
        <DashCard title={`💬 ${titles[view]}`}>
          {questionsQuery.isLoading ? (
            <EmptyState message="Loading questions..." />
          ) : (questionsQuery.data?.data ?? []).length > 0 ? (
            questionsQuery.data!.data.map((item) => <QuestionCard key={item.id} item={item} view={view} />)
          ) : (
            <EmptyState message="No questions in this category yet." />
          )}
        </DashCard>
      )}
    </>
  );
}
