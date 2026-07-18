"use client";

import { useRouter } from "next/navigation";
import { patientConsultationPath } from "@/lib/consultation-utils";

import { ActionButton } from "@/components/patient/ui/PatientPrimitives";
import { doctorFullName, formatDate, type MappedConsultation } from "@/lib/data-mappers";
import type { Prescription } from "@/services/patient-api-hooks";
import { useCancelAppointment } from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

export interface VitalItem {
  val: string;
  unit: string;
  label: string;
  badge: string;
  badgeLabel: string;
}

export function ConsultationCard({ item, variant = "overview" }: { item: MappedConsultation; variant?: "overview" | "full" }) {
  const router = useRouter();
  const showToast = usePatientUiStore((s) => s.showToast);
  const openConsultationModal = usePatientUiStore((s) => s.openConsultationModal);
  const openReviewModal = usePatientUiStore((s) => s.openReviewModal);
  const cancelMutation = useCancelAppointment();

  const isPast = item.cardClass === "completed";

  const handleCancel = () => {
    cancelMutation.mutate(item.id, {
      onSuccess: () => showToast("Appointment cancelled"),
      onError: () => showToast("Could not cancel appointment"),
    });
  };

  return (
    <div className={`cons-card ${item.cardClass}`}>
      <div className="cons-top">
        <div className="dr-av" style={{ background: item.avatarBg }}>
          {item.initials}
        </div>
        <div>
          <div className="cons-dr-name">{item.doctorName}</div>
          <div className="cons-dr-spec">{item.specialty}</div>
        </div>
        <span className={`cons-chip ${item.chip}`}>{item.chipLabel}</span>
      </div>
      <div className="cons-details">
        {item.details.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      {item.noteHtml ? (
        <div
          className={`cons-note${item.noteGreen ? " green" : ""}`}
          dangerouslySetInnerHTML={{
            __html: variant === "full" && isPast ? item.noteHtml.replace("Reason:", "Reason for visit:") : item.noteHtml,
          }}
        />
      ) : null}
      <div className="cons-actions">
        {item.canJoin ? (
          <ActionButton variant="primary" onClick={() => router.push(patientConsultationPath(item.id))}>
            📹 Join Call
          </ActionButton>
        ) : null}
        {isPast ? (
          <ActionButton onClick={openConsultationModal}>📋 Full Summary</ActionButton>
        ) : (
          <ActionButton variant={!item.canJoin ? "primary" : "default"} onClick={openConsultationModal}>
            {variant === "full" ? "📋 View Details" : "📋 Details"}
          </ActionButton>
        )}
        {!isPast ? (
          <ActionButton onClick={() => showToast("Notes saved")}>
            📝 {variant === "full" ? "Add Notes" : "Notes"}
          </ActionButton>
        ) : null}
        {!isPast ? (
          <ActionButton variant="danger" onClick={handleCancel}>
            ✕ Cancel
          </ActionButton>
        ) : null}
        {isPast ? (
          <>
            <ActionButton onClick={() => showToast("Opening prescription...")}>💊 Prescription</ActionButton>
            {item.showReview ? (
              <ActionButton onClick={openReviewModal}>⭐ Review</ActionButton>
            ) : null}
            <ActionButton variant="primary" onClick={() => showToast("Follow-up booking opened")}>
              🔄 Follow-up
            </ActionButton>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function VitalsGrid({ vitals, columns = 3 }: { vitals: VitalItem[]; columns?: number }) {
  return (
    <div className="vitals-grid" style={columns === 3 ? { gridTemplateColumns: "repeat(3, 1fr)" } : undefined}>
      {vitals.map((v) => (
        <div key={v.label} className="vital">
          <div className="v-val">{v.val}</div>
          <div className="v-unit">{v.unit}</div>
          <div className="v-label">{v.label}</div>
          <div className={`v-badge ${v.badge}`}>{v.badgeLabel}</div>
        </div>
      ))}
    </div>
  );
}

function mapPrescriptionsToMeds(prescriptions: Prescription[]) {
  const iconBgs = ["#eff6ff", "#f0fdf4", "#fffbeb"];
  return prescriptions.flatMap((rx, rxIndex) =>
    rx.items.map((item) => ({
      key: `${rx.id}-${item.medication}`,
      icon: "💊",
      iconBg: iconBgs[rxIndex % iconBgs.length],
      name: item.medication,
      dose: `${item.dosage} — ${item.frequency}${item.duration ? ` · ${item.duration}` : ""}`,
      next: rx.doctor?.user
        ? `Prescribed by ${doctorFullName(rx.doctor.user)}`
        : `Prescribed ${formatDate(rx.createdAt)}`,
      nextColor: "var(--blue)",
      status: "ms-active",
      statusLabel: "Active",
    })),
  );
}

export function MedicationsList({ prescriptions = [], loading }: { prescriptions?: Prescription[]; loading?: boolean }) {
  if (loading) {
    return <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", padding: "12px 0" }}>Loading medications...</div>;
  }

  const meds = mapPrescriptionsToMeds(prescriptions);
  if (meds.length === 0) {
    return <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", padding: "12px 0" }}>No active medications on record.</div>;
  }

  return (
    <>
      {meds.map((med) => (
        <div key={med.key} className="med-item">
          <div className="med-ic" style={{ background: med.iconBg }}>
            {med.icon}
          </div>
          <div className="med-info">
            <div className="med-n">{med.name}</div>
            <div className="med-d">{med.dose}</div>
            <div className="med-next" style={{ color: med.nextColor }}>
              {med.next}
            </div>
          </div>
          <span className={med.status}>{med.statusLabel}</span>
        </div>
      ))}
    </>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div style={{ fontSize: "0.82rem", color: "var(--gray-400)", padding: "16px 0", textAlign: "center" }}>{message}</div>
  );
}
