"use client";

import { Footer } from "@/components/layout/Footer";
import { patientStatusLabel } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export function DoctorFooter() {
  return <Footer />;
}

export function PatientDetailModal() {
  const patient = useDoctorUiStore((s) => s.patientModal);
  const closePatientModal = useDoctorUiStore((s) => s.closePatientModal);
  const showToast = useDoctorUiStore((s) => s.showToast);

  if (!patient) return null;

  const status = patientStatusLabel(patient.status);
  const genderLabel = patient.gender === "M" ? "Male" : "Female";

  return (
    <div
      className={`modal-ov${patient ? " show" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePatientModal();
      }}
    >
      <div className="modal">
        <div className="modal-hd">
          <div className="modal-av" style={{ background: patient.avatarBg }}>
            {patient.initials}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--gray-900)" }}>
              {patient.name}
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--blue)", fontWeight: 600 }}>{patient.diagnosis}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>#PT-2891 · Patient since March 2024</div>
          </div>
          <button type="button" className="modal-close" onClick={closePatientModal}>
            ✕
          </button>
        </div>
        <div className="modal-bd">
          <div className="msec">
            <h4>📊 Latest Vitals</h4>
            <div className="vitals-grid-m">
              {[
                ["148/92", "mmHg", "Blood Pressure", "vb-h", "High"],
                ["78", "bpm", "Heart Rate", "vb-n", "Normal"],
                ["96%", "SpO₂", "Oxygen Sat.", "vb-l", "Borderline"],
                ["36.8", "°C", "Temperature", "vb-n", "Normal"],
                ["68", "kg", "Weight", "vb-n", "Stable"],
                ["27.1", "kg/m²", "BMI", "vb-n", "Normal"],
              ].map(([val, unit, label, badge, badgeLabel]) => (
                <div key={label} className="vital-box">
                  <div className="v-val">{val}</div>
                  <div className="v-unit">{unit}</div>
                  <div className="v-label">{label}</div>
                  <div className={`v-badge ${badge}`}>{badgeLabel}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="msec">
            <h4>👤 Patient Information</h4>
            <div className="info-grid">
              <div className="ii">
                <label>Full Name</label>
                <span>{patient.name}</span>
              </div>
              <div className="ii">
                <label>Age / Gender</label>
                <span>
                  {patient.age} / {genderLabel}
                </span>
              </div>
              <div className="ii">
                <label>Diagnosis</label>
                <span>{patient.diagnosis}</span>
              </div>
              <div className="ii">
                <label>Status</label>
                <span style={{ color: status.color, fontWeight: 700 }}>
                  {status.label}
                </span>
              </div>
              <div className="ii">
                <label>Blood Group</label>
                <span>A+</span>
              </div>
              <div className="ii">
                <label>Allergies</label>
                <span>Penicillin, Sulfa drugs</span>
              </div>
            </div>
          </div>
          <div className="msec">
            <h4>💊 Current Medications</h4>
            <div className="med-list">
              {[
                ["Furosemide 40mg", "Once daily — Morning"],
                ["Carvedilol 6.25mg", "Twice daily — With meals"],
                ["Lisinopril 5mg", "Once daily — Evening"],
              ].map(([name, dose]) => (
                <div key={name} className="med-row">
                  <div>
                    <div className="med-n">{name}</div>
                    <div className="med-d">{dose}</div>
                  </div>
                  <span className="st-chip st-active">Active</span>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-blue-m" onClick={() => showToast("Opening video call...")}>
              📹 Start Consultation
            </button>
            <button type="button" className="btn-out-m" onClick={() => showToast("Note editor opened")}>
              📝 Add Note
            </button>
            <button type="button" className="btn-out-m" onClick={() => showToast("Prescription pad opened")}>
              💊 Prescribe
            </button>
            <button
              type="button"
              style={{
                background: "#fef2f2",
                color: "var(--red)",
                border: "1.5px solid #fecaca",
                padding: "11px 18px",
                borderRadius: 10,
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                flex: 1,
              }}
              onClick={() => showToast("Patient flagged as critical")}
            >
              🚨 Flag Critical
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
