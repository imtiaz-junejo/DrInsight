"use client";

import { useMemo, useState } from "react";
import { DoctorRichTextEditor } from "@/components/doctor/patient/DoctorRichTextEditor";
import type { Appointment } from "@/services/api-hooks";
import type { ClinicalNoteAttachment } from "@/services/doctor-api-hooks";
import { useCreatePatientClinicalNote } from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

const NOTE_TYPES = ["Patient Note", "Symptom Update", "Follow-up Question", "Medication Note"];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

export function PatientAddNoteModal({
  appointments,
  onClose,
}: {
  appointments: Appointment[];
  onClose: () => void;
}) {
  const showToast = usePatientUiStore((s) => s.showToast);
  const createNote = useCreatePatientClinicalNote();

  const doctorOptions = useMemo(() => {
    const map = new Map<string, { doctorId: string; name: string; appointmentId?: string }>();
    for (const appt of appointments) {
      const doctorId = appt.doctor?.id;
      if (!doctorId) continue;
      const name = appt.doctor?.user
        ? `Dr. ${appt.doctor.user.firstName} ${appt.doctor.user.lastName}`
        : "Physician";
      if (!map.has(doctorId)) {
        map.set(doctorId, { doctorId, name, appointmentId: appt.id });
      }
    }
    return Array.from(map.values());
  }, [appointments]);

  const [doctorId, setDoctorId] = useState(doctorOptions[0]?.doctorId ?? "");
  const [appointmentId, setAppointmentId] = useState(doctorOptions[0]?.appointmentId ?? "");
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState(NOTE_TYPES[0]);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [priority, setPriority] = useState("NORMAL");
  const [followUpReminderAt, setFollowUpReminderAt] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachments, setAttachments] = useState<ClinicalNoteAttachment[]>([]);

  const relatedAppointments = useMemo(
    () => appointments.filter((a) => a.doctor?.id === doctorId),
    [appointments, doctorId],
  );

  const addAttachment = () => {
    if (!attachmentUrl.trim()) return;
    setAttachments((prev) => [
      ...prev,
      { name: attachmentName.trim() || "Attachment", url: attachmentUrl.trim() },
    ]);
    setAttachmentName("");
    setAttachmentUrl("");
  };

  const handleSave = async () => {
    if (!doctorId) {
      showToast("Select a doctor");
      return;
    }
    if (!title.trim()) {
      showToast("Please enter a note title");
      return;
    }
    if (!clinicalNotes.trim() && !followUpNotes.trim()) {
      showToast("Please enter note content");
      return;
    }

    try {
      await createNote.mutateAsync({
        doctorId,
        title: title.trim(),
        noteType,
        clinicalNotes,
        followUpNotes: followUpNotes || undefined,
        appointmentId: appointmentId || undefined,
        priority,
        attachments: attachments.length ? attachments : undefined,
        followUpReminderAt: followUpReminderAt || undefined,
      });
      showToast("📝 Note sent to your doctor");
      onClose();
    } catch {
      showToast("Failed to save note");
    }
  };

  return (
    <div
      className="modal-ov show"
      style={{ zIndex: 700 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal patient-action-modal" style={{ maxWidth: 720 }}>
        <div className="modal-hd">
          <div className="m-av" style={{ background: "linear-gradient(135deg,#0d9488,#14b8a6)" }}>
            📝
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--gray-900)" }}>
              Add Consultation Note
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
              Share an update with your doctor
            </div>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-bd">
          <div className="af-field">
            <label>Doctor</label>
            <select
              className="af-select"
              value={doctorId}
              onChange={(e) => {
                setDoctorId(e.target.value);
                const firstAppt = appointments.find((a) => a.doctor?.id === e.target.value);
                setAppointmentId(firstAppt?.id ?? "");
              }}
            >
              {doctorOptions.length === 0 ? <option value="">No doctors found</option> : null}
              {doctorOptions.map((d) => (
                <option key={d.doctorId} value={d.doctorId}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="af-field">
            <label>Appointment (optional)</label>
            <select className="af-select" value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)}>
              <option value="">Latest consultation</option>
              {relatedAppointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {new Date(a.scheduledAt).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="af-field">
            <label>Note Title</label>
            <input className="af-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Follow-up symptoms update" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="af-field">
              <label>Category</label>
              <select className="af-select" value={noteType} onChange={(e) => setNoteType(e.target.value)}>
                {NOTE_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="af-field">
              <label>Priority</label>
              <select className="af-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="af-field">
            <label>Note</label>
            <DoctorRichTextEditor
              value={clinicalNotes}
              onChange={setClinicalNotes}
              placeholder="Describe symptoms, questions, or updates for your doctor..."
            />
          </div>

          <div className="af-field">
            <label>Additional Details</label>
            <textarea
              className="af-ta"
              value={followUpNotes}
              onChange={(e) => setFollowUpNotes(e.target.value)}
              placeholder="Any extra context or follow-up requests..."
            />
          </div>

          <div className="af-field">
            <label>Follow-up Reminder (optional)</label>
            <input
              type="date"
              className="af-input"
              value={followUpReminderAt}
              onChange={(e) => setFollowUpReminderAt(e.target.value)}
            />
          </div>

          <div className="af-field">
            <label>Attachments (optional)</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                className="af-input"
                placeholder="Label"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
              />
              <input
                className="af-input"
                placeholder="File URL"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
              />
              <button type="button" className="btn-om" onClick={addAttachment}>
                Add
              </button>
            </div>
            {attachments.length > 0 ? (
              <div className="cnd-attachments">
                {attachments.map((file, index) => (
                  <span key={`${file.url}-${index}`} className="cnd-attachment">
                    📎 {file.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn-bm" style={{ flex: 1 }} onClick={handleSave} disabled={createNote.isPending}>
              ✓ Send Note
            </button>
            <button type="button" className="btn-om" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
