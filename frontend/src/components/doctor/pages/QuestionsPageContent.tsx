"use client";

import { useState } from "react";
import {
  BadgeCheck,
  ClipboardList,
  DoctorIcon,
  DoctorIconInline,
  MessageSquare,
  Pencil,
  Phone,
  PhysicianDashboardLabel,
  Zap,
} from "@/components/doctor/icons/DoctorIcons";
import { DashCard, DashPageHeader, PersonAvatar } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate, formatRelativeTime, getInitials, gradientForId } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import { useAnswerQuestion, usePendingQuestions } from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

function EmptyState({ loading, message }: { loading?: boolean; message: string }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
      {loading ? "Loading..." : message}
    </div>
  );
}

export function QuestionsPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientModal = useDoctorUiStore((s) => s.openPatientModal);
  const questionsQuery = usePendingQuestions();
  const answerQuestion = useAnswerQuestion();
  const [replyingId, setReplyingId] = useState<string | null>(null);

  const pending = questionsQuery.data?.data ?? [];
  const pendingCount = questionsQuery.data?.meta.total ?? 0;

  const handleReply = (id: string) => {
    const answer = window.prompt("Enter your answer:");
    if (!answer?.trim()) return;
    setReplyingId(id);
    answerQuestion.mutate(
      { id, answer: answer.trim() },
      {
        onSuccess: () => showToast("Answer submitted successfully"),
        onError: () => showToast("Failed to submit answer"),
        onSettled: () => setReplyingId(null),
      },
    );
  };

  return (
    <>
      <DashPageHeader subtitle={<PhysicianDashboardLabel />} title="Patient Questions" dateStr={todayFormatted()} />

      <DashCard
        title={
          <>
            <DoctorIconInline icon={MessageSquare} size="button">
              Pending Your Reply{" "}
            </DoctorIconInline>
            {!questionsQuery.isLoading && pendingCount > 0 ? (
              <span style={{ fontSize: "0.72rem", background: "var(--red)", color: "#fff", padding: "2px 8px", borderRadius: 50, marginLeft: 4 }}>
                {pendingCount}
              </span>
            ) : null}
          </>
        }
      >
        {questionsQuery.isLoading ? (
          <EmptyState loading message="" />
        ) : pending.length === 0 ? (
          <EmptyState message="No pending questions — all caught up!" />
        ) : (
          pending.map((q) => {
            const name = q.isAnonymous ? q.submitterName ?? "Anonymous" : q.submitterName ?? "Patient";
            const initials = getInitials(name.split(" ")[0], name.split(" ")[1]);
            const avatarBg = gradientForId(q.id);
            const modal = {
              initials,
              name,
              age: "—",
              gender: "M" as const,
              diagnosis: q.category,
              status: "Active" as const,
              avatarBg,
            };

            return (
              <div key={q.id} className="qa-item">
                <div className="qa-top">
                  <PersonAvatar initials={initials} className="qa-av" style={{ background: avatarBg }} seed={name} />
                  <div className="qa-meta">
                    <div className="qa-pname">
                      {name}
                      {q.category.toLowerCase().includes("urgent") ? (
                        <span className="qa-urgent">
                          <DoctorIconInline icon={Zap} size="sm">
                            Urgent
                          </DoctorIconInline>
                        </span>
                      ) : null}
                    </div>
                    <div className="qa-spec">
                      {q.category} · {formatRelativeTime(q.createdAt)}
                    </div>
                  </div>
                </div>
                <div className="qa-q">&quot;{q.question}&quot;</div>
                <div className="qa-actions">
                  <button
                    type="button"
                    className="qa-btn reply"
                    disabled={answerQuestion.isPending && replyingId === q.id}
                    onClick={() => handleReply(q.id)}
                  >
                    <DoctorIconInline icon={Pencil} size="sm">
                      Reply Now
                    </DoctorIconInline>
                  </button>
                  <button type="button" className="qa-btn" onClick={() => openPatientModal(modal)}>
                    <DoctorIconInline icon={ClipboardList} size="sm">
                      Patient File
                    </DoctorIconInline>
                  </button>
                  <button type="button" className="qa-btn" onClick={() => showToast("Calling patient...")}>
                    <DoctorIconInline icon={Phone} size="sm">
                      Call
                    </DoctorIconInline>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </DashCard>

      <DashCard title={<DoctorIconInline icon={BadgeCheck} size="button">Recently Answered</DoctorIconInline>}>
        {pending.filter((q) => q.answer).length === 0 ? (
          <EmptyState message="No recently answered questions in this view" />
        ) : (
          pending
            .filter((q) => q.answer)
            .map((q) => {
              const name = q.isAnonymous ? q.submitterName ?? "Anonymous" : q.submitterName ?? "Patient";
              return (
                <div key={q.id} style={{ padding: "16px 0", borderBottom: "1px solid var(--gray-100)" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.84rem", marginBottom: 8, display: "flex", gap: 7 }}>
                    <DoctorIcon icon={BadgeCheck} size="sm" />
                    <span>
                      <strong>{name}:</strong> {q.question}
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
                    {q.answer}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "var(--gray-400)" }}>
                    {q.answeredAt ? formatDate(q.answeredAt) : "—"} ·{" "}
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
              );
            })
        )}
      </DashCard>
    </>
  );
}
