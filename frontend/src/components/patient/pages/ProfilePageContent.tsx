"use client";

import { EmptyState } from "@/components/patient/ui/PatientShared";
import { DashButton, DashCard, DashPageHeader, GridTwo, ProfileRow } from "@/components/patient/ui/PatientPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import { useAuthProfile } from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

function displayValue(value?: string | null): string {
  return value?.trim() || "—";
}

export function ProfilePageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const profileQuery = useAuthProfile();
  const profile = profileQuery.data;
  const patientProfile = profile?.patientProfile;

  const personalInfo: [string, string][] = profile
    ? [
        ["Full Name", `${profile.firstName} ${profile.lastName}`.trim()],
        ["Email Address", displayValue(profile.email)],
        ["Phone Number", displayValue(profile.phone)],
        ["Date of Birth", patientProfile?.dateOfBirth ? formatDate(patientProfile.dateOfBirth) : "—"],
        ["Gender", displayValue(patientProfile?.gender)],
        ["Blood Group", displayValue(patientProfile?.bloodGroup)],
        ["Member Since", formatDate(profile.createdAt)],
        ["Account Status", profile.status === "ACTIVE" ? "✅ Active" : displayValue(profile.status)],
      ]
    : [];

  const medicalInfo: [string, string][] = [
    ["Allergies", patientProfile?.allergies?.length ? patientProfile.allergies.join(", ") : "None recorded"],
    ["Medical History", displayValue(patientProfile?.medicalHistory)],
    ["Emergency Contact", displayValue(patientProfile?.emergencyContact)],
  ];

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="My Profile"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={() => showToast("Edit mode enabled")}>✏️ Edit Profile</DashButton>}
      />

      {profileQuery.isLoading ? (
        <EmptyState message="Loading profile..." />
      ) : (
        <GridTwo>
          <DashCard title="👤 Personal Information">
            {personalInfo.map(([label, value]) => (
              <ProfileRow key={label} label={label} value={value} />
            ))}
          </DashCard>

          <DashCard title="🏥 Medical Information">
            {medicalInfo.map(([label, value]) => (
              <ProfileRow key={label} label={label} value={value} />
            ))}
          </DashCard>
        </GridTwo>
      )}
    </>
  );
}
