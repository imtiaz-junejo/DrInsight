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
import { openPatientFromList } from "@/components/doctor/patient/PatientDetailModal";
import { PatientRowActions } from "@/components/doctor/patient/PatientRowActions";
import { formatDate, getInitials, gradientForId } from "@/lib/data-mappers";
import { formatPatientDisplayId } from "@/lib/member-ids";
import { patientStatusLabel, todayFormatted } from "@/lib/doctor-utils";
import { useDoctorPatients } from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const FILTERS = ["all", "critical", "followup", "active", "new"] as const;

function statusChipClass(status?: string) {
  if (status === "Critical") return "st-critical";
  if (status === "Follow-up") return "st-followup";
  if (status === "New") return "st-new";
  return "st-active";
}

export function PatientsPageContent() {
  const [filterIndex, setFilterIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientModal = useDoctorUiStore((s) => s.openPatientModal);
  const patientsQuery = useDoctorPatients();

  const allPatients = patientsQuery.data ?? [];

  const counts = useMemo(() => {
    const critical = allPatients.filter((p) => p.status === "Critical").length;
    const followup = allPatients.filter((p) => p.status === "Follow-up").length;
    const active = allPatients.filter((p) => p.status === "Active").length;
    const newest = allPatients.filter((p) => p.status === "New").length;
    return { critical, followup, active, newest };
  }, [allPatients]);

  const filterLabels = useMemo(
    () => [
      `All (${allPatients.length})`,
      `🔴 Critical (${counts.critical})`,
      `🟡 Follow-up (${counts.followup})`,
      `🟢 Active (${counts.active})`,
      `🔵 New (${counts.newest})`,
    ],
    [allPatients.length, counts],
  );

  const filteredRows = useMemo(() => {
    const filter = FILTERS[filterIndex];
    return allPatients.filter((patient) => {
      const name = `${patient.user.firstName} ${patient.user.lastName}`;
      const id = formatPatientDisplayId(patient.patientNumber, patient.patientId);
      const matchesSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        id.toLowerCase().includes(search.toLowerCase()) ||
        patient.patientId.toLowerCase().includes(search.toLowerCase()) ||
        (patient.condition ?? "").toLowerCase().includes(search.toLowerCase());

      const status = patient.status ?? "Active";
      const matchesFilter =
        filter === "all" ||
        (filter === "critical" && status === "Critical") ||
        (filter === "followup" && status === "Follow-up") ||
        (filter === "active" && status === "Active") ||
        (filter === "new" && status === "New");

      return matchesSearch && matchesFilter;
    });
  }, [allPatients, filterIndex, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const rows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <FilterPills
          filters={filterLabels}
          activeIndex={filterIndex}
          onChange={(index) => {
            setFilterIndex(index);
            setPage(1);
          }}
        />
        <div className="pt-table-wrap">
          <table className="pt-table pt-table-records">
            <colgroup>
              <col className="pt-col-patient" />
              <col className="pt-col-age" />
              <col className="pt-col-condition" />
              <col className="pt-col-date" />
              <col className="pt-col-date" />
              <col className="pt-col-status" />
              <col className="pt-col-actions" />
            </colgroup>
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
                  const id = formatPatientDisplayId(patient.patientNumber, patient.patientId);
                  const status = patient.status ?? "Active";
                  const statusMeta = patientStatusLabel(status);
                  const genderShort =
                    patient.gender === "FEMALE" ? "F" : patient.gender === "MALE" ? "M" : patient.gender?.[0] ?? "—";

                  return (
                    <tr
                      key={patient.patientId}
                      className="pt-row-clickable"
                      onClick={() => openPatientModal(openPatientFromList(patient))}
                      data-s={status.toLowerCase()}
                    >
                      <td className="pt-cell-patient">
                        <div className="pt-name-cell">
                          <PersonAvatar initials={initials} className="pt-av" style={{ background: avatarBg }} seed={name} />
                          <div className="pt-name-meta">
                            <div className="pt-n">
                              {name}
                              {patient.isCritical ? (
                                <span className="critical-patient-badge" title="Critical Patient">
                                  🚨
                                </span>
                              ) : null}
                            </div>
                            <div className="pt-id">{id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="pt-cell-compact">
                        {patient.age ?? "—"}/{genderShort}
                      </td>
                      <td className="pt-cell-condition">
                        <span className="pt-condition" title={patient.condition ?? undefined}>
                          {patient.condition ?? "—"}
                        </span>
                      </td>
                      <td className="pt-cell-compact">{formatDate(patient.lastVisit)}</td>
                      <td className="pt-cell-compact">{patient.nextAppt ? formatDate(patient.nextAppt) : "—"}</td>
                      <td>
                        <span className={`st-chip ${statusChipClass(status)}`}>{statusMeta.label}</span>
                      </td>
                      <td>
                        <PatientRowActions patient={patient} />
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
            Showing {rows.length} of {filteredRows.length} patients
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <TableButton onClick={() => page > 1 && setPage((p) => p - 1)}>← Prev</TableButton>
            <TableButton variant="view">{page}</TableButton>
            <TableButton onClick={() => page < totalPages && setPage((p) => p + 1)}>Next →</TableButton>
          </div>
        </div>
      </DashCard>
    </>
  );
}
