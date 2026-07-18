"use client";

import { useEffect } from "react";
import { formatDate, formatDateTime } from "@/lib/data-mappers";
import type { PatientClinicalNote } from "@/services/doctor-api-hooks";

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

function authorLabel(note: PatientClinicalNote) {
  if (note.author) {
    const name = `${note.author.firstName} ${note.author.lastName}`.trim();
    return note.authorType === "DOCTOR" ? `Dr. ${name}` : name;
  }
  if (note.authorType === "DOCTOR" && note.doctor?.user) {
    return `Dr. ${note.doctor.user.firstName} ${note.doctor.user.lastName}`;
  }
  if (note.patient?.user) {
    return `${note.patient.user.firstName} ${note.patient.user.lastName}`;
  }
  return note.authorType === "DOCTOR" ? "Physician" : "Patient";
}

export function ClinicalNoteDetailsView({
  note,
  role,
  onMarkRead,
  onBack,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: {
  note: PatientClinicalNote;
  role: "doctor" | "patient";
  onMarkRead?: () => void;
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  useEffect(() => {
    if (note.isUnread && onMarkRead) onMarkRead();
  }, [note.id, note.isUnread, onMarkRead]);

  const handlePrint = () => window.print();

  const doctorName = note.doctor?.user
    ? `Dr. ${note.doctor.user.firstName} ${note.doctor.user.lastName}`
    : "—";
  const patientName = note.patient?.user
    ? `${note.patient.user.firstName} ${note.patient.user.lastName}`
    : "—";

  const attachments = Array.isArray(note.attachments) ? note.attachments : [];

  return (
    <div className="clinical-note-details">
      <div className="cnd-toolbar no-print">
        {onBack ? (
          <button type="button" className="btn-om" onClick={onBack}>
            ← Back
          </button>
        ) : null}
        <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
          {canEdit && onEdit ? (
            <button type="button" className="btn-om" onClick={onEdit}>
              ✏️ Edit
            </button>
          ) : null}
          {canDelete && onDelete ? (
            <button type="button" className="btn-om" onClick={onDelete}>
              🗑 Delete
            </button>
          ) : null}
          <button type="button" className="btn-bm" onClick={handlePrint}>
            🖨 Print
          </button>
        </div>
      </div>

      <div className="cnd-card" id="clinical-note-print">
        <div className="cnd-header">
          <div>
            <div className="cnd-eyebrow">Clinical Note</div>
            <h1 className="cnd-title">{note.title}</h1>
          </div>
          <div className="cnd-badges">
            <span className="note-type-chip">{note.noteType}</span>
            {note.priority ? (
              <span className={`cnd-priority cnd-priority-${note.priority.toLowerCase()}`}>
                {PRIORITY_LABELS[note.priority] ?? note.priority}
              </span>
            ) : null}
            {note.readStatus ? (
              <span className={`cnd-read ${note.isUnread ? "unread" : "read"}`}>{note.readStatus}</span>
            ) : null}
          </div>
        </div>

        <div className="cnd-meta-grid">
          <div>
            <span className="cnd-meta-label">Doctor</span>
            <strong>{doctorName}</strong>
          </div>
          <div>
            <span className="cnd-meta-label">Patient</span>
            <strong>{patientName}</strong>
          </div>
          <div>
            <span className="cnd-meta-label">Appointment</span>
            <strong>
              {note.appointment
                ? formatDateTime(note.appointment.scheduledAt)
                : "Not linked"}
            </strong>
          </div>
          <div>
            <span className="cnd-meta-label">Author</span>
            <strong>{authorLabel(note)}</strong>
          </div>
          <div>
            <span className="cnd-meta-label">Created</span>
            <strong>{formatDateTime(note.createdAt)}</strong>
          </div>
          <div>
            <span className="cnd-meta-label">Last Updated</span>
            <strong>{formatDateTime(note.updatedAt)}</strong>
          </div>
          {note.followUpReminderAt ? (
            <div>
              <span className="cnd-meta-label">Follow-up Reminder</span>
              <strong>{formatDate(note.followUpReminderAt)}</strong>
            </div>
          ) : null}
        </div>

        <div className="cnd-section">
          <h3>Clinical Notes</h3>
          <div className="cnd-content" dangerouslySetInnerHTML={{ __html: note.clinicalNotes || "<p>—</p>" }} />
        </div>

        {note.followUpNotes ? (
          <div className="cnd-section">
            <h3>Follow-up Notes</h3>
            <div className="cnd-plain">{note.followUpNotes}</div>
          </div>
        ) : null}

        {role === "doctor" && note.privateNotes ? (
          <div className="cnd-section cnd-private">
            <h3>Private / Internal Notes</h3>
            <div className="cnd-plain">{note.privateNotes}</div>
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div className="cnd-section">
            <h3>Attachments</h3>
            <div className="cnd-attachments">
              {attachments.map((file, index) => (
                <a key={`${file.url}-${index}`} href={file.url} target="_blank" rel="noreferrer" className="cnd-attachment">
                  📎 {file.name || file.url}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <div className="cnd-footer">
          <span>DrInsight Clinical Records</span>
          <span>Printed {formatDateTime(new Date().toISOString())}</span>
        </div>
      </div>
    </div>
  );
}
