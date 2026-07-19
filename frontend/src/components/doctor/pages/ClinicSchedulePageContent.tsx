"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  CircleX,
  Clock3,
  DoctorIcon,
  DoctorIconInline,
  FileText,
  Globe,
  PhysicianDashboardLabel,
  Save,
  Zap,
} from "@/components/doctor/icons/DoctorIcons";
import { DashCard, DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  useDoctorAppointments,
  useDoctorSchedules,
  useUpdateDoctorSchedules,
  type ClinicScheduleConfig,
} from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DEFAULT_CLINIC_SCHEDULE: ClinicScheduleConfig = {
  days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: true, Sun: false },
  start: "09:00",
  end: "17:00",
  slotMinutes: 30,
  breakStart: "13:00",
  breakEnd: "14:00",
  dailyCapacity: 30,
  capacityOverride: false,
  holidays: [],
};

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function holidayDisplay(h: { date: string; label?: string }): string {
  const dt = new Date(`${h.date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return h.label ? `${dt} — ${h.label}` : dt;
}

export function ClinicSchedulePageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const { data: schedules, isLoading } = useDoctorSchedules();
  const updateSchedules = useUpdateDoctorSchedules();

  const [config, setConfig] = useState<ClinicScheduleConfig>(DEFAULT_CLINIC_SCHEDULE);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayLabel, setNewHolidayLabel] = useState("");
  const [capDate, setCapDate] = useState(todayInput());

  useEffect(() => {
    if (schedules?.clinicSchedule) {
      setConfig({ ...DEFAULT_CLINIC_SCHEDULE, ...schedules.clinicSchedule });
    }
  }, [schedules?.clinicSchedule]);

  const apptsQuery = useDoctorAppointments({ kind: "PHYSICAL", limit: 100, range: "upcoming" });

  const capacityStats = useMemo(() => {
    const data = apptsQuery.data?.data ?? [];
    const onDate = data.filter((a) => {
      if (a.status !== "CONFIRMED" && a.status !== "PENDING" && a.status !== "IN_PROGRESS") return false;
      const d = new Date(a.scheduledAt);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` === capDate;
    });
    const manual = onDate.filter((a) => a.bookingSource && a.bookingSource !== "ONLINE").length;
    const web = onDate.length - manual;
    return { web, manual, total: onDate.length };
  }, [apptsQuery.data, capDate]);

  const remaining = Math.max(config.dailyCapacity - capacityStats.total, 0);
  const capBar = Math.min(Math.round((capacityStats.total / Math.max(config.dailyCapacity, 1)) * 100), 100);

  const save = (next?: ClinicScheduleConfig) => {
    const payload = next ?? config;
    updateSchedules.mutate(
      { clinicSchedule: payload },
      {
        onSuccess: () => showToast("💾 Clinic schedule saved — patients will see updated availability"),
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to save schedule"),
      },
    );
  };

  const addHoliday = () => {
    if (!newHolidayDate) {
      showToast("⚠️ Pick a date first");
      return;
    }
    const next = {
      ...config,
      holidays: [...config.holidays, { date: newHolidayDate, label: newHolidayLabel.trim() || undefined }],
    };
    setConfig(next);
    setNewHolidayDate("");
    setNewHolidayLabel("");
    save(next);
    showToast("🚫 Unavailable date added");
  };

  const removeHoliday = (index: number) => {
    const next = { ...config, holidays: config.holidays.filter((_, i) => i !== index) };
    setConfig(next);
    save(next);
    showToast("Date removed");
  };

  if (isLoading) {
    return (
      <>
        <DashPageHeader subtitle={<PhysicianDashboardLabel />} title="Clinic Schedule" dateStr={todayFormatted()} />
        <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
          Loading...
        </div>
      </>
    );
  }

  return (
    <div className="cs-form">
      <DashPageHeader
        subtitle={<PhysicianDashboardLabel />}
        title="Clinic Schedule"
        dateStr={todayFormatted()}
        actions={
          <button type="button" className="btn-w" disabled={updateSchedules.isPending} onClick={() => save()}>
            <DoctorIconInline icon={Save} size="sm">
              Save Schedule
            </DoctorIconInline>
          </button>
        }
      />

      <DashCard title={<DoctorIconInline icon={Calendar} size="button">Working Days</DoctorIconInline>}>
        <div className="cs-day-row">
          {DAY_KEYS.map((d) => (
            <label key={d} className="cs-day-check">
              <input
                type="checkbox"
                checked={config.days[d] !== false}
                onChange={(e) => setConfig({ ...config, days: { ...config.days, [d]: e.target.checked } })}
              />{" "}
              {d}
            </label>
          ))}
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={Clock3} size="button">Working Hours</DoctorIconInline>}>
        <div className="cs-compact-row">
          <div className="form-group cs-field-w">
            <label>Clinic Opens</label>
            <input type="time" value={config.start} onChange={(e) => setConfig({ ...config, start: e.target.value })} />
          </div>
          <div className="form-group cs-field-w">
            <label>Clinic Closes</label>
            <input type="time" value={config.end} onChange={(e) => setConfig({ ...config, end: e.target.value })} />
          </div>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={CalendarClock} size="button">Appointment Slot Duration</DoctorIconInline>}>
        <div className="form-group" style={{ maxWidth: 260 }}>
          <label>Minutes per appointment</label>
          <select
            value={String(config.slotMinutes)}
            onChange={(e) => setConfig({ ...config, slotMinutes: Number(e.target.value) })}
          >
            {[15, 20, 30, 45, 60].map((v) => (
              <option key={v} value={v}>
                {v} minutes
              </option>
            ))}
          </select>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={Clock3} size="button">Break Time</DoctorIconInline>}>
        <div className="cs-compact-row">
          <div className="form-group cs-field-w">
            <label>Break Starts</label>
            <input
              type="time"
              value={config.breakStart}
              onChange={(e) => setConfig({ ...config, breakStart: e.target.value })}
            />
          </div>
          <div className="form-group cs-field-w">
            <label>Break Ends</label>
            <input
              type="time"
              value={config.breakEnd}
              onChange={(e) => setConfig({ ...config, breakEnd: e.target.value })}
            />
          </div>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={CircleX} size="button">Holidays / Unavailable Dates</DoctorIconInline>}>
        <div>
          {config.holidays.length === 0 ? (
            <div style={{ fontSize: ".8rem", color: "var(--gray-400)", padding: "6px 0" }}>
              No unavailable dates added yet.
            </div>
          ) : (
            config.holidays.map((h, i) => (
              <div
                key={`${h.date}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 0",
                  borderBottom: "1px solid var(--gray-100)",
                  fontSize: ".84rem",
                }}
              >
                <span>
                  <DoctorIconInline icon={Calendar} size="sm">
                    {holidayDisplay(h)}
                  </DoctorIconInline>
                </span>
                <button type="button" className="tbl-btn" onClick={() => removeHoliday(i)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div className="cs-compact-row" style={{ marginTop: 14 }}>
          <div className="form-group cs-field-w">
            <label>Add Unavailable Date</label>
            <input type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Label</label>
            <input
              type="text"
              value={newHolidayLabel}
              onChange={(e) => setNewHolidayLabel(e.target.value)}
              placeholder="e.g. Conference — Out of clinic"
            />
          </div>
        </div>
        <button type="button" className="btn-w" style={{ marginTop: 12 }} onClick={addHoliday}>
          + Add Date
        </button>
      </DashCard>

      <DashCard
        title={
          <DoctorIconInline icon={Zap} size="button">
            Daily Appointment Capacity{" "}
            <span style={{ fontWeight: 500, fontSize: ".72rem", color: "var(--gray-400)" }}>
              — shared between website bookings &amp; manual appointments
            </span>
          </DoctorIconInline>
        }
      >
        <div className="form-row cs-capacity-row">
          <div className="form-group cs-field-w">
            <label>Daily Capacity</label>
            <input
              type="number"
              min={1}
              value={config.dailyCapacity}
              onChange={(e) => setConfig({ ...config, dailyCapacity: Math.max(1, Number(e.target.value) || 30) })}
            />
          </div>
          <div className="form-group cs-field-w">
            <label>Capacity Date</label>
            <input type="date" value={capDate} onChange={(e) => setCapDate(e.target.value)} />
          </div>
          <div className="form-group cs-field-w-override cs-capacity-override-wrap">
            <label className="cs-capacity-override-spacer" aria-hidden="true">
              &nbsp;
            </label>
            <label className="cs-capacity-override">
              <span className="cs-capacity-override-text">
                <DoctorIcon icon={AlertTriangle} size="sm" tone="amber" label="Warning" />
                Override Capacity
              </span>
              <input
                type="checkbox"
                className="cs-capacity-override-check"
                checked={!!config.capacityOverride}
                onChange={(e) => setConfig({ ...config, capacityOverride: e.target.checked })}
              />
            </label>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            fontSize: ".8rem",
            fontWeight: 600,
            color: "var(--gray-600)",
            marginTop: 6,
          }}
        >
          <span>
            <DoctorIconInline icon={Globe} size="sm">
              Website Bookings: <b style={{ color: "var(--blue)" }}>{capacityStats.web}</b>
            </DoctorIconInline>
          </span>
          <span>
            <DoctorIconInline icon={FileText} size="sm">
              Manual Appointments: <b style={{ color: "var(--blue)" }}>{capacityStats.manual}</b>
            </DoctorIconInline>
          </span>
          <span>
            Σ Total:{" "}
            <b>
              {capacityStats.total} / {config.dailyCapacity}
            </b>
          </span>
          <span>
            {remaining > 0 ? (
              <>
                <span style={{ color: "var(--green,#059669)" }}>
                  Remaining: <b style={{ color: "var(--green,#059669)" }}>{remaining}</b>
                </span>
              </>
            ) : (
              <>
                <DoctorIconInline icon={CircleX} size="sm">
                  <b style={{ color: "var(--red,#dc2626)" }}>Daily appointment limit has been reached.</b>
                </DoctorIconInline>
                {config.capacityOverride ? <span style={{ color: "var(--gray-400)" }}> (override ON)</span> : null}
              </>
            )}
          </span>
        </div>
        <div style={{ height: 10, borderRadius: 50, background: "var(--gray-100)", marginTop: 10, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${capBar}%`,
              borderRadius: 50,
              background:
                capacityStats.total >= config.dailyCapacity
                  ? "var(--red,#dc2626)"
                  : "linear-gradient(90deg,var(--blue-dark),var(--blue))",
            }}
          />
        </div>
      </DashCard>
    </div>
  );
}
