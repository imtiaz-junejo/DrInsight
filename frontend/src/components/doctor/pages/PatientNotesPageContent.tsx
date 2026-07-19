"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DoctorIconInline,
  FileText,
  PhysicianDashboardLabel,
  Pencil,
  SearchFieldIcon,
} from "@/components/doctor/icons/DoctorIcons";
import {
  DashButton,
  DashCard,
  DashPageHeader,
  FilterPills,
  TableButton,
} from "@/components/doctor/ui/DoctorPrimitives";
import { formatDateTime } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  useDeletePatientNote,
  useDoctorPatients,
  usePatientNotes,
} from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { openPatientFromList } from "@/components/doctor/patient/PatientDetailModal";
import type { PatientClinicalNote } from "@/services/doctor-api-hooks";

const NOTE_CATEGORIES = ["All", "Progress Note", "SOAP Note", "Phone Note", "Follow-up Note", "Patient Note"];
const READ_FILTERS = ["All", "Unread", "Read"];
const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "updatedAt:desc", label: "Recently updated" },
  { value: "title:asc", label: "Title A–Z" },
  { value: "priority:desc", label: "Priority high–low" },
];

function authorName(note: PatientClinicalNote) {
  if (note.authorType === "PATIENT" && note.patient?.user) {
    return `${note.patient.user.firstName} ${note.patient.user.lastName}`;
  }
  if (note.doctor?.user) {
    return `Dr. ${note.doctor.user.firstName} ${note.doctor.user.lastName}`;
  }
  return note.authorType === "PATIENT" ? "Patient" : "Physician";
}

export function PatientNotesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientAction = useDoctorUiStore((s) => s.openPatientAction);

  const initialPatientId = searchParams.get("patientId") ?? "";
  const [patientId, setPatientId] = useState(initialPatientId);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [readIndex, setReadIndex] = useState(0);
  const [sort, setSort] = useState("createdAt:desc");

  const patientsQuery = useDoctorPatients();
  const deleteNote = useDeletePatientNote();

  const [sortBy, sortOrder] = sort.split(":") as [
    "createdAt" | "updatedAt" | "title" | "priority",
    "asc" | "desc",
  ];

  const notesQuery = usePatientNotes(patientId || undefined, {
    page,
    search: search || undefined,
    category: categoryIndex > 0 ? NOTE_CATEGORIES[categoryIndex] : undefined,
    readStatus: readIndex === 1 ? "unread" : readIndex === 2 ? "read" : undefined,
    sortBy,
    sortOrder,
    limit: 10,
  });

  const patients = patientsQuery.data ?? [];
  const notes = notesQuery.data?.items ?? [];
  const totalPages = notesQuery.data?.totalPages ?? 1;

  const selectedPatient = useMemo(
    () => patients.find((p) => p.patientId === patientId),
    [patients, patientId],
  );

  const handleAddNote = () => {
    if (!selectedPatient) {
      showToast("Select a patient first");
      return;
    }
    openPatientAction(openPatientFromList(selectedPatient), "note");
  };

  const handleDelete = async (note: PatientClinicalNote) => {
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      await deleteNote.mutateAsync({ noteId: note.id, patientId: note.patientId ?? patientId });
      showToast("Note deleted");
    } catch {
      showToast("Unable to delete note");
    }
  };

  return (
    <>
      <DashPageHeader
        subtitle={<PhysicianDashboardLabel />}
        title="Patient Notes"
        dateStr={todayFormatted()}
        actions={
          <DashButton variant="solid" onClick={handleAddNote}>
            <DoctorIconInline icon={Pencil} size="button">
              Add Note
            </DoctorIconInline>
          </DashButton>
        }
      />

      <DashCard
        title={<DoctorIconInline icon={FileText} size="button">Consultation Notes</DoctorIconInline>}
        headerExtra={
          <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
            {patientId ? `${notesQuery.data?.total ?? 0} notes` : "Select a patient"}
          </span>
        }
      >
        <div className="notes-toolbar">
          <div className="af-field" style={{ marginBottom: 0, minWidth: 260 }}>
            <label>Patient</label>
            <select
              className="af-select"
              value={patientId}
              onChange={(e) => {
                setPatientId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Select patient...</option>
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.user.firstName} {p.user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="search-bar" style={{ flex: 1 }}>
            <div className="search-ico-w">
              <SearchFieldIcon />
              <input
                className="search-inp"
                placeholder="Search notes..."
                value={search}
                disabled={!patientId}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="af-field" style={{ marginBottom: 0, minWidth: 180 }}>
            <label>Sort</label>
            <select className="af-select" value={sort} disabled={!patientId} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "14px 0" }}>
          <FilterPills
            filters={NOTE_CATEGORIES}
            activeIndex={categoryIndex}
            onChange={(index) => {
              setCategoryIndex(index);
              setPage(1);
            }}
          />
          <FilterPills
            filters={READ_FILTERS}
            activeIndex={readIndex}
            onChange={(index) => {
              setReadIndex(index);
              setPage(1);
            }}
          />
        </div>

        {!patientId ? (
          <p style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>
            Choose a patient to view their consultation notes.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="pt-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Preview</th>
                  <th>Author</th>
                  <th>Date & Time</th>
                  <th>Appointment</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notesQuery.isLoading ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: 24, color: "var(--gray-400)" }}>
                      Loading notes...
                    </td>
                  </tr>
                ) : notes.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: 24, color: "var(--gray-400)" }}>
                      No notes found for this patient.
                    </td>
                  </tr>
                ) : (
                  notes.map((note) => (
                    <tr key={note.id}>
                      <td>
                        <strong>{note.title}</strong>
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        <span className="note-preview-cell">{note.preview ?? "—"}</span>
                      </td>
                      <td>{authorName(note)}</td>
                      <td>{formatDateTime(note.createdAt)}</td>
                      <td>
                        {note.appointment ? formatDateTime(note.appointment.scheduledAt) : "—"}
                      </td>
                      <td>
                        <span className="note-type-chip">{note.noteType}</span>
                      </td>
                      <td>{note.priority ?? "NORMAL"}</td>
                      <td>
                        <span className={`st-chip ${note.isUnread ? "st-followup" : "st-active"}`}>
                          {note.readStatus ?? "Read"}
                        </span>
                      </td>
                      <td>{formatDateTime(note.updatedAt)}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <TableButton
                            variant="view"
                            onClick={() =>
                              router.push(`/doctor/patient-notes/${patientId}/${note.id}`)
                            }
                          >
                            View
                          </TableButton>
                          {note.authorType === "DOCTOR" ? (
                            <>
                              <Link href={`/doctor/patient-notes/${patientId}/${note.id}?edit=1`}>
                                <TableButton>Edit</TableButton>
                              </Link>
                              <TableButton onClick={() => handleDelete(note)}>Delete</TableButton>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {patientId ? (
          <div className="table-pager">
            <span>
              Page {page} of {totalPages}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" className="tbl-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              <button
                type="button"
                className="tbl-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        ) : null}
      </DashCard>
    </>
  );
}
