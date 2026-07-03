"use client";

import { useMemo } from "react";
import { DashButton, DashCard, DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorPrescriptions } from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export function PrescriptionsPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const prescriptionsQuery = useDoctorPrescriptions();

  const rows = useMemo(() => {
    const prescriptions = prescriptionsQuery.data ?? [];
    return prescriptions.flatMap((rx) =>
      rx.items.map((item, index) => ({
        key: `${rx.id}-${index}`,
        patient: `${rx.patient?.user?.firstName ?? ""} ${rx.patient?.user?.lastName ?? ""}`.trim() || "Patient",
        medication: item.medication,
        dosage: `${item.dosage} — ${item.frequency}`,
        issued: formatDate(rx.createdAt),
        refills: item.duration || "—",
        statusClass: "st-active",
        statusLabel: "Active",
      })),
    );
  }, [prescriptionsQuery.data]);

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
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {prescriptionsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    No prescriptions issued yet
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <strong>{row.patient}</strong>
                    </td>
                    <td>{row.medication}</td>
                    <td>{row.dosage}</td>
                    <td>{row.issued}</td>
                    <td>{row.refills}</td>
                    <td>
                      <span className={`st-chip ${row.statusClass}`}>{row.statusLabel}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashCard>
    </>
  );
}
