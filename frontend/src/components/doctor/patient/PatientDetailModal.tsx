"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  DoctorIcon,
  DoctorIconInline,
  Pill,
  UserRound,
  X,
} from "@/components/doctor/icons/DoctorIcons";
import { formatDate, getInitials, gradientForId } from "@/lib/data-mappers";
import { formatPatientDisplayId } from "@/lib/member-ids";
import { patientStatusLabel } from "@/lib/doctor-utils";
import { usePatientDetail } from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { AddNoteModal } from "./AddNoteModal";
import { FlagCriticalModal } from "./FlagCriticalModal";
import { EPrescriptionBuilder, type PrescriptionPreviewData } from "./EPrescriptionBuilder";
import { EPrescriptionViewer } from "./EPrescriptionViewer";

function calcAge(dateOfBirth?: string | null) {
  if (!dateOfBirth) return "—";
  const years = Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
  return String(years);
}

export function PatientDetailModal() {
  const patient = useDoctorUiStore((s) => s.patientModal);
  const activePanel = useDoctorUiStore((s) => s.activePatientPanel);
  const closePatientModal = useDoctorUiStore((s) => s.closePatientModal);
  const [previewRx, setPreviewRx] = useState<PrescriptionPreviewData | null>(null);

  const patientId = patient?.patientId;
  const detailQuery = usePatientDetail(patientId);
  const detail = detailQuery.data;

  const display = useMemo(() => {
    if (!patient?.patientId) return null;
    const name = detail
      ? `${detail.user.firstName} ${detail.user.lastName}`
      : patient.name;
    const status = detail?.status ?? patient.status;
    const diagnosis = detail?.condition ?? patient.diagnosis;
    const gender = detail?.gender ?? patient.gender;
    const age = detail ? calcAge(detail.dateOfBirth) : patient.age;
    const patientCode = formatPatientDisplayId(detail?.patientNumber, patient.patientId);
    const memberSince = detail?.memberSince
      ? new Date(detail.memberSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "—";

    return {
      name,
      status,
      diagnosis,
      gender,
      age,
      patientCode,
      memberSince,
      avatarBg: patient.avatarBg,
      initials: patient.initials || getInitials(name.split(" ")[0], name.split(" ")[1] ?? ""),
      isCritical: detail?.isCritical ?? patient.isCritical ?? status === "Critical",
    };
  }, [patient, detail]);

  if (!patient?.patientId || !display) return null;

  const resolvedPatientId = patient.patientId;

  const statusMeta = patientStatusLabel(display.status);
  const genderLabel =
    display.gender === "M" || display.gender === "MALE"
      ? "Male"
      : display.gender === "F" || display.gender === "FEMALE"
        ? "Female"
        : display.gender ?? "—";

  if (previewRx) {
    return <EPrescriptionViewer data={previewRx} onClose={() => setPreviewRx(null)} />;
  }

  if (activePanel === "note") {
    return (
      <AddNoteModal patientId={resolvedPatientId} patientName={display.name} patientCode={display.patientCode} />
    );
  }

  if (activePanel === "prescription") {
    return (
      <EPrescriptionBuilder
        patientId={resolvedPatientId}
        patientName={display.name}
        patientCode={display.patientCode}
        onPreview={setPreviewRx}
      />
    );
  }

  if (activePanel === "flag") {
    return (
      <FlagCriticalModal patientId={resolvedPatientId} patientName={display.name} patientCode={display.patientCode} />
    );
  }

  const medications = detail?.medications ?? [];
  const history = detail?.consultationHistory ?? [];

  return (
    <div
      className="modal-ov show"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePatientModal();
      }}
    >
      <div className="modal">
        <div className="modal-hd">
          <div className="modal-av" style={{ background: display.avatarBg }}>
            {display.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--gray-900)" }}>
                {display.name}
              </div>
              {display.isCritical ? (
                <span className="st-chip st-critical" title="Critical Patient">
                  <DoctorIconInline icon={AlertTriangle} size="sm">
                    Critical Patient
                  </DoctorIconInline>
                </span>
              ) : null}
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--blue)", fontWeight: 600 }}>{display.diagnosis}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>
              {display.patientCode} · Patient since {display.memberSince}
            </div>
          </div>
          <button type="button" className="modal-close" onClick={closePatientModal} aria-label="Close">
            <DoctorIcon icon={X} size="sm" />
          </button>
        </div>
        <div className="modal-bd">
          {detailQuery.isLoading ? (
            <p style={{ color: "var(--gray-400)", textAlign: "center", padding: 16 }}>Loading patient record...</p>
          ) : null}

          <div className="msec">
            <h4>
              <DoctorIconInline icon={UserRound} size="sm">
                Patient Information
              </DoctorIconInline>
            </h4>
            <div className="info-grid">
              <div className="ii">
                <label>Full Name</label>
                <span>{display.name}</span>
              </div>
              <div className="ii">
                <label>Age / Gender</label>
                <span>
                  {display.age} / {genderLabel}
                </span>
              </div>
              <div className="ii">
                <label>Diagnosis</label>
                <span>{display.diagnosis}</span>
              </div>
              <div className="ii">
                <label>Status</label>
                <span style={{ color: statusMeta.color, fontWeight: 700 }}>{statusMeta.label}</span>
              </div>
              <div className="ii">
                <label>Blood Group</label>
                <span>{detail?.bloodGroup ?? "—"}</span>
              </div>
              <div className="ii">
                <label>Allergies</label>
                <span>{detail?.allergies?.length ? detail.allergies.join(", ") : "None recorded"}</span>
              </div>
              <div className="ii">
                <label>Contact</label>
                <span>{detail?.user.phone ?? detail?.user.email ?? "—"}</span>
              </div>
              <div className="ii">
                <label>Emergency Contact</label>
                <span>{detail?.emergencyContact ?? "—"}</span>
              </div>
            </div>
          </div>

          <div className="msec">
            <h4>
              <DoctorIconInline icon={Pill} size="sm">
                Current Medications
              </DoctorIconInline>
            </h4>
            <div className="med-list">
              {medications.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--gray-400)" }}>No active medications on file</p>
              ) : (
                medications.map((med) => (
                  <div key={`${med.name}-${med.dosage}`} className="med-row">
                    <div>
                      <div className="med-n">{med.name}</div>
                      <div className="med-d">{med.dosage}</div>
                    </div>
                    <span className="st-chip st-active">{med.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="msec">
            <h4>
              <DoctorIconInline icon={ClipboardList} size="sm">
                Consultation History
              </DoctorIconInline>
            </h4>
            <div className="hist-list">
              {history.length === 0 ? (
                <p style={{ fontSize: "0.82rem", color: "var(--gray-400)" }}>No consultations yet</p>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="hist-item">
                    <div className="hist-dot">
                      <DoctorIcon icon={item.hasPrescription ? Pill : Calendar} size="sm" />
                    </div>
                    <div>
                      <div className="hist-t">{item.reason ?? "Consultation"}</div>
                      <div className="hist-s">
                        {formatDate(item.scheduledAt)} · {item.consultationType} · {item.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function openPatientFromList(patient: {
  patientId: string;
  patientNumber?: string | null;
  user: { firstName: string; lastName: string };
  status?: string;
  isCritical?: boolean;
  condition?: string | null;
  age?: string | null;
  gender?: string | null;
}) {
  const name = `${patient.user.firstName} ${patient.user.lastName}`;
  return {
    patientId: patient.patientId,
    initials: getInitials(patient.user.firstName, patient.user.lastName),
    name,
    age: patient.age ?? "—",
    gender: patient.gender === "FEMALE" ? "F" : patient.gender === "MALE" ? "M" : (patient.gender ?? "M"),
    diagnosis: patient.condition ?? "—",
    status: (patient.status as "Critical" | "Active" | "Follow-up" | "New") ?? "Active",
    avatarBg: gradientForId(patient.patientId),
    isCritical: patient.isCritical,
  };
}
