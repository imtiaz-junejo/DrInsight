"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ClinicalNoteDetailsView } from "@/components/clinical-notes/ClinicalNoteDetailsView";
import { DoctorIconInline, FileText, PhysicianDashboardLabel } from "@/components/doctor/icons/DoctorIcons";
import { DashCard, DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { todayFormatted } from "@/lib/doctor-utils";
import { useMarkNotificationRead, useNotifications } from "@/services/api-hooks";
import {
  useDeletePatientNote,
  useMarkDoctorNoteRead,
  usePatientDetail,
  usePatientNote,
} from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export function DoctorNoteDetailPageContent({
  patientId,
  noteId,
}: {
  patientId: string;
  noteId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientAction = useDoctorUiStore((s) => s.openPatientAction);

  const noteQuery = usePatientNote(patientId, noteId);
  const patientQuery = usePatientDetail(patientId);
  const notificationsQuery = useNotifications();
  const markRead = useMarkDoctorNoteRead();
  const markNotificationRead = useMarkNotificationRead();
  const deleteNote = useDeletePatientNote();

  const note = noteQuery.data;

  useEffect(() => {
    const related = (notificationsQuery.data?.data ?? []).find(
      (n) => n.data?.noteId === noteId && !n.readAt,
    );
    if (related) markNotificationRead.mutate(related.id);
  }, [noteId, notificationsQuery.data, markNotificationRead]);

  useEffect(() => {
    if (searchParams.get("edit") === "1" && patientQuery.data) {
      const p = patientQuery.data;
      openPatientAction(
        {
          patientId,
          initials: `${p.user.firstName[0] ?? ""}${p.user.lastName[0] ?? ""}`,
          name: `${p.user.firstName} ${p.user.lastName}`,
          age: "—",
          gender: p.gender ?? "—",
          diagnosis: p.condition ?? "—",
          status: (p.status as "Active") ?? "Active",
          avatarBg: "",
        },
        "note",
      );
    }
  }, [searchParams, patientQuery.data, openPatientAction, patientId]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this note permanently?")) return;
    try {
      await deleteNote.mutateAsync({ noteId, patientId });
      showToast("Note deleted");
      router.push(`/doctor/patient-notes?patientId=${patientId}`);
    } catch {
      showToast("Unable to delete note");
    }
  };

  return (
    <>
      <DashPageHeader
        subtitle={<PhysicianDashboardLabel />}
        title="Note Details"
        dateStr={todayFormatted()}
      />
      <DashCard title={<DoctorIconInline icon={FileText} size="button">Clinical Note</DoctorIconInline>}>
        {noteQuery.isLoading ? (
          <p style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>Loading note...</p>
        ) : note ? (
          <ClinicalNoteDetailsView
            note={note}
            role="doctor"
            canEdit={note.authorType === "DOCTOR"}
            canDelete={note.authorType === "DOCTOR"}
            onMarkRead={() => markRead.mutate({ noteId, patientId })}
            onBack={() => router.push(`/doctor/patient-notes?patientId=${patientId}`)}
            onEdit={() => router.push(`/doctor/patient-notes/${patientId}/${noteId}?edit=1`)}
            onDelete={handleDelete}
          />
        ) : (
          <p style={{ textAlign: "center", color: "var(--gray-400)", padding: 32 }}>Note not found.</p>
        )}
      </DashCard>
    </>
  );
}
