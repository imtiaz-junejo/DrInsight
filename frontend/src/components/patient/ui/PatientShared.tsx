"use client";

import { MEDICATIONS, type PAST_CONSULTATIONS, type UPCOMING_CONSULTATIONS, type VITALS } from "@/components/patient/data/patient-demo-data";
import { ActionButton } from "@/components/patient/ui/PatientPrimitives";
import { usePatientUiStore } from "@/store/patient-ui.store";

type Consultation = (typeof UPCOMING_CONSULTATIONS)[number] | (typeof PAST_CONSULTATIONS)[number];

export function ConsultationCard({ item, variant = "overview" }: { item: Consultation; variant?: "overview" | "full" }) {
  const showToast = usePatientUiStore((s) => s.showToast);
  const openConsultationModal = usePatientUiStore((s) => s.openConsultationModal);
  const openReviewModal = usePatientUiStore((s) => s.openReviewModal);

  const isPast = item.cardClass === "completed";
  const pastItem = isPast ? (item as (typeof PAST_CONSULTATIONS)[number]) : null;

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
      <div
        className={`cons-note${pastItem?.noteGreen ? " green" : ""}`}
        dangerouslySetInnerHTML={{
          __html: variant === "full" && isPast ? item.noteHtml.replace("Reason:", "Reason for visit:") : item.noteHtml,
        }}
      />
      <div className="cons-actions">
        {"canJoin" in item && item.canJoin ? (
          <ActionButton variant="primary" onClick={() => showToast("Joining video call...")}>
            📹 Join Call
          </ActionButton>
        ) : null}
        {isPast ? (
          <ActionButton onClick={openConsultationModal}>📋 Full Summary</ActionButton>
        ) : (
          <ActionButton
            variant={!("canJoin" in item && item.canJoin) ? "primary" : "default"}
            onClick={openConsultationModal}
          >
            {variant === "full" ? "📋 View Details" : "📋 Details"}
          </ActionButton>
        )}
        {!isPast ? (
          <ActionButton onClick={() => showToast("Notes saved")}>
            📝 {variant === "full" ? "Add Notes" : "Notes"}
          </ActionButton>
        ) : null}
        {!isPast ? (
          <ActionButton variant="danger" onClick={() => showToast("Cancelled")}>
            ✕ Cancel
          </ActionButton>
        ) : null}
        {isPast ? (
          <>
            <ActionButton onClick={() => showToast("Opening prescription...")}>💊 Prescription</ActionButton>
            {pastItem?.showReview ? (
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

export function VitalsGrid({ vitals, columns = 3 }: { vitals: typeof VITALS; columns?: number }) {
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

export function MedicationsList() {
  return (
    <>
      {MEDICATIONS.map((med) => (
        <div key={med.name} className="med-item">
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
