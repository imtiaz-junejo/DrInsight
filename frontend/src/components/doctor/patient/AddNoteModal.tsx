"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useCreatePatientNote,
  useDeletePatientNote,
  usePatientDetail,
  usePatientNoteDraft,
  usePatientNotes,
  useSavePatientNoteDraft,
  useUpdatePatientNote,
  type ClinicalNoteAttachment,
  type PatientClinicalNote,
} from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import {
  BadgeCheck,
  ClipboardList,
  DoctorIcon,
  DoctorIconInline,
  FileText,
  Pencil,
  SearchFieldIcon,
  X,
} from "@/components/doctor/icons/DoctorIcons";
import { formatDateTime } from "@/lib/data-mappers";
import { DoctorRichTextEditor } from "./DoctorRichTextEditor";

const NOTE_TYPES = ["Progress Note", "SOAP Note", "Phone Note", "Follow-up Note"];
const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

export function AddNoteModal({
  patientId,
  patientName,
  patientCode,
}: {
  patientId: string;
  patientName: string;
  patientCode: string;
}) {
  const closePatientPanel = useDoctorUiStore((s) => s.closePatientPanel);
  const showToast = useDoctorUiStore((s) => s.showToast);
  const [tab, setTab] = useState<"write" | "history">("write");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState(NOTE_TYPES[0]);
  const [priority, setPriority] = useState("NORMAL");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [followUpNotes, setFollowUpNotes] = useState("");
  const [privateNotes, setPrivateNotes] = useState("");
  const [followUpReminderAt, setFollowUpReminderAt] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachments, setAttachments] = useState<ClinicalNoteAttachment[]>([]);
  const [saveState, setSaveState] = useState("All changes saved");

  const draftQuery = usePatientNoteDraft(patientId);
  const patientDetailQuery = usePatientDetail(patientId);
  const notesQuery = usePatientNotes(patientId, { page, search: search || undefined });
  const saveDraft = useSavePatientNoteDraft();
  const createNote = useCreatePatientNote();
  const updateNote = useUpdatePatientNote();
  const deleteNote = useDeletePatientNote();

  const resetForm = useCallback(() => {
    setEditingId(null);
    setTitle("");
    setNoteType(NOTE_TYPES[0]);
    setPriority("NORMAL");
    setClinicalNotes("");
    setFollowUpNotes("");
    setPrivateNotes("");
    setFollowUpReminderAt("");
    setAttachments([]);
  }, []);

  useEffect(() => {
    const draft = draftQuery.data;
    if (draft && !editingId) {
      setTitle(draft.title ?? "");
      setNoteType(draft.noteType ?? NOTE_TYPES[0]);
      setPriority(draft.priority ?? "NORMAL");
      setClinicalNotes(draft.clinicalNotes ?? "");
      setFollowUpNotes(draft.followUpNotes ?? "");
      setPrivateNotes(draft.privateNotes ?? "");
      setFollowUpReminderAt(draft.followUpReminderAt?.slice(0, 10) ?? "");
      setAttachments(Array.isArray(draft.attachments) ? draft.attachments : []);
    }
  }, [draftQuery.data, editingId]);

  const latestAppointmentId = useMemo(() => {
    const history = patientDetailQuery.data?.consultationHistory ?? [];
    return [...history].sort(
      (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    )[0]?.id;
  }, [patientDetailQuery.data?.consultationHistory]);

  useEffect(() => {
    if (tab !== "write" || editingId) return;
    const timer = setTimeout(() => {
      setSaveState("Saving…");
      saveDraft.mutate(
        {
          patientId,
          body: {
            title,
            noteType,
            clinicalNotes,
            followUpNotes,
            privateNotes,
            appointmentId: latestAppointmentId,
            priority,
            attachments,
            followUpReminderAt: followUpReminderAt || undefined,
          },
        },
        {
          onSuccess: () => setSaveState("Draft auto-saved"),
          onError: () => setSaveState("Auto-save failed"),
        },
      );
    }, 1200);
    return () => clearTimeout(timer);
  }, [
    title,
    noteType,
    priority,
    clinicalNotes,
    followUpNotes,
    privateNotes,
    followUpReminderAt,
    attachments,
    tab,
    editingId,
    patientId,
    latestAppointmentId,
    saveDraft,
  ]);

  const addAttachment = () => {
    if (!attachmentUrl.trim()) return;
    setAttachments((prev) => [
      ...prev,
      { name: attachmentName.trim() || "Attachment", url: attachmentUrl.trim() },
    ]);
    setAttachmentName("");
    setAttachmentUrl("");
  };

  const loadNoteForEdit = (note: PatientClinicalNote) => {
    if (note.authorType === "PATIENT") {
      showToast("You can only edit notes you authored");
      return;
    }
    setEditingId(note.id);
    setTitle(note.title);
    setNoteType(note.noteType);
    setPriority(note.priority ?? "NORMAL");
    setClinicalNotes(note.clinicalNotes);
    setFollowUpNotes(note.followUpNotes ?? "");
    setPrivateNotes(note.privateNotes ?? "");
    setFollowUpReminderAt(note.followUpReminderAt?.slice(0, 10) ?? "");
    setAttachments(Array.isArray(note.attachments) ? note.attachments : []);
    setTab("write");
  };

  const handleSave = async () => {
    if (!title.trim() && !clinicalNotes.trim() && !followUpNotes.trim()) {
      showToast("⚠️ Please enter note details");
      return;
    }
    try {
      const payload = {
        title: title.trim() || "Clinical Note",
        noteType,
        clinicalNotes,
        followUpNotes: followUpNotes || undefined,
        privateNotes: privateNotes || undefined,
        appointmentId: latestAppointmentId,
        priority,
        attachments: attachments.length ? attachments : undefined,
        followUpReminderAt: followUpReminderAt || undefined,
      };

      if (editingId) {
        await updateNote.mutateAsync({ noteId: editingId, patientId, body: payload });
        showToast("📝 Note updated");
      } else {
        await createNote.mutateAsync({ patientId, body: payload });
        showToast(`📝 Note saved · ${patientName} notified`);
      }
      resetForm();
      closePatientPanel();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      showToast(message ?? "Failed to save note");
    }
  };

  const handleDelete = async (note: PatientClinicalNote) => {
    if (note.authorType === "PATIENT") {
      showToast("You can only delete notes you authored");
      return;
    }
    if (!window.confirm("Delete this note permanently?")) return;
    await deleteNote.mutateAsync({ noteId: note.id, patientId });
    showToast("Note deleted");
  };

  const notes = notesQuery.data?.items ?? [];
  const totalPages = notesQuery.data?.totalPages ?? 1;

  const authorName = useMemo(
    () => (note: PatientClinicalNote) => {
      if (note.authorType === "PATIENT" && note.patient?.user) {
        return `${note.patient.user.firstName} ${note.patient.user.lastName}`;
      }
      if (note.doctor?.user) {
        return `Dr. ${note.doctor.user.firstName} ${note.doctor.user.lastName}`;
      }
      return note.authorType === "PATIENT" ? "Patient" : "Physician";
    },
    [],
  );

  return (
    <div
      className="modal-ov show"
      style={{ zIndex: 700 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePatientPanel();
      }}
    >
      <div className="modal patient-action-modal" style={{ maxWidth: 720 }}>
        <div className="modal-hd">
          <div className="m-av" style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)" }}>
            <DoctorIcon icon={FileText} size="stat" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--gray-900)" }}>
              {editingId ? "Edit Clinical Note" : "Add Clinical Note"}
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
              for {patientName} · {patientCode}
            </div>
          </div>
          <span style={{ fontSize: "0.68rem", color: "var(--gray-400)", marginRight: 8 }}>{saveState}</span>
          <button type="button" className="modal-close" onClick={closePatientPanel} aria-label="Close">
            <DoctorIcon icon={X} size="sm" />
          </button>
        </div>
        <div className="modal-bd">
          <div className="pa-tabs">
            <button type="button" className={`pa-tab${tab === "write" ? " on" : ""}`} onClick={() => setTab("write")}>
              <DoctorIconInline icon={Pencil} size="sm">
                Write Note
              </DoctorIconInline>
            </button>
            <button type="button" className={`pa-tab${tab === "history" ? " on" : ""}`} onClick={() => setTab("history")}>
              <DoctorIconInline icon={ClipboardList} size="sm">
                Note History
              </DoctorIconInline>
            </button>
          </div>

          {tab === "write" ? (
            <>
              <div className="af-field">
                <label>Note Title</label>
                <input className="af-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Follow-up consultation note" />
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
                <label>Clinical Notes</label>
                <DoctorRichTextEditor value={clinicalNotes} onChange={setClinicalNotes} placeholder="Patient-reported symptoms, examination findings, clinical impression..." />
              </div>
              <div className="af-field">
                <label>Follow-up Notes</label>
                <textarea className="af-ta" value={followUpNotes} onChange={(e) => setFollowUpNotes(e.target.value)} placeholder="Follow-up plan, next steps, monitoring..." />
              </div>
              <div className="af-field">
                <label>Private / Internal Notes</label>
                <textarea className="af-ta" value={privateNotes} onChange={(e) => setPrivateNotes(e.target.value)} placeholder="Visible to doctors and admins only..." />
              </div>
              <div className="af-field">
                <label>Follow-up Reminder (optional)</label>
                <input type="date" className="af-input" value={followUpReminderAt} onChange={(e) => setFollowUpReminderAt(e.target.value)} />
              </div>
              <div className="af-field">
                <label>Attachments (optional)</label>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <input className="af-input" placeholder="Label" value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} />
                  <input className="af-input" placeholder="File URL" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
                  <button type="button" className="btn-om" onClick={addAttachment}>
                    Add
                  </button>
                </div>
                {attachments.length > 0 ? (
                  <div className="cnd-attachments">
                    {attachments.map((file, index) => (
                      <span key={`${file.url}-${index}`} className="cnd-attachment">
                        <DoctorIconInline icon={FileText} size="sm">
                          {file.name}
                        </DoctorIconInline>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn-bm" style={{ flex: 1 }} onClick={handleSave} disabled={createNote.isPending || updateNote.isPending}>
                  <DoctorIconInline icon={BadgeCheck} size="sm">
                    {editingId ? "Update Note" : "Save Note"}
                  </DoctorIconInline>
                </button>
                {editingId ? (
                  <button type="button" className="btn-om" onClick={resetForm}>
                    Cancel Edit
                  </button>
                ) : null}
                <button type="button" className="btn-om" onClick={closePatientPanel}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="search-bar" style={{ marginBottom: 14 }}>
                <div className="search-ico-w">
                  <SearchFieldIcon />
                  <input
                    className="search-inp"
                    placeholder="Search notes..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>
              <div className="note-history-list">
                {notesQuery.isLoading ? (
                  <p style={{ color: "var(--gray-400)", textAlign: "center", padding: 20 }}>Loading notes...</p>
                ) : notes.length === 0 ? (
                  <p style={{ color: "var(--gray-400)", textAlign: "center", padding: 20 }}>No notes found</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="note-history-item">
                      <div className="note-history-top">
                        <div>
                          <strong>{note.title}</strong>
                          <span className="note-type-chip">{note.noteType}</span>
                          {note.isUnread ? <span className="note-type-chip" style={{ background: "#fef3c7" }}>Unread</span> : null}
                        </div>
                        <div className="note-history-actions">
                          <Link href={`/doctor/patient-notes/${patientId}/${note.id}`}>
                            <button type="button" className="tbl-btn view">
                              View
                            </button>
                          </Link>
                          {note.authorType === "DOCTOR" ? (
                            <>
                              <button type="button" className="tbl-btn" onClick={() => loadNoteForEdit(note)}>
                                Edit
                              </button>
                              <button type="button" className="tbl-btn" onClick={() => handleDelete(note)}>
                                Delete
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="note-history-meta">
                        {formatDateTime(note.createdAt)} · {authorName(note)} · {note.priority ?? "NORMAL"}
                      </div>
                      <div className="note-history-preview">{note.preview ?? ""}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="table-pager">
                <span>
                  Page {page} of {totalPages}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
