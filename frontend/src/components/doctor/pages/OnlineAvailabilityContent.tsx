"use client";

import { useEffect, useMemo, useState } from "react";
import type { DoctorIconComponent } from "@/components/doctor/icons/DoctorIcons";
import {
  Calendar,
  CalendarClock,
  CircleX,
  Clock3,
  DoctorIcon,
  DoctorIconInline,
  MessageSquare,
  Phone,
  PhysicianDashboardLabel,
  Save,
  Stethoscope,
  Video,
} from "@/components/doctor/icons/DoctorIcons";
import { DashCard, DashPageHeader } from "@/components/doctor/ui/DoctorPrimitives";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  useDoctorSchedules,
  useUpdateDoctorSchedules,
  type OnlineScheduleConfig,
} from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const DEFAULT_ONLINE_SCHEDULE: OnlineScheduleConfig = {
  days: { Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false },
  start: "10:00",
  end: "18:00",
  slotMinutes: 30,
  breakStart: "13:30",
  breakEnd: "14:30",
  holidays: [],
  types: {
    video: { on: true, fee: 120 },
    audio: { on: true, fee: 90 },
    chat: { on: true, fee: 60 },
  },
};

const TYPE_META: Array<{ key: "video" | "audio" | "chat"; icon: DoctorIconComponent; label: string; hint: string }> = [
  { key: "video", icon: Video, label: "Video Consultation", hint: "HD video call" },
  { key: "audio", icon: Phone, label: "Voice Consultation", hint: "Voice call" },
  { key: "chat", icon: MessageSquare, label: "Chat Consultation", hint: "Async · 24h response" },
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function slotsPreview(config: OnlineScheduleConfig): string[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const out: string[] = [];
  let cur = toMin(config.start);
  const end = toMin(config.end);
  const step = config.slotMinutes || 30;
  const b1 = toMin(config.breakStart);
  const b2 = toMin(config.breakEnd);
  while (cur + step <= end && out.length < 40) {
    if (!(cur >= b1 && cur < b2)) {
      const h = Math.floor(cur / 60);
      const m = cur % 60;
      const ap = h >= 12 ? "PM" : "AM";
      const hh = h % 12 || 12;
      out.push(`${hh}:${pad(m)} ${ap}`);
    }
    cur += step;
  }
  return out;
}

function holidayDisplay(h: { date: string; label?: string }): string {
  const dt = new Date(`${h.date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return h.label ? `${dt} — ${h.label}` : dt;
}

export function OnlineAvailabilityContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const { data: schedules, isLoading } = useDoctorSchedules();
  const updateSchedules = useUpdateDoctorSchedules();

  const [config, setConfig] = useState<OnlineScheduleConfig>(DEFAULT_ONLINE_SCHEDULE);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayLabel, setNewHolidayLabel] = useState("");

  useEffect(() => {
    if (schedules?.onlineSchedule) {
      setConfig({
        ...DEFAULT_ONLINE_SCHEDULE,
        ...schedules.onlineSchedule,
        types: { ...DEFAULT_ONLINE_SCHEDULE.types, ...schedules.onlineSchedule.types },
      });
    }
  }, [schedules?.onlineSchedule]);

  const slots = useMemo(() => slotsPreview(config), [config]);

  const save = (next?: OnlineScheduleConfig) => {
    const payload = next ?? config;
    updateSchedules.mutate(
      { onlineSchedule: payload },
      {
        onSuccess: () => showToast("💾 Availability saved — booking page updated"),
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to save availability"),
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
        <DashPageHeader
          subtitle={<PhysicianDashboardLabel />}
          title="Online Consultation Availability"
          dateStr={todayFormatted()}
        />
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
        title="Online Consultation Availability"
        dateStr={todayFormatted()}
        actions={
          <button type="button" className="btn-w" disabled={updateSchedules.isPending} onClick={() => save()}>
            <DoctorIconInline icon={Save} size="sm">
              Save Availability
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
            <label>Available From</label>
            <input type="time" value={config.start} onChange={(e) => setConfig({ ...config, start: e.target.value })} />
          </div>
          <div className="form-group cs-field-w">
            <label>Available Until</label>
            <input type="time" value={config.end} onChange={(e) => setConfig({ ...config, end: e.target.value })} />
          </div>
        </div>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={CalendarClock} size="button">Consultation Slot Duration</DoctorIconInline>}>
        <div className="form-group cs-field-w">
          <label>Minutes per consultation</label>
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
              placeholder="e.g. Conference — offline"
            />
          </div>
        </div>
        <button type="button" className="btn-w" style={{ marginTop: 12 }} onClick={addHoliday}>
          + Add Date
        </button>
      </DashCard>

      <DashCard title={<DoctorIconInline icon={Stethoscope} size="button">Consultation Types Offered & Fees</DoctorIconInline>}>
        <div className="oa-type-list">
          {TYPE_META.map((t) => {
            const v = config.types[t.key];
            return (
              <div key={t.key} className="oa-type-row">
                <label className="oa-type-toggle">
                  <span className="oa-type-toggle-text">
                    <DoctorIcon icon={t.icon} size="sm" />
                    {t.label}
                  </span>
                  <input
                    type="checkbox"
                    className="oa-type-toggle-check"
                    checked={v.on}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        types: { ...config.types, [t.key]: { ...v, on: e.target.checked } },
                      })
                    }
                  />
                </label>
                <div className="oa-type-fee">
                  <label htmlFor={`oa-fee-${t.key}`}>Fee (USD)</label>
                  <input
                    id={`oa-fee-${t.key}`}
                    type="number"
                    min={0}
                    value={v.fee}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        types: { ...config.types, [t.key]: { ...v, fee: Number(e.target.value) || 0 } },
                      })
                    }
                  />
                </div>
                <span className="oa-type-hint">{t.hint}</span>
              </div>
            );
          })}
        </div>
      </DashCard>

      <DashCard
        title={
          <DoctorIconInline icon={Clock3} size="button">
            Available Slots Preview{" "}
            <span style={{ fontWeight: 500, fontSize: ".72rem", color: "var(--gray-400)" }}>
              — what patients see on the booking page
            </span>
          </DoctorIconInline>
        }
      >
        <div className="oa-slot-preview">
          {slots.map((s) => (
            <span key={s} className="oa-slot-chip">
              {s}
            </span>
          ))}
        </div>
      </DashCard>
    </div>
  );
}
