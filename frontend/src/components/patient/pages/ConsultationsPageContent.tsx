"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ConsultationCard, EmptyState } from "@/components/patient/ui/PatientShared";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { mapAppointmentToConsultation } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import { usePatientAppointments } from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

const UPCOMING_STATUSES = new Set(["CONFIRMED", "PENDING", "IN_PROGRESS"]);

export function ConsultationsPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const appointmentsQuery = usePatientAppointments({ limit: 50 });

  const { upcoming, past } = useMemo(() => {
    const appointments = appointmentsQuery.data?.data ?? [];
    const up = appointments
      .filter((a) => UPCOMING_STATUSES.has(a.status))
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .map((a) => mapAppointmentToConsultation(a));
    const pa = appointments
      .filter((a) => !UPCOMING_STATUSES.has(a.status))
      .sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
      .map((a) => mapAppointmentToConsultation(a));
    return { upcoming: up, past: pa };
  }, [appointmentsQuery.data?.data]);

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
            upcoming.map((item) => <ConsultationCard key={item.id} item={item} variant="full" />)
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
            past.map((item) => <ConsultationCard key={item.id} item={item} variant="full" />)
          ) : (
            <EmptyState message="No past consultations yet." />
          )}
        </div>
      </DashCard>
    </>
  );
}
