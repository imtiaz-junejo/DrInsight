"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/patient/ui/PatientShared";
import { PatientAppointmentCard } from "@/components/patient/ui/PatientAppointmentCard";
import { DashButton, DashCard, DashPageHeader, FilterPills } from "@/components/patient/ui/PatientPrimitives";
import { PatientAddNoteModal } from "@/components/patient/notes/PatientAddNoteModal";
import { formatDateTime } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import { usePatientAppointments, usePatientClinicalNotes } from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";
import Link from "next/link";

const UPCOMING_STATUSES = new Set(["CONFIRMED", "PENDING", "IN_PROGRESS"]);
const READ_FILTERS = ["All", "Unread", "Read"];

export function ConsultationsPageContent() {
  const router = useRouter();
  const showToast = usePatientUiStore((s) => s.showToast);
  const appointmentsQuery = usePatientAppointments({ limit: 50 }, true);

  const [notesSearch, setNotesSearch] = useState("");
  const [notesPage, setNotesPage] = useState(1);
  const [readIndex, setReadIndex] = useState(0);
  const [showAddNote, setShowAddNote] = useState(false);

  const notesQuery = usePatientClinicalNotes({
    page: notesPage,
    limit: 8,
    search: notesSearch || undefined,
    readStatus: readIndex === 1 ? "unread" : readIndex === 2 ? "read" : undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const { upcoming, past } = useMemo(() => {
    const appointments = appointmentsQuery.data?.data ?? [];
    const up = appointments
      .filter((a) => UPCOMING_STATUSES.has(a.status))
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    const pa = appointments
      .filter((a) => !UPCOMING_STATUSES.has(a.status))
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
    return { upcoming: up, past: pa };
  }, [appointmentsQuery.data?.data]);

  const notes = notesQuery.data?.items ?? [];
  const totalPages = notesQuery.data?.totalPages ?? 1;
  const appointments = appointmentsQuery.data?.data ?? [];

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="My Consultations"
        dateStr={todayFormatted()}
        actions={
          <Link href="/book-consultation">
            <DashButton variant="solid" onClick={() => showToast("Opening booking...")}>
              + Book New
            </DashButton>
          </Link>
        }
      />

      <DashCard title="📅 Upcoming Consultations">
        <div className="cons-list">
          {appointmentsQuery.isLoading ? (
            <EmptyState message="Loading upcoming consultations..." />
          ) : upcoming.length > 0 ? (
            upcoming.map((appt) => <PatientAppointmentCard key={appt.id} appt={appt} />)
          ) : (
            <EmptyState message="No upcoming consultations scheduled." />
          )}
        </div>
      </DashCard>

      <DashCard title="✅ Past Consultations">
        <div className="cons-list">
          {appointmentsQuery.isLoading ? (
            <EmptyState message="Loading past consultations..." />
          ) : past.length > 0 ? (
            past.map((appt) => <PatientAppointmentCard key={appt.id} appt={appt} />)
          ) : (
            <EmptyState message="No past consultations yet." />
          )}
        </div>
      </DashCard>

      <DashCard
        title="📝 Doctor Notes"
        actions={
          <DashButton variant="outline" onClick={() => setShowAddNote(true)}>
            + Add Note
          </DashButton>
        }
        headerExtra={
          <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
            {notesQuery.data?.total ?? 0} notes
          </span>
        }
      >
        <div className="notes-toolbar">
          <div className="search-bar" style={{ flex: 1 }}>
            <div className="search-ico-w">
              <input
                className="search-inp"
                placeholder="Search doctor notes..."
                value={notesSearch}
                onChange={(e) => {
                  setNotesSearch(e.target.value);
                  setNotesPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ margin: "12px 0" }}>
          <FilterPills
            filters={READ_FILTERS}
            activeIndex={readIndex}
            onChange={(index) => {
              setReadIndex(index);
              setNotesPage(1);
            }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Appointment</th>
                <th>Title</th>
                <th>Date</th>
                <th>Preview</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {notesQuery.isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--gray-400)" }}>
                    Loading notes...
                  </td>
                </tr>
              ) : notes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--gray-400)" }}>
                    No consultation notes yet.
                  </td>
                </tr>
              ) : (
                notes.map((note) => {
                  const doctorName = note.doctor?.user
                    ? `Dr. ${note.doctor.user.firstName} ${note.doctor.user.lastName}`
                    : "Physician";
                  return (
                    <tr key={note.id}>
                      <td>
                        <strong>{doctorName}</strong>
                      </td>
                      <td>
                        {note.appointment ? formatDateTime(note.appointment.scheduledAt) : "—"}
                      </td>
                      <td>{note.title}</td>
                      <td>{formatDateTime(note.createdAt)}</td>
                      <td style={{ maxWidth: 220 }}>
                        <span className="note-preview-cell">{note.preview ?? "—"}</span>
                      </td>
                      <td>
                        <span className={`st-chip ${note.isUnread ? "st-followup" : "st-active"}`}>
                          {note.readStatus ?? "Read"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="tbl-btn view"
                          onClick={() => router.push(`/patient/notes/${note.id}`)}
                        >
                          View Note
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="table-pager">
          <span>
            Page {notesPage} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              className="tbl-btn"
              disabled={notesPage <= 1}
              onClick={() => setNotesPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <button
              type="button"
              className="tbl-btn"
              disabled={notesPage >= totalPages}
              onClick={() => setNotesPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      </DashCard>

      {showAddNote ? (
        <PatientAddNoteModal appointments={appointments} onClose={() => setShowAddNote(false)} />
      ) : null}
    </>
  );
}
