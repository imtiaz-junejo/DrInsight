"use client";

import { UserAvatar, StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { formatDateTime, formatRelativeTime } from "@/lib/admin-utils";
import {
  patientAgeLabel,
  patientLocationLabel,
} from "@/lib/admin-patient-profile-mapper";
import type { AdminPatientProfileFormValues } from "@/lib/admin-patient-profile-schema";
import type { AdminPatientProfile } from "@/services/admin-api-hooks";

interface Props {
  values: AdminPatientProfileFormValues;
  patient?: AdminPatientProfile | null;
  suspended?: boolean;
}

export function AdminPatientBioPreview({ values, patient, suspended }: Props) {
  const user = patient?.user;
  const status = suspended ? "Suspended" : user?.status === "PENDING" ? "Pending" : "Active";
  const statusClass = suspended ? "ch-r" : user?.status === "PENDING" ? "ch-a" : "ch-g";
  const patientId = patient?.patientNumber ?? (patient?.id ? `#PT-${patient.id.slice(-4)}` : "—");
  const ageGender = [patientAgeLabel(patient?.dateOfBirth ?? values.dateOfBirth), values.gender || patient?.gender]
    .filter((item) => item && item !== "—")
    .join(" · ");

  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden", border: "1.5px solid var(--gray-200)", borderRadius: 16 }}>
      <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "20px 22px", flexWrap: "wrap" }}>
        {values.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.avatarUrl}
            alt={values.fullName}
            style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <UserAvatar
            firstName={values.fullName.split(" ")[0]}
            lastName={values.fullName.split(" ").slice(1).join(" ")}
            seed={patient?.id}
            size="md"
          />
        )}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-d)", fontSize: "1.3rem", color: "var(--gray-900)" }}>
              {values.fullName || "Patient Name"}
            </h2>
            <StatusChip label={status} className={statusClass} />
            {(values.bloodGroup || patient?.bloodGroup) ? (
              <span className="chip" style={{ background: "#fef2f2", color: "#b91c1c" }}>
                🩸 {values.bloodGroup || patient?.bloodGroup}
              </span>
            ) : null}
          </div>
          <div style={{ fontSize: ".78rem", color: "var(--gray-400)", marginTop: 3 }}>
            {patientId}
            {ageGender ? ` · ${ageGender}` : ""}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", borderTop: "1px solid var(--gray-100)", flexWrap: "wrap" }}>
        {[
          ["📧 Email", values.email || user?.email || "—"],
          ["📞 Phone", values.phone || user?.phone || "—"],
          ["📍 Location", patientLocationLabel({ ...patient, city: values.city || patient?.city, province: values.province || patient?.province, country: values.country || patient?.country } as AdminPatientProfile)],
          ["🗓️ Joined", user?.createdAt ? formatDateTime(user.createdAt) : "—"],
          ["🕑 Last Active", user?.lastSeenAt ? formatRelativeTime(user.lastSeenAt) : "—"],
        ].map(([label, value]) => (
          <div key={label} style={{ flex: "1 1 180px", padding: "12px 18px", borderRight: "1px solid var(--gray-100)" }}>
            <div style={{ fontSize: ".68rem", color: "var(--gray-400)", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: ".8rem", color: "var(--gray-800)", fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="kv-grid" style={{ margin: 0, borderTop: "1px solid var(--gray-100)", borderRadius: 0 }}>
        {[
          [patient?.stats?.appointmentCount ?? 0, "Consultations"],
          [patient?.stats?.prescriptionCount ?? 0, "Prescriptions"],
          [patient?.stats?.bookmarkCount ?? 0, "Saved Articles"],
          [patient?.stats?.questionCount ?? 0, "Questions Asked"],
        ].map(([num, label]) => (
          <div className="kv-card" key={String(label)} style={{ borderRadius: 0, border: "none", borderRight: "1px solid var(--gray-100)" }}>
            <strong>{num}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: "18px 22px", borderTop: "1px solid var(--gray-100)" }}>
        <div style={{ fontFamily: "var(--font-d)", fontSize: ".95rem", fontWeight: 700, color: "var(--gray-900)", marginBottom: 10 }}>
          🩺 Medical Summary
        </div>
        <div className="detail-list">
          <div className="detail-row">
            <dt>Allergies</dt>
            <dd>{values.allergies?.trim() || (patient?.allergies?.length ? patient.allergies.join(", ") : "None recorded")}</dd>
          </div>
          <div className="detail-row">
            <dt>Medical History</dt>
            <dd>{values.medicalHistory?.trim() || patient?.medicalHistory || "—"}</dd>
          </div>
          <div className="detail-row">
            <dt>Emergency Contact</dt>
            <dd>{values.emergencyContact?.trim() || patient?.emergencyContact || "—"}</dd>
          </div>
          <div className="detail-row">
            <dt>Health Interests</dt>
            <dd>{values.healthInterests?.trim() || (patient?.healthInterests?.length ? patient.healthInterests.join(", ") : "—")}</dd>
          </div>
        </div>
      </div>
    </div>
  );
}
