"use client";

import type { MouseEvent } from "react";
import { AlertTriangle, DoctorIconInline, FileText, Pill } from "@/components/doctor/icons/DoctorIcons";
import { openPatientFromList } from "@/components/doctor/patient/PatientDetailModal";
import type { DoctorPatient } from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

function stopRowClick(e: MouseEvent) {
  e.stopPropagation();
}

export function PatientRowActions({ patient }: { patient: DoctorPatient }) {
  const openPatientAction = useDoctorUiStore((s) => s.openPatientAction);
  const modalData = openPatientFromList(patient);

  return (
    <div className="pt-actions" onClick={stopRowClick} onKeyDown={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="pt-act-btn"
        onClick={() => openPatientAction(modalData, "note")}
      >
        <DoctorIconInline icon={FileText} size="sm">
          Add Note
        </DoctorIconInline>
      </button>
      <button
        type="button"
        className="pt-act-btn"
        onClick={() => openPatientAction(modalData, "prescription")}
      >
        <DoctorIconInline icon={Pill} size="sm">
          Write e-Prescription
        </DoctorIconInline>
      </button>
      <button
        type="button"
        className="pt-act-btn pt-act-btn-critical"
        onClick={() => openPatientAction(modalData, "flag")}
      >
        <DoctorIconInline icon={AlertTriangle} size="sm">
          Flag Critical
        </DoctorIconInline>
      </button>
    </div>
  );
}
