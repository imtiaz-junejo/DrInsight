"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ClinicalNoteDetailsView } from "@/components/clinical-notes/ClinicalNoteDetailsView";
import { DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { todayFormatted } from "@/lib/patient-utils";
import { useMarkNotificationRead, useNotifications } from "@/services/api-hooks";
import {
  useDeletePatientClinicalNote,
  useMarkPatientNoteRead,
  usePatientClinicalNote,
} from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function PatientNoteDetailPageContent({ noteId }: { noteId: string }) {
  const router = useRouter();
  const showToast = usePatientUiStore((s) => s.showToast);
  const noteQuery = usePatientClinicalNote(noteId);
  const notificationsQuery = useNotifications();
  const markRead = useMarkPatientNoteRead();
  const markNotificationRead = useMarkNotificationRead();
  const deleteNote = useDeletePatientClinicalNote();

  const note = noteQuery.data;

  useEffect(() => {
    const related = (notificationsQuery.data?.data ?? []).find(
      (n) => n.data?.noteId === noteId && !n.readAt,
    );
    if (related) markNotificationRead.mutate(related.id);
  }, [noteId, notificationsQuery.data, markNotificationRead]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      await deleteNote.mutateAsync(noteId);
      showToast("Note deleted");
      router.push("/patient/consultations");
    } catch {
      showToast("Unable to delete note");
    }
  };

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="Doctor Note"
        dateStr={todayFormatted()}
      />
      <DashCard title="📝 Consultation Note">
        {noteQuery.isLoading ? (
          <p style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>Loading note...</p>
        ) : note ? (
          <ClinicalNoteDetailsView
            note={note}
            role="patient"
            canEdit={note.authorType === "PATIENT"}
            canDelete={note.authorType === "PATIENT"}
            onMarkRead={() => markRead.mutate(noteId)}
            onBack={() => router.push("/patient/consultations")}
            onDelete={handleDelete}
          />
        ) : (
          <p style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>Note not found.</p>
        )}
      </DashCard>
    </>
  );
}
