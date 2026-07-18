"use client";

import type { MouseEvent } from "react";
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
        📝 Add Note
      </button>
      <button
        type="button"
        className="pt-act-btn"
        onClick={() => openPatientAction(modalData, "prescription")}
      >
        💊 Write e-Prescription
      </button>
      <button
        type="button"
        className="pt-act-btn pt-act-btn-critical"
        onClick={() => openPatientAction(modalData, "flag")}
      >
        🚨 Flag Critical
      </button>
    </div>
  );
}
