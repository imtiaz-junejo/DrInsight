"use client";

import { DashButton, DashCard, DashPageHeader, GridTwo, ProfileRow } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { doctorDisplayName, todayFormatted } from "@/lib/doctor-utils";
import { useDoctorProfile } from "@/services/doctor-api-hooks";
import { useAuthProfile } from "@/services/patient-api-hooks";
import { useAuthStore } from "@/store/auth.store";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

function EmptyState({ loading, message }: { loading?: boolean; message: string }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
      {loading ? "Loading..." : message}
    </div>
  );
}

export function ProfilePageContent() {
  const user = useAuthStore((s) => s.user);
  const showToast = useDoctorUiStore((s) => s.showToast);
  const authProfileQuery = useAuthProfile();
  const doctorProfileQuery = useDoctorProfile();

  const authProfile = authProfileQuery.data;
  const doctorProfile = doctorProfileQuery.data;
  const loading = authProfileQuery.isLoading || doctorProfileQuery.isLoading;

  const displayName = doctorDisplayName(
    authProfile?.firstName ?? user?.firstName,
    authProfile?.lastName ?? user?.lastName,
  );

  const memberSince = authProfile?.createdAt
    ? formatDate(authProfile.createdAt, { month: "long", year: "numeric" })
    : "—";

  const personalRows: Array<[string, string]> = loading
    ? []
    : [
        ["Full Name", displayName],
        ["Email Address", authProfile?.email ?? user?.email ?? "—"],
        ["Phone Number", authProfile?.phone ?? user?.phone ?? "—"],
        ["Primary Specialty", doctorProfile?.specialty ?? "—"],
        ["Medical License", doctorProfile?.licenseNumber ?? "—"],
        ["Education", doctorProfile?.education ?? "—"],
        ["Current Institution", doctorProfile?.hospital ?? "—"],
        ["Experience", doctorProfile ? `${doctorProfile.experienceYears} years` : "—"],
        ["Member Since", memberSince],
      ];

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title="Physician Profile"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={() => showToast("Edit mode enabled")}>✏️ Edit Profile</DashButton>}
      />

      <GridTwo>
        <DashCard title="👨‍⚕️ Personal Information">
          {loading ? (
            <EmptyState loading message="" />
          ) : (
            personalRows.map(([label, value]) => <ProfileRow key={label} label={label} value={value} />)
          )}
        </DashCard>

        <DashCard title="📊 Contribution Stats">
          {loading ? (
            <EmptyState loading message="" />
          ) : (
            <div className="g2" style={{ gap: 12 }}>
              {[
                ["✍️", "—", "Articles published", "ic1"],
                ["💬", String(doctorProfile?.reviewCount ?? 0), "Patient reviews", "ic2"],
                ["👁️", "—", "Total article views", "ic3"],
                ["⭐", doctorProfile?.rating.toFixed(1) ?? "—", "Average rating", "ic4"],
              ].map(([ico, num, label, ic]) => (
                <div
                  key={label}
                  style={{
                    background: "var(--gray-50)",
                    border: "1.5px solid var(--gray-200)",
                    borderRadius: "var(--radius)",
                    padding: 18,
                    textAlign: "center",
                  }}
                >
                  <div className={`stat-ic ${ic}`} style={{ margin: "0 auto 10px" }}>
                    {ico}
                  </div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700, color: "var(--gray-900)" }}>{num}</div>
                  <div style={{ fontSize: "0.76rem", color: "var(--gray-500)", marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </DashCard>
      </GridTwo>
    </>
  );
}
