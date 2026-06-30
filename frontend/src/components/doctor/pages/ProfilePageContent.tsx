"use client";

import { DashButton, DashCard, DashPageHeader, GridTwo, ProfileRow } from "@/components/doctor/ui/DoctorPrimitives";
import { doctorDisplayName, todayFormatted } from "@/lib/doctor-utils";
import { useAuthStore } from "@/store/auth.store";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export function ProfilePageContent() {
  const user = useAuthStore((s) => s.user);
  const showToast = useDoctorUiStore((s) => s.showToast);
  const displayName = doctorDisplayName(user?.firstName, user?.lastName);

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
          {[
            ["Full Name", displayName],
            ["Email Address", user?.email ?? "dr.kumbhar@medauthority.com"],
            ["Phone Number", user?.phone ?? "+1 (555) 987-6543"],
            ["Primary Specialty", "Cardiology"],
            ["Medical License", "MD-77823441"],
            ["Regulatory Body", "American Medical Association (AMA)"],
            ["Current Institution", "New York Cardiac Center"],
            ["City of Practice", "New York, NY"],
            ["Member Since", "October 2024"],
          ].map(([label, value]) => (
            <ProfileRow key={label} label={label} value={value} />
          ))}
        </DashCard>

        <DashCard title="📊 Contribution Stats">
          <div className="g2" style={{ gap: 12 }}>
            {[
              ["✍️", "47", "Articles published", "ic1"],
              ["💬", "312", "Questions answered", "ic2"],
              ["👁️", "58.2K", "Total article views", "ic3"],
              ["⭐", "4.9", "Average rating", "ic4"],
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
        </DashCard>
      </GridTwo>
    </>
  );
}
