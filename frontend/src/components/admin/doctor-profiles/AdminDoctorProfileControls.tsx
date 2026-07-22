"use client";

import { AdminButton, StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { doctorCanonicalUrl } from "@/lib/admin-doctor-seo";
import { adminFormTogglePayload } from "@/lib/admin-doctor-profile-mapper";
import type { DoctorProfile } from "@/services/api-hooks";
import { useUpdateDoctorSeo, useUpdateUserStatus } from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

interface Props {
  doctor: DoctorProfile;
  hasCustomSeo: boolean;
  onSave: () => void;
  onResetSeo: () => void;
  onCopySchema: () => void;
  saving?: boolean;
}

export function AdminDoctorProfileControls({
  doctor,
  hasCustomSeo,
  onSave,
  onResetSeo,
  onCopySchema,
  saving,
}: Props) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const updateSeo = useUpdateDoctorSeo();
  const updateStatus = useUpdateUserStatus();
  const user = doctor.user;
  const suspended = user?.status === "SUSPENDED";
  const canonical = doctorCanonicalUrl(doctor);

  const toggle = (key: "bookingEnabled" | "contactEnabled" | "onlineAvailEnabled" | "physicalAvailEnabled") => {
    const current = doctor[key] !== false;
    const next = !current;
    updateSeo.mutate(adminFormTogglePayload(doctor, key, next), {
      onSuccess: () => showToast(next ? `Enabled ${key}` : `Disabled ${key}`),
    });
  };

  return (
    <div className="panel" style={{ border: "1.5px solid var(--gray-200)", borderRadius: 16, overflow: "hidden" }}>
      <div className="panel-hd" style={{ padding: "14px 20px", borderBottom: "1px solid var(--gray-100)" }}>
        <h3>🔧 Publish & Account Controls</h3>
      </div>
      <div className="panel-bd" style={{ padding: 18 }}>
        <div className="prw-note">
          Saving writes this doctor&apos;s profile and SEO to the live site. The public author profile picks it up
          immediately.
        </div>
        <div style={{ fontSize: ".8rem", color: "var(--gray-600)", lineHeight: 1.7, margin: "10px 0" }}>
          <div>
            <strong>Canonical URL:</strong>
            <br />
            {canonical}
          </div>
          <div style={{ marginTop: 8 }}>
            <strong>SEO:</strong>{" "}
            {hasCustomSeo ? <StatusChip label="Custom SEO live" className="ch-g" /> : <StatusChip label="Using defaults" className="ch-gray" />}
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Account:</strong>{" "}
            {suspended ? <StatusChip label="Suspended" className="ch-r" /> : <StatusChip label="Active" className="ch-g" />}
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Book Consultation:</strong>{" "}
            {doctor.bookingEnabled !== false ? <StatusChip label="Shown on profile" className="ch-g" /> : <StatusChip label="Hidden" className="ch-gray" />}
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Contact Author:</strong>{" "}
            {doctor.contactEnabled !== false ? <StatusChip label="Shown on profile" className="ch-g" /> : <StatusChip label="Hidden" className="ch-gray" />}
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Online Consultation Availability:</strong>{" "}
            {doctor.onlineAvailEnabled !== false ? <StatusChip label="Shown on profile" className="ch-g" /> : <StatusChip label="Hidden" className="ch-gray" />}
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Physical Appointment:</strong>{" "}
            {doctor.physicalAvailEnabled !== false ? <StatusChip label="Shown on profile" className="ch-g" /> : <StatusChip label="Hidden" className="ch-gray" />}
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: 14, flexWrap: "wrap" }}>
          <AdminButton variant="primary" onClick={onSave}>
            {saving ? "Saving..." : "💾 Save Doctor SEO"}
          </AdminButton>
          <AdminButton onClick={onCopySchema}>📋 Copy Schema</AdminButton>
          <AdminButton variant="danger" onClick={onResetSeo}>
            Reset SEO
          </AdminButton>
        </div>

        <div style={{ borderTop: "1.5px dashed var(--gray-200)", margin: "16px 0 12px" }} />

        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: ".84rem", fontWeight: 600, color: "var(--gray-800)" }}>
          <input
            type="checkbox"
            checked={doctor.bookingEnabled !== false}
            onChange={() => toggle("bookingEnabled")}
            style={{ width: 17, height: 17, cursor: "pointer" }}
          />
          📅 Allow Book Consultation on public profile
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: ".84rem", fontWeight: 600, color: "var(--gray-800)", marginTop: 10 }}>
          <input
            type="checkbox"
            checked={doctor.contactEnabled !== false}
            onChange={() => toggle("contactEnabled")}
            style={{ width: 17, height: 17, cursor: "pointer" }}
          />
          📧 Allow Contact Author on public profile
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: ".84rem", fontWeight: 600, color: "var(--gray-800)", marginTop: 10 }}>
          <input
            type="checkbox"
            checked={doctor.onlineAvailEnabled !== false}
            onChange={() => toggle("onlineAvailEnabled")}
            style={{ width: 17, height: 17, cursor: "pointer" }}
          />
          🕐 Allow Online Consultation Availability on public profile
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: ".84rem", fontWeight: 600, color: "var(--gray-800)", marginTop: 10 }}>
          <input
            type="checkbox"
            checked={doctor.physicalAvailEnabled !== false}
            onChange={() => toggle("physicalAvailEnabled")}
            style={{ width: 17, height: 17, cursor: "pointer" }}
          />
          🏥 Allow Physical Appointment on public profile
        </label>

        <div className="prw-note" style={{ margin: "8px 0 4px" }}>
          These control whether the Book Consultation, Contact Author, Online Consultation Availability and Physical
          Appointment cards appear on the public profile.
        </div>

        <div style={{ borderTop: "1.5px dashed var(--gray-200)", margin: "16px 0 12px" }} />
        <div className="prw-note" style={{ marginBottom: 10 }}>
          {suspended
            ? "This account is suspended — the doctor cannot log in, publish, or take consultations, and their profile is hidden from the public directory."
            : "Suspending removes the doctor from the public directory and blocks login, publishing and consultations until reactivated."}
        </div>
        <div className="btn-row" style={{ flexWrap: "wrap" }}>
          {suspended && user?.id ? (
            <AdminButton
              variant="green"
              onClick={() =>
                updateStatus.mutate({ id: user.id, status: "ACTIVE" }, { onSuccess: () => showToast("✅ Account reactivated") })
              }
            >
              ✅ Reactivate Account
            </AdminButton>
          ) : user?.id ? (
            <AdminButton
              variant="danger"
              onClick={() =>
                updateStatus.mutate({ id: user.id, status: "SUSPENDED" }, { onSuccess: () => showToast("🚫 Account suspended") })
              }
            >
              🚫 Suspend Account
            </AdminButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
