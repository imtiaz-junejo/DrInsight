"use client";

import { useState } from "react";
import { ConsModal, ConsModalButton } from "@/components/doctor/ui/ConsModal";
import { DashCard, DashPageHeader, PersonAvatar } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate, getInitials, gradientForId, specialtyEmoji } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  useAnswerQuestion,
  useDoctorQuestions,
  useRejectQuestion,
  useSaveQuestionDraft,
  type DoctorQuestion,
  type DoctorQuestionView,
} from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const VIEW_META: Record<DoctorQuestionView, [string, string, string]> = {
  new: ["📥 New Questions", "Questions awaiting your first response", "No new questions — you're all caught up."],
  drafts: ["📝 Pending Answers", "Questions with saved drafts, not yet submitted", "No pending drafts."],
  answered: ["💬 Answered Questions", "Answers are instantly visible to patients", "No answered questions yet."],
  rejected: ["⛔ Rejected Questions", "Questions declined with a reason", "Nothing here."],
};

function questionTitle(q: DoctorQuestion): string {
  const text = q.question.trim();
  return text.length > 70 ? `${text.slice(0, 70)}…` : text;
}

function submitterName(q: DoctorQuestion): string {
  return q.isAnonymous ? "Anonymous" : q.submitterName || "Patient";
}

function qaChip(q: DoctorQuestion) {
  if (q.status === "ANSWERED") return <span className="cons-chip cc-done">💬 Answered</span>;
  if (q.status === "REJECTED") return <span className="cons-chip cc-cancel">⛔ Rejected</span>;
  return <span className="cons-chip cc-up">✅ Awaiting answer</span>;
}

type ModalState =
  | { kind: "answer"; q: DoctorQuestion }
  | { kind: "view"; q: DoctorQuestion }
  | { kind: "reject"; q: DoctorQuestion }
  | null;

export function DoctorQAContent({ view }: { view: DoctorQuestionView }) {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);
  const [answerText, setAnswerText] = useState("");
  const [rejectWhy, setRejectWhy] = useState("");

  const query = useDoctorQuestions(view, { page, limit: 20 });
  const answerQuestion = useAnswerQuestion();
  const saveDraft = useSaveQuestionDraft();
  const rejectQuestion = useRejectQuestion();

  const meta = VIEW_META[view];
  const list = query.data?.data ?? [];
  const totalPages = query.data?.meta?.totalPages ?? 1;

  const closeModal = () => {
    setModal(null);
    setAnswerText("");
    setRejectWhy("");
  };

  const openAnswer = (q: DoctorQuestion) => {
    setAnswerText(q.answerDraft ?? "");
    setModal({ kind: "answer", q });
  };

  const doSaveDraft = () => {
    if (!modal || modal.kind !== "answer") return;
    if (!answerText.trim()) {
      showToast("⚠️ Write something first");
      return;
    }
    saveDraft.mutate(
      { id: modal.q.id, draft: answerText.trim() },
      {
        onSuccess: () => {
          closeModal();
          showToast("💾 Draft saved — find it under Pending Answers");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to save draft"),
      },
    );
  };

  const doSubmit = () => {
    if (!modal || modal.kind !== "answer") return;
    if (!answerText.trim()) {
      showToast("⚠️ The answer cannot be empty");
      return;
    }
    answerQuestion.mutate(
      { id: modal.q.id, answer: answerText.trim() },
      {
        onSuccess: () => {
          closeModal();
          showToast("📨 Answer submitted — instantly visible to the patient");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to submit answer"),
      },
    );
  };

  const doReject = () => {
    if (!modal || modal.kind !== "reject") return;
    rejectQuestion.mutate(
      { id: modal.q.id, reason: rejectWhy.trim() || "Not suitable for public Q&A" },
      {
        onSuccess: () => {
          closeModal();
          showToast("⛔ Question rejected");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to reject question"),
      },
    );
  };

  const questionCard = (q: DoctorQuestion) => {
    const name = submitterName(q);
    const cardCls = q.status === "ANSWERED" ? "completed" : q.status === "REJECTED" ? "cancelled" : "upcoming";
    return (
      <div key={q.id} className={`cons-card ${cardCls}`}>
        <div className="cons-top">
          <PersonAvatar
            initials={getInitials(name.split(" ")[0], name.split(" ")[1])}
            seed={q.id}
            style={{ background: gradientForId(q.id) }}
          />
          <div>
            <div className="cons-dr-name">{questionTitle(q)}</div>
            <div className="cons-dr-spec">
              🧑 {name} · {specialtyEmoji(q.category)} {q.category}
            </div>
          </div>
          {qaChip(q)}
        </div>
        <div className="cons-details">
          <span>🆔 Q-{q.id.slice(-4).toUpperCase()}</span>
          <span>📅 Submitted {formatDate(q.createdAt)}</span>
        </div>
        {q.status === "REJECTED" ? (
          <div className="cons-note">
            ⛔ <strong>Rejected</strong>
            {q.rejectReason ? <> — {q.rejectReason}</> : null}
          </div>
        ) : (
          <div className="cons-note">❓ {q.question}</div>
        )}
        {q.answerDraft && q.status === "PENDING" ? (
          <div className="cons-note green">
            📝 <strong>Draft saved:</strong> {q.answerDraft.slice(0, 140)}
            {q.answerDraft.length > 140 ? "…" : ""}
          </div>
        ) : null}
        {q.answer ? (
          <div className="cons-note green">
            💬 <strong>Your answer:</strong> {q.answer.slice(0, 160)}
            {q.answer.length > 160 ? "…" : ""}
          </div>
        ) : null}
        <div className="cons-actions">
          {q.status === "PENDING" ? (
            <>
              <button type="button" className="ca-btn primary" onClick={() => openAnswer(q)}>
                {q.answerDraft ? "✏️ Edit Answer (draft)" : "💬 Answer"}
              </button>
              <button type="button" className="ca-btn" onClick={() => setModal({ kind: "view", q })}>
                👁 View
              </button>
              <button type="button" className="ca-btn danger" onClick={() => setModal({ kind: "reject", q })}>
                ⛔ Reject
              </button>
            </>
          ) : (
            <>
              <button type="button" className="ca-btn" onClick={() => setModal({ kind: "view", q })}>
                👁 View
              </button>
              {q.status === "ANSWERED" ? (
                <button type="button" className="ca-btn" onClick={() => setModal({ kind: "view", q })}>
                  📖 View Answer
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <DashPageHeader subtitle="👨‍⚕️ Physician Dashboard" title="Patient Q&A" dateStr={todayFormatted()} />

      {view === "new" && list.length > 0 ? (
        <div className="alert-banner">
          <div className="ab-ico">🔔</div>
          <div className="ab-text">
            <strong>
              {list.length} question{list.length !== 1 ? "s" : ""} awaiting your answer
            </strong>
            <span>Answers become visible to the patient the moment you submit.</span>
          </div>
        </div>
      ) : null}

      <DashCard title={meta[0]}>
        <div style={{ fontSize: ".78rem", color: "var(--gray-500)", margin: "-4px 0 12px" }}>{meta[1]}</div>
        {query.isLoading ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
            Loading...
          </div>
        ) : list.length === 0 ? (
          <div className="oc-empty">
            <span className="big">💬</span>
            {meta[2]}
          </div>
        ) : (
          <div className="cons-list">{list.map(questionCard)}</div>
        )}
        {totalPages > 1 ? (
          <div className="table-pager">
            <span>
              Page {page} of {totalPages} · {query.data?.meta?.total ?? 0} questions
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="tbl-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              <button type="button" className="tbl-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          </div>
        ) : null}
      </DashCard>

      <ConsModal
        open={modal?.kind === "answer"}
        icon="💬"
        title={`Answer — Q-${modal ? modal.q.id.slice(-4).toUpperCase() : ""}`}
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Cancel
            </ConsModalButton>
            <ConsModalButton variant="ghost" onClick={doSaveDraft} disabled={saveDraft.isPending}>
              💾 Save Draft
            </ConsModalButton>
            <ConsModalButton variant="blue" onClick={doSubmit} disabled={answerQuestion.isPending}>
              📨 Submit Answer
            </ConsModalButton>
          </>
        }
      >
        {modal?.kind === "answer" ? (
          <>
            <p className="cons-sub">
              <b>{submitterName(modal.q)}:</b> {modal.q.question}
            </p>
            <div style={{ marginTop: 12 }}>
              <label>Your Answer</label>
              <textarea
                style={{ minHeight: 130 }}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your clinical answer..."
              />
            </div>
            <p className="cons-sub" style={{ marginTop: 6 }}>
              💾 Save Draft keeps it editable · 📨 Submit makes it instantly visible to the patient.
            </p>
          </>
        ) : null}
      </ConsModal>

      <ConsModal
        open={modal?.kind === "view"}
        icon={modal?.kind === "view" && modal.q.status === "ANSWERED" ? "📖" : "💬"}
        title={`Q-${modal ? modal.q.id.slice(-4).toUpperCase() : ""} — ${modal ? questionTitle(modal.q) : ""}`}
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Close
            </ConsModalButton>
            {modal?.kind === "view" && modal.q.status === "PENDING" ? (
              <ConsModalButton
                variant="blue"
                onClick={() => {
                  const q = modal.q;
                  closeModal();
                  openAnswer(q);
                }}
              >
                💬 Answer
              </ConsModalButton>
            ) : null}
          </>
        }
      >
        {modal?.kind === "view" ? (
          <>
            <p className="cons-sub">
              🧑 {submitterName(modal.q)} · {specialtyEmoji(modal.q.category)} {modal.q.category} · 📅{" "}
              {formatDate(modal.q.createdAt)}
            </p>
            {modal.q.status === "REJECTED" ? (
              <div className="cons-note">
                ⛔ Rejected{modal.q.rejectReason ? ` — ${modal.q.rejectReason}` : ""}
              </div>
            ) : (
              <p>
                <b>Question:</b> {modal.q.question}
              </p>
            )}
            {modal.q.answer ? (
              <div className="cons-note green" style={{ marginTop: 12 }}>
                💬 <strong>Your answer{modal.q.answeredAt ? ` (${formatDate(modal.q.answeredAt)})` : ""}:</strong>
                <br />
                {modal.q.answer}
              </div>
            ) : null}
            {modal.q.status === "ANSWERED" ? (
              <p className="cons-sub" style={{ marginTop: 8 }}>
                This answer is already visible to the patient.
              </p>
            ) : null}
          </>
        ) : null}
      </ConsModal>

      <ConsModal
        open={modal?.kind === "reject"}
        icon="⛔"
        title="Reject Question"
        warn
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Back
            </ConsModalButton>
            <ConsModalButton variant="red" onClick={doReject} disabled={rejectQuestion.isPending}>
              ⛔ Reject Question
            </ConsModalButton>
          </>
        }
      >
        <p>
          Reject this question from <b>{modal ? submitterName(modal.q) : ""}</b>? It will no longer be available for
          answering.
        </p>
        <div style={{ marginTop: 12 }}>
          <label>Reason</label>
          <textarea
            value={rejectWhy}
            onChange={(e) => setRejectWhy(e.target.value)}
            placeholder="e.g. Requires an in-person examination — please book a consultation"
          />
        </div>
      </ConsModal>
    </>
  );
}
