"use client";

import Link from "next/link";
import { EmptyState, VitalsGrid, type VitalItem } from "@/components/patient/ui/PatientShared";
import { DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import type { AuthProfile } from "@/services/patient-api-hooks";
import { useAuthProfile } from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

function buildMedicalVitals(patientProfile: AuthProfile["patientProfile"]): VitalItem[] {
  if (!patientProfile) return [];
  const items: VitalItem[] = [];
  if (patientProfile.bloodGroup) {
    items.push({ val: patientProfile.bloodGroup, unit: "", label: "Blood Group", badge: "vb-n", badgeLabel: "On file" });
  }
  if (patientProfile.allergies?.length) {
    items.push({ val: patientProfile.allergies.join(", "), unit: "", label: "Allergies", badge: "vb-l", badgeLabel: "Listed" });
  }
  if (patientProfile.gender) {
    items.push({ val: patientProfile.gender, unit: "", label: "Gender", badge: "vb-n", badgeLabel: "On file" });
  }
  if (patientProfile.dateOfBirth) {
    items.push({ val: formatDate(patientProfile.dateOfBirth), unit: "", label: "Date of Birth", badge: "vb-n", badgeLabel: "On file" });
  }
  if (patientProfile.medicalHistory) {
    items.push({ val: patientProfile.medicalHistory, unit: "", label: "Medical History", badge: "vb-n", badgeLabel: "On file" });
  }
  if (patientProfile.emergencyContact) {
    items.push({ val: patientProfile.emergencyContact, unit: "", label: "Emergency Contact", badge: "vb-n", badgeLabel: "On file" });
  }
  return items;
}

export function HealthPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const profileQuery = useAuthProfile();
  const medicalVitals = buildMedicalVitals(profileQuery.data?.patientProfile);

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="Health Metrics"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={() => showToast("Opening log form...")}>+ Log Reading</DashButton>}
      />

      <DashCard
        title="❤️ Current Vitals"
        headerExtra={
          profileQuery.data?.patientProfile ? (
            <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>From your medical profile</span>
          ) : null
        }
      >
        {profileQuery.isLoading ? (
          <EmptyState message="Loading medical profile..." />
        ) : medicalVitals.length > 0 ? (
          <VitalsGrid vitals={medicalVitals} columns={3} />
        ) : (
          <EmptyState message="No vitals recorded" />
        )}
      </DashCard>

      <DashCard title="📋 Health Tool History" actions={<Link href="/health-tools" className="card-action">Run New Tool →</Link>}>
        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Tool</th>
                <th>Result</th>
                <th>Date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--gray-400)", padding: "24px 12px", fontSize: "0.82rem" }}>
                  No health tool history yet. Run a tool to see results here.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DashCard>
    </>
  );
}
