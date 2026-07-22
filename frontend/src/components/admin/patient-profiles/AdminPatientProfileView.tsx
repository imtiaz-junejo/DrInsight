"use client";

import { AdminButton, AdminPanel, StatusChip, UserAvatar } from "@/components/admin/ui/AdminPrimitives";
import { AdminMedicalSummaryCard } from "@/components/admin/patient-profiles/AdminMedicalSummaryCard";
import { AdminPatientProfileRecords } from "@/components/admin/patient-profiles/AdminPatientProfileRecords";
import { patientAddressLabel } from "@/lib/admin-patient-profile-mapper";
import {
  AdminProfileBanner,
  AdminProfileCard,
  AdminProfileGrid,
  AdminProfileRow,
  AdminProfileStats,
} from "@/components/admin/ui/AdminProfileView";
import { formatDate } from "@/lib/data-mappers";
import { useAdminPatientDetail } from "@/services/admin-api-hooks";

function displayValue(value?: string | null): string {
  return value?.trim() || "—";
}

function accountStatusLabel(status?: string | null, suspended?: boolean): React.ReactNode {
  if (suspended) return <StatusChip label="Suspended" className="ch-r" />;
  if (status === "PENDING") return <StatusChip label="Pending" className="ch-a" />;
  if (status === "ACTIVE") return <StatusChip label="Active" className="ch-g" />;
  return displayValue(status);
}

interface Props {
  patientId: string;
  onEdit: () => void;
}

export function AdminPatientProfileView({ patientId, onEdit }: Props) {
  const detailQuery = useAdminPatientDetail(patientId);
  const patient = detailQuery.data;
  const user = patient?.user;
  const suspended = user?.status === "SUSPENDED";

  if (detailQuery.isLoading) {
    return <AdminPanel title="Loading profile...">Fetching patient from database...</AdminPanel>;
  }

  if (detailQuery.isError || !patient) {
    return (
      <AdminPanel title="Profile unavailable">
        <p style={{ fontSize: "0.84rem", color: "var(--gray-700)" }}>
          Could not load this patient profile. Please go back and try again.
        </p>
      </AdminPanel>
    );
  }

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Patient";
  const patientIdLabel = patient.patientNumber ?? `#PT-${patient.id.slice(-4)}`;

  const personalRows: [string, React.ReactNode][] = [
    ["Full Name", fullName],
    ["Email Address", displayValue(user?.email)],
    ["Phone Number", displayValue(user?.phone)],
    ["Date of Birth", patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "—"],
    ["Gender", displayValue(patient.gender)],
    ["Address", patientAddressLabel(patient)],
    ["Member Since", user?.createdAt ? formatDate(user.createdAt) : "—"],
    ["Account Status", accountStatusLabel(user?.status, suspended)],
  ];

  return (
    <div className="admin-profile-page">
      <AdminProfileBanner
        tone="patient"
        identity={
          <>
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt={fullName} className="admin-profile-hero-avatar" />
            ) : (
              <UserAvatar firstName={user?.firstName} lastName={user?.lastName} seed={patient.id} />
            )}
            <div className="admin-profile-hero-text">
              <div className="admin-profile-hero-name">{fullName}</div>
              <div className="admin-profile-hero-sub">
                <span className="admin-profile-id-badge">{patientIdLabel}</span>
                {patient.city ? <span>{patient.city}</span> : null}
              </div>
            </div>
          </>
        }
        actions={
          <>
            {accountStatusLabel(user?.status, suspended)}
            <AdminButton variant="green" onClick={onEdit}>
              ✏️ Edit Profile
            </AdminButton>
          </>
        }
      />

      <AdminProfileStats
        items={[
          { value: patient.stats?.appointmentCount ?? 0, label: "Consultations" },
          { value: patient.stats?.prescriptionCount ?? 0, label: "Prescriptions" },
          { value: patient.stats?.bookmarkCount ?? 0, label: "Saved Articles" },
          { value: patient.stats?.questionCount ?? 0, label: "Questions Asked" },
        ]}
      />

      <AdminProfileGrid>
        <AdminProfileCard title="Personal Information" icon="👤" tone="blue">
          {personalRows.map(([label, value]) => (
            <AdminProfileRow key={label} label={label} value={value} />
          ))}
        </AdminProfileCard>

        <AdminMedicalSummaryCard patient={patient} />
      </AdminProfileGrid>

      <AdminPatientProfileRecords patientId={patientId} />
    </div>
  );
}
