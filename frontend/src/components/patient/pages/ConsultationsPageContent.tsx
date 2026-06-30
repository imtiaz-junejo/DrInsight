"use client";

import Link from "next/link";
import { PAST_CONSULTATIONS, UPCOMING_CONSULTATIONS } from "@/components/patient/data/patient-demo-data";
import { ConsultationCard } from "@/components/patient/ui/PatientShared";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { todayFormatted } from "@/lib/patient-utils";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function ConsultationsPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);

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
          {UPCOMING_CONSULTATIONS.map((item) => (
            <ConsultationCard key={item.id} item={item} variant="full" />
          ))}
        </div>
      </DashCard>

      <DashCard title="✅ Past Consultations">
        <div className="cons-list">
          {PAST_CONSULTATIONS.map((item) => (
            <ConsultationCard key={item.id} item={item} variant="full" />
          ))}
        </div>
      </DashCard>
    </>
  );
}
