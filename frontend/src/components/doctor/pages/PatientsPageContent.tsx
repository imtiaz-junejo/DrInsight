"use client";

import { useMemo, useState } from "react";
import {
  DashButton,
  DashCard,
  DashPageHeader,
  FilterPills,
  PersonAvatar,
  TableButton,
} from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate, getInitials, gradientForId } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorPatients } from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const FILTERS = ["all", "critical", "followup", "active", "new"] as const;

export function PatientsPageContent() {
  const [filterIndex, setFilterIndex] = useState(0);
  const [search, setSearch] = useState("");
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientModal = useDoctorUiStore((s) => s.openPatientModal);
  const patientsQuery = useDoctorPatients();

  const allPatients = patientsQuery.data ?? [];
  const filterLabels = useMemo(
    () => [
      `All (${allPatients.length})`,
      "🔴 Critical (0)",
      "🟡 Follow-up (0)",
      "🟢 Active (0)",
      "🔵 New (0)",
    ],
    [allPatients.length],
  );

  const rows = useMemo(() => {
    const filter = FILTERS[filterIndex];
    if (filter !== "all") return [];
    return allPatients.filter((patient) => {
      const name = `${patient.user.firstName} ${patient.user.lastName}`;
      const id = `#PT-${patient.patientId.slice(-4).toUpperCase()}`;
      const matchesSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        id.toLowerCase().includes(search.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(search.toLowerCase());
      return filterIndex === 0 && matchesSearch;
    });
  }, [allPatients, filterIndex, search]);

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title="My Patients"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={() => showToast("Exporting...")}>📤 Export</DashButton>}
      />

      <DashCard
        title="👥 Patient Records"
        headerExtra={
          <span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
            {patientsQuery.isLoading ? "Loading..." : `${allPatients.length} patients`}
          </span>
        }
      >
        <div className="search-bar">
          <div className="search-ico-w">
            <input
              className="search-inp"
              placeholder="Search by name, ID, or condition..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <FilterPills filters={filterLabels} activeIndex={filterIndex} onChange={setFilterIndex} />
        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Age/Gender</th>
                <th>Condition</th>
                <th>Last Visit</th>
                <th>Next Appt.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patientsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    No patients found
                  </td>
                </tr>
              ) : (
                rows.map((patient) => {
                  const name = `${patient.user.firstName} ${patient.user.lastName}`;
                  const initials = getInitials(patient.user.firstName, patient.user.lastName);
                  const avatarBg = gradientForId(patient.patientId);
                  const id = `#PT-${patient.patientId.slice(-4).toUpperCase()}`;
                  const modal = {
                    initials,
                    name,
                    age: "—",
                    gender: "M" as const,
                    diagnosis: "—",
                    status: "Active" as const,
                    avatarBg,
                  };

                  return (
                    <tr key={patient.patientId}>
                      <td>
                        <div className="pt-name-cell">
                          <PersonAvatar initials={initials} className="pt-av" style={{ background: avatarBg }} seed={name} />
                          <div>
                            <div className="pt-n">{name}</div>
                            <div className="pt-id">{id}</div>
                          </div>
                        </div>
                      </td>
                      <td>—</td>
                      <td>—</td>
                      <td>{formatDate(patient.lastVisit)}</td>
                      <td>{patient.nextAppt ? formatDate(patient.nextAppt) : "—"}</td>
                      <td>
                        <span className="st-chip st-active">🟢 Active</span>
                      </td>
                      <td>
                        <TableButton variant="view" onClick={() => openPatientModal(modal)}>
                          View
                        </TableButton>
                        <TableButton onClick={() => showToast("Opening message...")}>Message</TableButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="table-pager">
          <span>
            Showing {rows.length} of {allPatients.length} patients
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <TableButton>← Prev</TableButton>
            <TableButton variant="view">1</TableButton>
            <TableButton>Next →</TableButton>
          </div>
        </div>
      </DashCard>
    </>
  );
}
