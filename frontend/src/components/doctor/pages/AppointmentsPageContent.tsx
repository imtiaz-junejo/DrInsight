"use client";

import {
  CardLink,
  DashCard,
  DashPageHeader,
  PersonAvatar,
} from "@/components/doctor/ui/DoctorPrimitives";
import { SCHEDULE_ITEMS } from "@/components/doctor/data/doctor-demo-data";
import { todayFormatted } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

export function AppointmentsPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);

  return (
    <>
      <DashPageHeader subtitle="👨‍⚕️ Physician Dashboard" title="Consultations" dateStr={todayFormatted()} />

      <DashCard title="📅 Today's Appointments" actions={<CardLink onClick={() => showToast("Opening calendar...")}>Full Calendar →</CardLink>}>
        {SCHEDULE_ITEMS.map((item) => (
          <div key={item.time + item.name} className="sch-item">
            <div className="sch-time">{item.time}</div>
            <PersonAvatar initials={item.initials} className="sch-av" style={{ background: item.avatarBg }} seed={item.name} />
            <div className="sch-info">
              <div className="sch-name">{item.name}</div>
              <div className="sch-sub">{item.sub}</div>
            </div>
            <span className={`sch-chip ${item.chip}`}>{item.chipLabel}</span>
            <button
              type="button"
              className={`sch-btn${item.live ? " go" : ""}`}
              onClick={() => showToast(item.live ? "Joining call..." : "Preparing...")}
            >
              {item.live ? "Join →" : "Prep"}
            </button>
          </div>
        ))}
      </DashCard>

      <DashCard title="✅ Past Consultations">
        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Sara Malik", "📹 Video", "May 10, 2026", "30 min", "BP controlled, continue meds"],
                ["Muhammad Hassan", "📞 Phone", "Apr 28, 2026", "20 min", "Echo results reviewed"],
                ["Fatima Khan", "🏥 In-Person", "Mar 30, 2026", "45 min", "HbA1c follow-up, adjusted Metformin"],
                ["Imran Ali", "📹 Video", "Mar 12, 2026", "30 min", "Diuretic dose increased"],
              ].map(([patient, type, date, duration, notes]) => (
                <tr key={patient + date}>
                  <td>
                    <strong>{patient}</strong>
                  </td>
                  <td>
                    <span className="cons-chip cc-up">{type}</span>
                  </td>
                  <td>{date}</td>
                  <td>{duration}</td>
                  <td>
                    <span className="st-chip st-active">✓ Completed</span>
                  </td>
                  <td style={{ fontSize: "0.78rem", color: "var(--gray-500)" }}>{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DashCard>
    </>
  );
}
