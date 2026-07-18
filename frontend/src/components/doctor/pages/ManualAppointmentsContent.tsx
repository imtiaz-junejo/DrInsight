"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ConsModal, ConsModalButton } from "@/components/doctor/ui/ConsModal";
import { DashCard, DashPageHeader, PersonAvatar } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate, getInitials } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  useCreateManualAppointment,
  useDoctorAppointments,
  useDoctorPatients,
  useDoctorSchedules,
  useRescheduleAppointment,
  useUpdateAppointmentStatus,
  type ClinicScheduleConfig,
  type DoctorPatient,
} from "@/services/doctor-api-hooks";
import type { Appointment } from "@/services/api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function todayInput(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Generates bookable time slots (as HH:mm) from the clinic schedule, skipping the break window. */
function slotTimes(schedule: ClinicScheduleConfig | null | undefined, dateStr: string): string[] {
  if (dateStr && schedule?.days) {
    const dayKey = new Date(`${dateStr}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
    if (schedule.days[dayKey] === false) return [];
    const holiday = schedule.holidays?.some((h) => h.date === dateStr);
    if (holiday) return [];
  }
  const start = schedule?.start ?? "09:00";
  const end = schedule?.end ?? "17:00";
  const breakStart = schedule?.breakStart ?? "13:00";
  const breakEnd = schedule?.breakEnd ?? "14:00";
  const step = schedule?.slotMinutes ?? 30;

  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const out: string[] = [];
  let cur = toMin(start);
  const endMin = toMin(end);
  const b1 = toMin(breakStart);
  const b2 = toMin(breakEnd);
  while (cur + step <= endMin && out.length < 60) {
    if (!(cur >= b1 && cur < b2)) out.push(`${pad(Math.floor(cur / 60))}:${pad(cur % 60)}`);
    cur += step;
  }
  return out;
}

function slotLabel(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${pad(m)} ${ap}`;
}

function apptTime(appt: Appointment): string {
  return new Date(appt.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function patientName(appt: Appointment): string {
  return `${appt.patient?.user?.firstName ?? ""} ${appt.patient?.user?.lastName ?? ""}`.trim() || "Patient";
}

function sourceLabel(source?: string): string {
  return source === "PHONE" ? "Phone" : "Walk-in";
}

function maChip(appt: Appointment) {
  if (appt.status === "CONFIRMED") return <span className="sch-chip sc-up">✅ Confirmed</span>;
  if (appt.status === "COMPLETED") return <span className="sch-chip sc-done">✓ Completed</span>;
  return (
    <span className="sch-chip" style={{ background: "var(--gray-100)", color: "var(--gray-600)" }}>
      ✕ Cancelled
    </span>
  );
}

type ModalState =
  | { kind: "edit"; appt: Appointment }
  | { kind: "cancel"; appt: Appointment }
  | { kind: "details"; appt: Appointment }
  | null;

export function ManualAppointmentsContent() {
  const router = useRouter();
  const showToast = useDoctorUiStore((s) => s.showToast);

  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [search, setSearch] = useState("");
  const [selPatient, setSelPatient] = useState<DoctorPatient | null>(null);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newGender, setNewGender] = useState("Male");
  const [newAge, setNewAge] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const [date, setDate] = useState(todayInput());
  const [time, setTime] = useState("");
  const [source, setSource] = useState<"WALK_IN" | "PHONE">("WALK_IN");
  const [reason, setReason] = useState("");

  const [modal, setModal] = useState<ModalState>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [cancelWhy, setCancelWhy] = useState("");

  const { data: patients } = useDoctorPatients();
  const { data: schedules } = useDoctorSchedules();
  const listQuery = useDoctorAppointments({ kind: "PHYSICAL", manualOnly: true, limit: 50 });
  const createManual = useCreateManualAppointment();
  const updateStatus = useUpdateAppointmentStatus();
  const reschedule = useRescheduleAppointment();

  const clinicSchedule = schedules?.clinicSchedule ?? null;
  const slots = useMemo(() => slotTimes(clinicSchedule, date), [clinicSchedule, date]);
  const editSlots = useMemo(() => slotTimes(clinicSchedule, editDate), [clinicSchedule, editDate]);

  const list = listQuery.data?.data ?? [];
  const counts = useMemo(() => {
    const today = todayInput();
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;
    let todayCount = 0;
    for (const a of list) {
      if (a.status === "CONFIRMED") {
        confirmed++;
        const d = new Date(a.scheduledAt);
        if (`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` === today) todayCount++;
      } else if (a.status === "COMPLETED") completed++;
      else if (a.status === "CANCELLED") cancelled++;
    }
    return { confirmed, completed, cancelled, today: todayCount };
  }, [list]);

  const doSearch = () => {
    const q = search.trim().toLowerCase();
    if (!q) {
      showToast("⚠️ Enter a Patient ID, mobile number, or name");
      return;
    }
    const norm = (s: string) => s.replace(/[\s-]/g, "").toLowerCase();
    const found = (patients ?? []).find((p) => {
      const name = `${p.user.firstName} ${p.user.lastName}`.toLowerCase();
      return (
        p.patientNumber?.toLowerCase() === q ||
        name.includes(q) ||
        (p.patientNumber ? norm(p.patientNumber).includes(norm(q)) : false)
      );
    });
    if (found) {
      setSelPatient(found);
      setSearchMsg(null);
      showToast("✅ Patient found — details auto-filled");
    } else {
      setSelPatient(null);
      setSearchMsg(`No registered patient matched “${search.trim()}” — use the ➕ New Patient tab to create one.`);
    }
  };

  const resetForm = () => {
    setSelPatient(null);
    setSearch("");
    setSearchMsg(null);
    setNewName("");
    setNewMobile("");
    setNewAge("");
    setNewAddress("");
    setReason("");
    setTime("");
  };

  const doSave = () => {
    if (mode === "existing" && !selPatient) {
      showToast("⚠️ Search and select a patient first");
      return;
    }
    if (mode === "new" && (!newName.trim() || !newMobile.trim() || !newAge.trim())) {
      showToast("⚠️ Full Name, Mobile Number and Age are required");
      return;
    }
    if (!date || !time) {
      showToast("⚠️ Pick an appointment date and time");
      return;
    }
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    createManual.mutate(
      {
        ...(mode === "existing"
          ? { patientId: selPatient!.patientId }
          : {
              newPatient: {
                name: newName.trim(),
                phone: newMobile.trim(),
                gender: newGender,
                age: Number(newAge) || undefined,
                ...(newAddress.trim() ? { address: newAddress.trim() } : {}),
              },
            }),
        scheduledAt,
        durationMinutes: clinicSchedule?.slotMinutes ?? 30,
        bookingSource: source,
        reason: reason.trim() || "Manual booking",
      },
      {
        onSuccess: () => {
          setFormOpen(false);
          resetForm();
          showToast("✅ Manual appointment saved — visible in Today's / Upcoming Appointments");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to save appointment"),
      },
    );
  };

  const closeModal = () => {
    setModal(null);
    setCancelWhy("");
  };

  const openEdit = (appt: Appointment) => {
    const d = new Date(appt.scheduledAt);
    setEditDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    setEditTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
    setModal({ kind: "edit", appt });
  };

  const doEdit = () => {
    if (!modal || modal.kind !== "edit") return;
    if (!editDate || !editTime) {
      showToast("⚠️ Pick date and time");
      return;
    }
    reschedule.mutate(
      { id: modal.appt.id, scheduledAt: new Date(`${editDate}T${editTime}:00`).toISOString() },
      {
        onSuccess: () => {
          closeModal();
          showToast("🗓️ Rescheduled — patient dashboard updated");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to reschedule"),
      },
    );
  };

  const doCancel = () => {
    if (!modal || modal.kind !== "cancel") return;
    updateStatus.mutate(
      { id: modal.appt.id, status: "CANCELLED", cancelReason: cancelWhy.trim() || "Cancelled by doctor" },
      {
        onSuccess: () => {
          closeModal();
          showToast("❌ Appointment cancelled — patient notified");
        },
        onError: (err) => showToast(err instanceof Error ? err.message : "Failed to cancel"),
      },
    );
  };

  const doComplete = (appt: Appointment) => {
    updateStatus.mutate(
      { id: appt.id, status: "COMPLETED" },
      { onSuccess: () => showToast("🏁 Marked completed — patient dashboard updated") },
    );
  };

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title="Manual Appointments"
        dateStr={todayFormatted()}
        actions={
          <>
            <button type="button" className="btn-w" onClick={() => setFormOpen((v) => !v)}>
              {formOpen ? "✕ Close Form" : "+ New Manual Appointment"}
            </button>
            <button
              type="button"
              className="btn-w"
              style={{ marginLeft: 8 }}
              onClick={() => router.push("/doctor/clinic-schedule")}
            >
              🎯 Daily Capacity
            </button>
          </>
        }
      />

      {formOpen ? (
        <DashCard
          title={
            <>
              📝 Create Manual Appointment{" "}
              <span style={{ fontWeight: 500, fontSize: ".72rem", color: "var(--gray-400)" }}>
                — walk-in · phone · clinic visit
              </span>
            </>
          }
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              className={`ca-btn ${mode === "existing" ? "primary" : ""}`}
              onClick={() => {
                setMode("existing");
                setSelPatient(null);
              }}
            >
              🔎 Existing Patient
            </button>
            <button
              type="button"
              className={`ca-btn ${mode === "new" ? "primary" : ""}`}
              onClick={() => {
                setMode("new");
                setSelPatient(null);
              }}
            >
              ➕ New Patient
            </button>
          </div>

          {mode === "existing" ? (
            <>
              <div className="form-row" style={{ alignItems: "flex-end" }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Search by Patient ID / Name</label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") doSearch();
                    }}
                    placeholder="e.g. PT-1001 or Sarah"
                  />
                </div>
                <div className="form-group" style={{ maxWidth: 140 }}>
                  <label style={{ visibility: "hidden" }}>s</label>
                  <button type="button" className="btn-w" style={{ width: "100%" }} onClick={doSearch}>
                    🔎 Search
                  </button>
                </div>
              </div>
              {selPatient ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    border: "1.5px solid var(--blue-mid,#bfdbfe)",
                    background: "var(--blue-light)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    flexWrap: "wrap",
                  }}
                >
                  <PersonAvatar
                    initials={getInitials(selPatient.user.firstName, selPatient.user.lastName)}
                    seed={selPatient.patientId}
                  />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: ".9rem" }}>
                      {selPatient.user.firstName} {selPatient.user.lastName}{" "}
                      <span className="cons-chip cc-done" style={{ marginLeft: 6 }}>
                        ✓ Registered
                      </span>
                    </div>
                    <div style={{ fontSize: ".76rem", color: "var(--gray-500)" }}>
                      🆔 {selPatient.patientNumber ?? selPatient.patientId.slice(-6).toUpperCase()}
                      {selPatient.gender ? ` · ${selPatient.gender}` : ""}
                      {selPatient.age ? ` · ${selPatient.age} yrs` : ""}
                    </div>
                  </div>
                  <button type="button" className="ca-btn" onClick={() => setSelPatient(null)}>
                    ✕ Change
                  </button>
                </div>
              ) : searchMsg ? (
                <div style={{ fontSize: ".8rem", color: "var(--red,#dc2626)", fontWeight: 600 }}>{searchMsg}</div>
              ) : (
                <div style={{ fontSize: ".78rem", color: "var(--gray-400)" }}>
                  Search the registry to auto-fill patient details.
                </div>
              )}
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Patient full name" />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input type="text" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} placeholder="+92 3xx xxxxxxx" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender *</label>
                  <select value={newGender} onChange={(e) => setNewGender(e.target.value)}>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Age *</label>
                  <input type="number" min={0} value={newAge} onChange={(e) => setNewAge(e.target.value)} placeholder="Years" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Address <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>(optional)</span>
                  </label>
                  <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Area, City" />
                </div>
              </div>
              <div style={{ fontSize: ".74rem", color: "var(--gray-400)" }}>
                ℹ️ New patients are saved without a portal account — the appointment won&rsquo;t appear on a Patient
                Dashboard until they register.
              </div>
            </>
          )}

          <div
            style={{
              borderTop: "1px solid var(--gray-100)",
              margin: "18px 0 14px",
              paddingTop: 14,
              fontSize: ".8rem",
              fontWeight: 700,
              color: "var(--gray-800)",
            }}
          >
            📅 Appointment Information
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Appointment Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime("");
                }}
              />
            </div>
            <div className="form-group">
              <label>Appointment Time *</label>
              <select value={time} onChange={(e) => setTime(e.target.value)}>
                <option value="">Select a slot...</option>
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {slotLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Booking Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value as "WALK_IN" | "PHONE")}>
                <option value="WALK_IN">Walk-in</option>
                <option value="PHONE">Phone</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>
                Reason for Visit <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. BP check, follow-up, emergency triage"
              />
            </div>
          </div>
          <div style={{ fontSize: ".72rem", color: "var(--gray-400)", marginBottom: 12 }}>
            ✔️ Validated against working days, hours, break time and existing bookings — the same rules as website
            bookings. Manual appointments are auto-<b>Confirmed</b> (no approval needed).
          </div>
          <button type="button" className="btn-w" disabled={createManual.isPending} onClick={doSave}>
            💾 Save Manual Appointment
          </button>
        </DashCard>
      ) : null}

      <DashCard
        title={
          <>
            📝 Manual Appointments{" "}
            <span style={{ fontWeight: 500, fontSize: ".72rem", color: "var(--gray-400)" }}>
              — {counts.confirmed} confirmed · {counts.today} today · {counts.completed} completed · {counts.cancelled}{" "}
              cancelled
            </span>
          </>
        }
      >
        <div style={{ overflowX: "auto" }}>
          <table className="pt-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Mobile</th>
                <th>Date &amp; Time</th>
                <th>Reason / Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listQuery.isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    Loading...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--gray-400)", padding: 24 }}>
                    No manual appointments yet — click “+ New Manual Appointment”.
                  </td>
                </tr>
              ) : (
                list.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <strong>MA-{appt.id.slice(-4).toUpperCase()}</strong>
                      <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{sourceLabel(appt.bookingSource)}</div>
                    </td>
                    <td>
                      <strong>{patientName(appt)}</strong>{" "}
                      <span className="cons-chip cc-done" style={{ fontSize: ".6rem", padding: "2px 7px" }}>
                        ✓ Registered
                      </span>
                      {appt.patient?.gender ? (
                        <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{appt.patient.gender}</div>
                      ) : null}
                    </td>
                    <td>{appt.patient?.user?.phone ?? "—"}</td>
                    <td>
                      {formatDate(appt.scheduledAt)}
                      <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{apptTime(appt)}</div>
                    </td>
                    <td style={{ fontSize: ".78rem", color: "var(--gray-500)" }}>
                      {appt.reason ?? "Manual booking"}
                      {appt.cancelReason ? (
                        <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>❌ {appt.cancelReason}</div>
                      ) : null}
                    </td>
                    <td>{maChip(appt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {appt.status === "CONFIRMED" ? (
                          <>
                            <button type="button" className="tbl-btn view" onClick={() => openEdit(appt)}>
                              ✏️ Edit / Reschedule
                            </button>
                            <button type="button" className="tbl-btn" disabled={updateStatus.isPending} onClick={() => doComplete(appt)}>
                              🏁 Complete
                            </button>
                            <button type="button" className="tbl-btn" onClick={() => setModal({ kind: "cancel", appt })}>
                              ✕ Cancel
                            </button>
                            <button type="button" className="tbl-btn" onClick={() => setModal({ kind: "details", appt })}>
                              👁
                            </button>
                          </>
                        ) : (
                          <button type="button" className="tbl-btn" onClick={() => setModal({ kind: "details", appt })}>
                            👁 Details
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashCard>

      <ConsModal
        open={modal?.kind === "edit"}
        icon="✏️"
        title={`Edit / Reschedule — MA-${modal ? modal.appt.id.slice(-4).toUpperCase() : ""}`}
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Back
            </ConsModalButton>
            <ConsModalButton variant="blue" onClick={doEdit} disabled={reschedule.isPending}>
              💾 Save Changes
            </ConsModalButton>
          </>
        }
      >
        {modal?.kind === "edit" ? (
          <>
            <p>
              <b>{patientName(modal.appt)}</b>
              {modal.appt.patient?.user?.phone ? ` · ${modal.appt.patient.user.phone}` : ""}
            </p>
            <div className="oc-grid2">
              <div className="oc-field">
                <label>Appointment Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => {
                    setEditDate(e.target.value);
                    setEditTime("");
                  }}
                />
              </div>
              <div className="oc-field">
                <label>Appointment Time</label>
                <select value={editTime} onChange={(e) => setEditTime(e.target.value)}>
                  <option value="">Select a slot...</option>
                  {editSlots.map((s) => (
                    <option key={s} value={s}>
                      {slotLabel(s)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : null}
      </ConsModal>

      <ConsModal
        open={modal?.kind === "cancel"}
        icon="⚠️"
        title="Cancel Manual Appointment"
        warn
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Keep it
            </ConsModalButton>
            <ConsModalButton variant="red" onClick={doCancel} disabled={updateStatus.isPending}>
              ✕ Cancel Appointment
            </ConsModalButton>
          </>
        }
      >
        <p>
          Cancel <b>{modal ? patientName(modal.appt) : ""}</b>&rsquo;s appointment on{" "}
          {modal ? `${formatDate(modal.appt.scheduledAt)} · ${apptTime(modal.appt)}` : ""}?
        </p>
        <div style={{ marginTop: 12 }}>
          <label>Reason</label>
          <textarea
            value={cancelWhy}
            onChange={(e) => setCancelWhy(e.target.value)}
            placeholder="Reason (shared with registered patients)"
          />
        </div>
      </ConsModal>

      <ConsModal
        open={modal?.kind === "details"}
        icon="📋"
        title={`Manual Appointment — MA-${modal ? modal.appt.id.slice(-4).toUpperCase() : ""}`}
        onClose={closeModal}
        footer={
          <ConsModalButton variant="ghost" onClick={closeModal}>
            Close
          </ConsModalButton>
        }
      >
        {modal?.kind === "details" ? (
          <>
            <p>
              <b>{patientName(modal.appt)}</b>{" "}
              <span className="cons-chip cc-done">✓ Registered</span>
            </p>
            <p className="cons-sub">
              {modal.appt.patient?.gender ? `${modal.appt.patient.gender} · ` : ""}
              📱 {modal.appt.patient?.user?.phone ?? "—"}
            </p>
            <p className="cons-sub">
              📅 {formatDate(modal.appt.scheduledAt)} · ⏰ {apptTime(modal.appt)} · Source:{" "}
              {sourceLabel(modal.appt.bookingSource)}
            </p>
            <p className="cons-sub">
              📋 <b>Reason:</b> {modal.appt.reason ?? "Manual booking"}
              {modal.appt.cancelReason ? (
                <>
                  <br />❌ <b>Cancelled:</b> {modal.appt.cancelReason}
                </>
              ) : null}
            </p>
          </>
        ) : null}
      </ConsModal>
    </>
  );
}
