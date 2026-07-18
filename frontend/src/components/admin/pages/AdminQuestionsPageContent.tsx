"use client";

import { useMemo, useState } from "react";
import {
  AdminButton,
  AdminPanel,
  GridTwo,
  PanelTable,
  StatCardRow,
  StatusChip,
  UserCell,
} from "@/components/admin/ui/AdminPrimitives";
import { adminAppointmentDetailHref } from "@/lib/admin-routes";
import { formatNumber, formatRelativeTime } from "@/lib/admin-utils";
import { exportTableCsv } from "@/lib/analytics-range";
import { useAdminUiStore } from "@/store/admin-ui.store";
import {
  useAdminQuestions,
  useApproveQuestion,
  useAdminRejectQuestion,
  type AdminQuestion,
} from "@/services/admin-api-hooks";

export type AdminQuestionView = "pending" | "approved" | "rejected" | "answered" | "reports";

const VIEW_TITLES: Record<AdminQuestionView, string> = {
  pending: "🕒 Pending Questions — review gate",
  approved: "✅ Approved Questions",
  rejected: "⛔ Rejected Questions",
  answered: "💬 Answered Questions",
  reports: "📊 Patient Q&A Reports",
};

function questionStatusChip(status: string) {
  if (status === "PENDING") return { label: "🕒 Pending", className: "ch-a" };
  if (status === "APPROVED") return { label: "✅ Approved", className: "ch-b" };
  if (status === "ANSWERED") return { label: "💬 Answered", className: "ch-g" };
  return { label: "⛔ Rejected", className: "ch-r" };
}

function patientName(q: AdminQuestion) {
  if (q.submitter) return `${q.submitter.firstName} ${q.submitter.lastName}`.trim();
  return q.submitterName || "Anonymous";
}

function doctorName(q: AdminQuestion) {
  const user = q.doctor?.user;
  if (!user) return "—";
  return `Dr. ${user.firstName} ${user.lastName}`;
}

export function AdminQuestionsPageContent({ view }: { view: AdminQuestionView }) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const questionsQuery = useAdminQuestions({ view, page, limit: 20, search: search || undefined });
  const approve = useApproveQuestion();
  const reject = useAdminRejectQuestion();

  const stats = questionsQuery.data?.stats ?? questionsQuery.data?.totals;
  const questions = questionsQuery.data?.data ?? [];
  const meta = questionsQuery.data?.meta;

  const statCards = useMemo(
    () => [
      {
        ic: "ic3",
        icon: "🕒",
        num: formatNumber(stats?.pending ?? 0),
        label: "Pending Review",
        tag: "hidden from doctors",
        tagClass: "tt-a",
      },
      {
        ic: "ic1",
        icon: "✅",
        num: formatNumber(stats?.approved ?? 0),
        label: "Approved",
        tag: "with doctors",
        tagClass: "tt-b",
      },
      {
        ic: "ic2",
        icon: "💬",
        num: formatNumber(stats?.answered ?? 0),
        label: "Answered",
        tag: "visible to patients",
        tagClass: "tt-g",
      },
      {
        ic: "ic4",
        icon: "⛔",
        num: formatNumber(stats?.rejected ?? 0),
        label: "Rejected",
        tag: "returned",
        tagClass: "tt-a",
      },
    ],
    [stats],
  );

  if (view === "reports") {
    const byCategory = questionsQuery.data?.byCategory ?? [];
    const byMonth = questionsQuery.data?.byMonth ?? [];
    const categoryRows = byCategory.map((row) => [row.category, String(row.count)]);
    const monthRows = byMonth.map((row) => [row.month, String(row.count)]);

    return (
      <>
        <StatCardRow items={statCards} />
        <GridTwo>
          <PanelTable
            title="📂 Questions by Department"
            headers={["Category", "Count"]}
            rows={categoryRows}
            loading={questionsQuery.isLoading}
            emptyMessage="No question data yet"
          />
          <PanelTable
            title="📅 Questions by Month"
            headers={["Month", "Count"]}
            rows={monthRows}
            loading={questionsQuery.isLoading}
            emptyMessage="No question data yet"
          />
        </GridTwo>
      </>
    );
  }

  const rows = questions.map((q) => {
    const chip = questionStatusChip(q.status);
    const attachments = Array.isArray(q.attachments) ? q.attachments.length : 0;
    return [
      <strong key={`${q.id}-id`}>{q.id.slice(0, 8).toUpperCase()}</strong>,
      <UserCell
        key={`${q.id}-p`}
        firstName={q.submitter?.firstName ?? patientName(q).split(" ")[0]}
        lastName={q.submitter?.lastName ?? patientName(q).split(" ").slice(1).join(" ")}
        sub={q.submitter?.email}
        seed={q.id}
        userId={q.submitter?.id}
      />,
      <div key={`${q.id}-t`} style={{ maxWidth: 230 }}>
        <b style={{ fontSize: "0.8rem" }}>{q.title || q.question.slice(0, 80)}</b>
        {attachments > 0 ? (
          <div style={{ fontSize: "0.66rem", color: "var(--gray-400)" }}>
            📎 {attachments} attachment{attachments > 1 ? "s" : ""}
          </div>
        ) : null}
      </div>,
      q.category,
      doctorName(q),
      formatRelativeTime(q.createdAt),
      <StatusChip key={`${q.id}-s`} label={chip.label} className={chip.className} />,
      <div key={`${q.id}-a`} className="btn-row">
        {view === "pending" ? (
          <>
            <AdminButton
              variant="green"
              onClick={() => {
                approve.mutate(
                  { id: q.id, doctorId: q.doctor?.id },
                  { onSuccess: () => showToast(`✅ Question approved`) },
                );
              }}
            >
              ✓ Approve
            </AdminButton>
            <AdminButton
              variant="danger"
              onClick={() => {
                const reason = window.prompt("Rejection reason for the patient:");
                if (!reason?.trim()) return;
                reject.mutate(
                  { id: q.id, reason: reason.trim() },
                  { onSuccess: () => showToast("Question rejected") },
                );
              }}
            >
              ⛔ Reject
            </AdminButton>
          </>
        ) : null}
      </div>,
    ];
  });

  return (
    <>
      <StatCardRow items={statCards} />
      <AdminPanel title="🔎 Filter & Search Questions">
        <div className="form-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <div className="fg-item">
            <label>Search</label>
            <input
              type="text"
              placeholder="ID, title, keywords..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </AdminPanel>
      <PanelTable
        title={VIEW_TITLES[view]}
        actions={
          <AdminButton
            onClick={() => {
              exportTableCsv(
                `questions-${view}.csv`,
                ["ID", "Patient", "Question", "Department", "Doctor", "Submitted", "Status"],
                questions.map((q) => [
                  q.id,
                  patientName(q),
                  q.title || q.question,
                  q.category,
                  doctorName(q),
                  q.createdAt,
                  q.status,
                ]),
              );
              showToast("CSV exported");
            }}
          >
            ⬇ Export CSV
          </AdminButton>
        }
        headers={["ID", "Patient", "Question", "Department", "Assigned Doctor", "Submitted", "Status", "Actions"]}
        rows={rows}
        loading={questionsQuery.isLoading}
        pagerInfo={`Showing ${questions.length} of ${meta?.total ?? 0} questions`}
        emptyMessage="No questions match the current filters."
      />
      {meta && meta.totalPages > 1 ? (
        <div className="btn-row" style={{ marginTop: 12 }}>
          <button type="button" className="btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
            Page {page} of {meta.totalPages}
          </span>
          <button type="button" className="btn" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      ) : null}
    </>
  );
}
