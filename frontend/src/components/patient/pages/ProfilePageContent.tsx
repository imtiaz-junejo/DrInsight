"use client";

import { MEDICAL_INFO, PERSONAL_INFO } from "@/components/patient/data/patient-demo-data";
import { DashButton, DashCard, DashPageHeader, GridTwo, ProfileRow } from "@/components/patient/ui/PatientPrimitives";
import { todayFormatted } from "@/lib/patient-utils";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function ProfilePageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="My Profile"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={() => showToast("Edit mode enabled")}>✏️ Edit Profile</DashButton>}
      />

      <GridTwo>
        <DashCard title="👤 Personal Information">
          {PERSONAL_INFO.map(([label, value]) => (
            <ProfileRow key={label} label={label} value={value} />
          ))}
        </DashCard>

        <DashCard title="🏥 Medical Information">
          {MEDICAL_INFO.map(([label, value]) => (
            <ProfileRow key={label} label={label} value={value} />
          ))}
        </DashCard>
      </GridTwo>
    </>
  );
}
