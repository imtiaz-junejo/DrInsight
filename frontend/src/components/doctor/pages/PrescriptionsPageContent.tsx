"use client";

import { DashButton, DashCard, DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export function PrescriptionsPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title="Prescriptions"
        dateStr={todayFormatted()}
        actions={
          <DashButton variant="solid" onClick={() => showToast("Opening prescription pad...")}>
            💊 New Prescription
          </DashButton>
        }
      />

      <DashCard title="💊 Recent Prescriptions Issued">
        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Issued</th>
                <th>Refills</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Fatima Khan", "Furosemide", "40mg — Once daily", "Jun 1, 2026", "3 remaining", "st-active", "Active"],
                ["Ahmed Raza", "Bisoprolol", "5mg — Once daily", "Today", "2 remaining", "st-new", "Pending"],
                ["Sara Malik", "Amlodipine", "10mg — Once daily", "May 20, 2026", "1 remaining", "st-followup", "Refill needed"],
                ["Imran Ali", "Clopidogrel", "75mg — Once daily", "May 10, 2026", "0 remaining", "st-critical", "Expired"],
              ].map(([patient, med, dose, issued, refills, statusClass, statusLabel]) => (
                <tr key={patient + med}>
                  <td>
                    <strong>{patient}</strong>
                  </td>
                  <td>{med}</td>
                  <td>{dose}</td>
                  <td>{issued}</td>
                  <td>{refills}</td>
                  <td>
                    <span className={`st-chip ${statusClass}`}>{statusLabel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </>
  );
}
