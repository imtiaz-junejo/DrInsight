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
import { PATIENT_ROWS } from "@/components/doctor/data/doctor-demo-data";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const FILTERS = ["all", "critical", "followup", "active", "new"] as const;
const FILTER_LABELS = ["All (142)", "🔴 Critical (4)", "🟡 Follow-up (28)", "🟢 Active (98)", "🔵 New (12)"];

export function PatientsPageContent() {
  const [filterIndex, setFilterIndex] = useState(0);
  const [search, setSearch] = useState("");
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientModal = useDoctorUiStore((s) => s.openPatientModal);

  const rows = useMemo(() => {
    const filter = FILTERS[filterIndex];
    return PATIENT_ROWS.filter((row) => {
      const matchesFilter = filter === "all" || row.filter === filter;
      const matchesSearch =
        !search ||
        row.name.toLowerCase().includes(search.toLowerCase()) ||
        row.id.toLowerCase().includes(search.toLowerCase()) ||
        row.condition.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filterIndex, search]);

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title="My Patients"
        dateStr={todayFormatted()}
        actions={<DashButton variant="solid" onClick={() => showToast("Exporting...")}>📤 Export</DashButton>}
      />

      <DashCard title="👥 Patient Records" headerExtra={<span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>142 patients</span>}>
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
        <FilterPills filters={FILTER_LABELS} activeIndex={filterIndex} onChange={setFilterIndex} />
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
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="pt-name-cell">
                      <PersonAvatar initials={row.initials} className="pt-av" style={{ background: row.avatarBg }} seed={row.name} />
                      <div>
                        <div className="pt-n">{row.name}</div>
                        <div className="pt-id">{row.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{row.ageGender}</td>
                  <td>{row.condition}</td>
                  <td>{row.lastVisit}</td>
                  <td>{row.nextAppt}</td>
                  <td>
                    <span className={`st-chip ${row.statusClass}`}>{row.status}</span>
                  </td>
                  <td>
                    <TableButton variant="view" onClick={() => openPatientModal(row.modal)}>
                      View
                    </TableButton>
                    <TableButton onClick={() => showToast("Opening message...")}>Message</TableButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-pager">
          <span>Showing {rows.length} of 142 patients</span>
          <div style={{ display: "flex", gap: 6 }}>
            <TableButton>← Prev</TableButton>
            <TableButton variant="view">1</TableButton>
            <TableButton>2</TableButton>
            <TableButton>3</TableButton>
            <TableButton>Next →</TableButton>
          </div>
        </div>
      </DashCard>
    </>
  );
}
