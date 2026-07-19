"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  DoctorIconInline,
  PhysicianDashboardLabel,
  Pill,
  SearchFieldIcon,
  UserRound,
} from "@/components/doctor/icons/DoctorIcons";
import {
  DashButton,
  DashCard,
  DashPageHeader,
  UserAvatarFromName,
} from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import { openPatientFromList } from "@/components/doctor/patient/PatientDetailModal";
import { useDoctorPatients } from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export function NewPrescriptionPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientAction = useDoctorUiStore((s) => s.openPatientAction);
  const [search, setSearch] = useState("");

  const patientsQuery = useDoctorPatients();
  const patients = patientsQuery.data ?? [];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((p) => {
      const name = `${p.user.firstName} ${p.user.lastName}`.toLowerCase();
      return name.includes(term) || p.patientId.toLowerCase().includes(term);
    });
  }, [patients, search]);

  const handleSelect = (patient: (typeof patients)[number]) => {
    const modalData = openPatientFromList(patient);
    openPatientAction(modalData, "prescription");
    showToast(`Opening e-prescription for ${modalData.name}`);
  };

  return (
    <>
      <DashPageHeader
        subtitle={<PhysicianDashboardLabel />}
        title="New Prescription"
        dateStr={todayFormatted()}
        actions={
          <Link href="/doctor/prescriptions">
            <DashButton variant="outline">← Back</DashButton>
          </Link>
        }
      />

      <DashCard
        title={<DoctorIconInline icon={UserRound} size="button">Select Patient</DoctorIconInline>}
        headerExtra={
          <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
            Choose a patient to write an e-prescription
          </span>
        }
      >
        <div className="search-bar">
          <div className="search-ico-w">
            <SearchFieldIcon />
            <input
              className="search-inp"
              placeholder="Search patients by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {patientsQuery.isLoading ? (
          <p style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>Loading patients...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
            {patients.length === 0
              ? "No patients linked to your practice yet."
              : "No patients match your search."}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((patient) => {
              const name = `${patient.user.firstName} ${patient.user.lastName}`;
              return (
                <button
                  key={patient.patientId}
                  type="button"
                  onClick={() => handleSelect(patient)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    border: "1.5px solid var(--gray-100)",
                    borderRadius: 12,
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <UserAvatarFromName
                    firstName={patient.user.firstName}
                    lastName={patient.user.lastName}
                    seed={patient.patientId}
                    className="sch-av"
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--gray-900)" }}>{name}</div>
                    <div style={{ fontSize: "0.76rem", color: "var(--gray-500)" }}>
                      {patient.condition ?? "Patient"} · Last visit {formatDate(patient.lastVisit)} ·{" "}
                      {patient.appointmentCount} consultation{patient.appointmentCount === 1 ? "" : "s"}
                    </div>
                  </div>
                  <span className="ca-btn primary" style={{ pointerEvents: "none" }}>
                    <DoctorIconInline icon={Pill} size="sm">
                      Write Rx
                    </DoctorIconInline>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </DashCard>
    </>
  );
}
