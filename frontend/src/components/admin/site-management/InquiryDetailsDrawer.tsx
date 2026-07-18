"use client";

import { useState } from "react";
import { AdminButton, FormGrid, FormItem, StatusChip, UserCell } from "@/components/admin/ui/AdminPrimitives";
import { formatDate, formatRelativeTime } from "@/lib/data-mappers";
import {
  useAddContactInquiryNote,
  useAssignContactInquiry,
  useContactInquiry,
  useMarkContactInquiryRead,
  useReplyContactInquiry,
  useUpdateContactStatus,
  type ContactInquiry,
} from "@/services/cms-api-hooks";
import { useAdminUsers } from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

function statusChip(status: string) {
  if (status === "RESOLVED") return { label: "Resolved", className: "ch-g" };
  if (status === "IN_PROGRESS") return { label: "In Progress", className: "ch-b" };
  if (status === "ARCHIVED") return { label: "Archived", className: "ch-b" };
  return { label: "New", className: "ch-a" };
}

export function InquiryDetailsDrawer({
  inquiry,
  onClose,
}: {
  inquiry: ContactInquiry;
  onClose: () => void;
}) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const detailQuery = useContactInquiry(inquiry.id);
  const adminsQuery = useAdminUsers({ role: "ADMIN", limit: 50 });
  const updateStatus = useUpdateContactStatus();
  const assign = useAssignContactInquiry();
  const reply = useReplyContactInquiry();
  const addNote = useAddContactInquiryNote();
  const markRead = useMarkContactInquiryRead();

  const [replyText, setReplyText] = useState("");
  const [noteText, setNoteText] = useState("");
  const [assignId, setAssignId] = useState(inquiry.assignedStaffId ?? "");

  const detail = detailQuery.data ?? inquiry;
  const st = statusChip(detail.status);
  const parts = detail.name.trim().split(/\s+/);

  const exportInquiry = () => {
    const blob = new Blob([JSON.stringify(detail, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inquiry-${detail.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Inquiry exported");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 900 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>
            Inquiry Details <StatusChip label={st.label} className={st.className} />
          </h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-bd" style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="fg-item">
              <UserCell firstName={parts[0]} lastName={parts.slice(1).join(" ") || undefined} sub={detail.email} />
            </div>
            <div className="fg-item">
              <label>Phone</label>
              <p>{detail.phone ?? "—"}</p>
            </div>
            <div className="fg-item">
              <label>Inquiry Type</label>
              <p>{detail.inquiryType ?? "GENERAL"}</p>
            </div>
            <div className="fg-item">
              <label>Submitted</label>
              <p>{formatDate(detail.createdAt)} ({formatRelativeTime(detail.createdAt)})</p>
            </div>
            <div className="fg-item full">
              <label>Subject</label>
              <p>
                <strong>{detail.subject ?? "General Inquiry"}</strong>
              </p>
            </div>
            <div className="fg-item full">
              <label>Message</label>
              <div style={{ padding: 12, background: "var(--gray-50)", borderRadius: 8, whiteSpace: "pre-wrap" }}>
                {detail.message}
              </div>
            </div>
          </div>

          <FormGrid>
            <FormItem label="Assign Staff">
              <select value={assignId} onChange={(e) => setAssignId(e.target.value)}>
                <option value="">Unassigned</option>
                {(adminsQuery.data?.data ?? []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </FormItem>
            <FormItem label=" ">
              <AdminButton
                onClick={() =>
                  assign.mutate(
                    { id: detail.id, assignedStaffId: assignId || null },
                    { onSuccess: () => showToast("Staff assigned") },
                  )
                }
              >
                Assign
              </AdminButton>
            </FormItem>
          </FormGrid>

          <div className="btn-row" style={{ margin: "12px 0" }}>
            <AdminButton onClick={() => markRead.mutate(detail.id, { onSuccess: () => showToast("Marked as read") })}>
              Mark Read
            </AdminButton>
            <AdminButton
              onClick={() =>
                updateStatus.mutate({ id: detail.id, status: "IN_PROGRESS" }, { onSuccess: () => showToast("In progress") })
              }
            >
              In Progress
            </AdminButton>
            <AdminButton
              variant="green"
              onClick={() =>
                updateStatus.mutate({ id: detail.id, status: "RESOLVED" }, { onSuccess: () => showToast("Resolved ✓") })
              }
            >
              Resolve
            </AdminButton>
            <AdminButton
              onClick={() =>
                updateStatus.mutate({ id: detail.id, status: "ARCHIVED" }, { onSuccess: () => showToast("Archived") })
              }
            >
              Archive
            </AdminButton>
            <AdminButton onClick={exportInquiry}>Export</AdminButton>
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <strong>Reply to Customer</strong>
            <textarea
              rows={3}
              style={{ width: "100%", marginTop: 8 }}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
            />
            <div className="btn-row" style={{ marginTop: 8 }}>
              <AdminButton
                variant="primary"
                onClick={() => {
                  if (!replyText.trim()) return;
                  reply.mutate(
                    { id: detail.id, message: replyText.trim(), isInternal: false },
                    {
                      onSuccess: () => {
                        setReplyText("");
                        showToast("Reply sent");
                      },
                    },
                  );
                }}
              >
                Send Reply
              </AdminButton>
            </div>
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <strong>Internal Notes</strong>
            <textarea
              rows={2}
              style={{ width: "100%", marginTop: 8 }}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add internal note..."
            />
            <div style={{ marginTop: 8 }}>
              <AdminButton
                onClick={() => {
                  if (!noteText.trim()) return;
                  addNote.mutate(
                    { id: detail.id, note: noteText.trim() },
                    {
                      onSuccess: () => {
                        setNoteText("");
                        showToast("Note added");
                      },
                    },
                  );
                }}
              >
                Add Note
              </AdminButton>
            </div>
            {(detailQuery.data?.notes ?? []).map((n) => (
              <div key={n.id} style={{ marginTop: 8, padding: 8, background: "var(--gray-50)", borderRadius: 6 }}>
                <small>
                  {n.author ? `${n.author.firstName} ${n.author.lastName}` : "Staff"} · {formatRelativeTime(n.createdAt)}
                </small>
                <p style={{ margin: "4px 0 0" }}>{n.note}</p>
              </div>
            ))}
          </div>

          <div className="panel" style={{ marginTop: 12 }}>
            <strong>Response History</strong>
            {(detailQuery.data?.replies ?? []).length === 0 ? (
              <p className="empty-state">No replies yet</p>
            ) : (
              (detailQuery.data?.replies ?? []).map((r) => (
                <div key={r.id} style={{ marginTop: 8, padding: 8, background: r.isInternal ? "#fef3c7" : "var(--gray-50)", borderRadius: 6 }}>
                  <small>
                    {r.author ? `${r.author.firstName} ${r.author.lastName}` : "Staff"}
                    {r.isInternal ? " (internal)" : ""} · {formatRelativeTime(r.createdAt)}
                  </small>
                  <p style={{ margin: "4px 0 0" }}>{r.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="modal-ft">
          <AdminButton onClick={onClose}>Close</AdminButton>
        </div>
      </div>
    </div>
  );
}
