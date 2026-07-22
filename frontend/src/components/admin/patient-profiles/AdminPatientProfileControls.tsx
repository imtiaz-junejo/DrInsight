"use client";

import { AdminButton, StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { patientLocationLabel } from "@/lib/admin-patient-profile-mapper";
import type { AdminPatientProfile } from "@/services/admin-api-hooks";
import { useUpdateUserStatus } from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

interface Props {
  patient: AdminPatientProfile;
  onSave: () => void;
  saving?: boolean;
}

export function AdminPatientProfileControls({ patient, onSave, saving }: Props) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const updateStatus = useUpdateUserStatus();
  const user = patient.user;
  const suspended = user?.status === "SUSPENDED";

  return (
    <div className="panel" style={{ border: "1.5px solid var(--gray-200)", borderRadius: 16, overflow: "hidden" }}>
      <div className="panel-hd" style={{ padding: "14px 20px", borderBottom: "1px solid var(--gray-100)" }}>
        <h3>⚙️ Account Controls</h3>
      </div>
      <div className="panel-bd" style={{ padding: 18 }}>
        <div className="prw-note">
          Saving updates this patient&apos;s profile in the database. Account status changes apply immediately.
        </div>
        <div style={{ fontSize: ".8rem", color: "var(--gray-600)", lineHeight: 1.7, margin: "10px 0" }}>
          <div>
            <strong>Patient ID:</strong> {patient.patientNumber ?? `#PT-${patient.id.slice(-4)}`}
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Account:</strong>{" "}
            {suspended ? <StatusChip label="Suspended" className="ch-r" /> : <StatusChip label="Active" className="ch-g" />}
          </div>
          <div style={{ marginTop: 6 }}>
            <strong>Location:</strong> {patientLocationLabel(patient)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          <AdminButton variant="green" onClick={onSave}>
            {saving ? "Saving..." : "💾 Save Patient Profile"}
          </AdminButton>
          {user?.id && suspended ? (
            <AdminButton
              variant="green"
              onClick={() =>
                updateStatus.mutate(
                  { id: user.id, status: "ACTIVE" },
                  { onSuccess: () => showToast("Patient reactivated") },
                )
              }
            >
              ✓ Reactivate Account
            </AdminButton>
          ) : user?.id ? (
            <AdminButton
              variant="danger"
              onClick={() =>
                updateStatus.mutate(
                  { id: user.id, status: "SUSPENDED" },
                  { onSuccess: () => showToast("Patient suspended") },
                )
              }
            >
              ⛔ Suspend Account
            </AdminButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
