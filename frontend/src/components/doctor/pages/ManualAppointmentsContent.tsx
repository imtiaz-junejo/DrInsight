"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  Calendar,
  CalendarClock,
  CircleX,
  ClipboardPlus,
  DoctorIcon,
  DoctorIconInline,
  Eye,
  FileText,
  Pencil,
  PhysicianDashboardLabel,
  Plus,
  Save,
  Search,
  X,
  Zap,
} from "@/components/doctor/icons/DoctorIcons";
import { ConsModal, ConsModalButton } from "@/components/doctor/ui/ConsModal";
import { DashCard, DashPageHeader, PersonAvatar } from "@/components/doctor/ui/DoctorPrimitives";
import { formatDate, getInitials } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/doctor-utils";
import {
  useCreateManualAppointment,
  useDoctorAppointmentDetail,
  useDoctorAppointments,
  useDoctorPatients,
  useDoctorProfile,
  useDoctorSchedules,
  useRescheduleAppointment,
  useUpdateAppointmentStatus,
  type ClinicScheduleConfig,
  type DoctorAppointmentDetail,
  type DoctorPatient,
} from "@/services/doctor-api-hooks";
import type { Appointment } from "@/services/api-hooks.types";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import {
  apptTime,
  normSearchValue,
  pad,
  patientAge,
  patientName,
  slotLabel,
  slotTimes,
  sourceLabel,
  todayInput,
} from "@/components/doctor/pages/manual-appointments-utils";

function isRegisteredPatient(appt: DoctorAppointmentDetail | Appointment): boolean {
  const email = (appt.patient?.user as { email?: string } | undefined)?.email ?? "";
  return Boolean(email && !email.includes("@manual.drinsight.local"));
}

function auditStamp(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

function buildMaAuditEntries(appt: DoctorAppointmentDetail, doctorName: string) {
  const who = `${doctorName} (Doctor)`;
  const entries: Array<{ action: string; at: string; who: string }> = [];

  if (appt.status === "COMPLETED") {
    entries.push({
      action: "Appointment marked as Completed",
      at: appt.updatedAt ?? appt.scheduledAt,
      who,
    });
  }
  if (appt.status === "CANCELLED" && appt.cancelledAt) {
    entries.push({
      action: `Appointment cancelled — ${appt.cancelReason || "no reason given"}`,
      at: appt.cancelledAt,
      who,
    });
  }
  if (appt.createdAt) {
    entries.push({
      action: `Manual appointment created (${sourceLabel(appt.bookingSource)} booking) — auto-confirmed`,
      at: appt.createdAt,
      who,
    });
  }
  for (const log of appt.auditLogs ?? []) {
    entries.push({ action: log.action, at: log.createdAt, who: log.actorName });
  }

  return entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

function maDemographicsLine(appt: DoctorAppointmentDetail): string {
  const parts: string[] = [];
  if (appt.patient?.gender) parts.push(appt.patient.gender);
  const age = patientAge(appt.patient?.dateOfBirth);
  if (age != null) parts.push(`${age} yrs`);
  const phone = appt.patient?.user?.phone;
  if (phone) parts.push(`📱 ${phone}`);
  const patientId = appt.patient?.patientNumber;
  if (patientId) parts.push(`🪪 ${patientId}`);
  const address = appt.patient?.address;
  if (address) parts.push(`🏠 ${address}`);
  return parts.join(" · ");
}

function ManualAppointmentDetailsBody({
  appt,
  clinicLabel,
  doctorName,
  loading,
}: {
  appt: DoctorAppointmentDetail;
  clinicLabel: string;
  doctorName: string;
  loading: boolean;
}) {
  const registered = isRegisteredPatient(appt);
  const auditEntries = buildMaAuditEntries(appt, doctorName);
  const demographics = maDemographicsLine(appt);

  return (
    <>
      <p>
        <b>{patientName(appt)}</b>{" "}
        {registered ? (
          <span className="cons-chip cc-done">✓ Registered</span>
        ) : (
          <span className="cons-chip cc-pending">No account</span>
        )}
      </p>
      {demographics ? <p className="cons-sub">{demographics}</p> : null}
      <p className="cons-sub">
        📅 {formatDate(appt.scheduledAt)} · ⏰ {apptTime(appt)} · 🏥 {clinicLabel} · Source:{" "}
        {sourceLabel(appt.bookingSource)}
      </p>
      <p className="cons-sub">
        📋 <b>Reason:</b> {appt.reason ?? "Manual booking"}
        {appt.notes ? (
          <>
            <br />
            🗒️ <b>Notes:</b> {appt.notes}
          </>
        ) : null}
        {appt.cancelReason ? (
          <>
            <br />
            ❌ <b>Cancelled:</b> {appt.cancelReason}
          </>
        ) : null}
      </p>
      <div style={{ marginTop: 12 }}>
        <label>Audit Log</label>
        <div className="cons-note-list">
          {loading && auditEntries.length === 0 ? (
            <div className="cons-note-item">Loading audit log...</div>
          ) : auditEntries.length === 0 ? (
            <div className="cons-note-item">No audit entries yet.</div>
          ) : (
            auditEntries.map((entry, i) => (
              <div key={`${entry.at}-${i}`} className="cons-note-item">
                {entry.action}
                <span className="cons-note-time">
                  {auditStamp(entry.at)} — {entry.who}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

type ManualBookingSource = "WALK_IN" | "PHONE" | "CLINIC_VISIT" | "EMERGENCY";

const BOOKING_SOURCES: Array<{ value: ManualBookingSource; label: string }> = [
  { value: "WALK_IN", label: "Walk-in" },
  { value: "PHONE", label: "Phone" },
  { value: "CLINIC_VISIT", label: "Clinic visit" },
  { value: "EMERGENCY", label: "Emergency" },
];

function maChip(appt: Appointment) {
  if (appt.status === "CONFIRMED") {
    return (
      <span className="sch-chip sc-up">
        <DoctorIconInline icon={BadgeCheck} size="sm">
          Confirmed
        </DoctorIconInline>
      </span>
    );
  }
  if (appt.status === "COMPLETED") {
    return (
      <span className="sch-chip sc-done">
        <DoctorIconInline icon={BadgeCheck} size="sm">
          Completed
        </DoctorIconInline>
      </span>
    );
  }
  return (
    <span className="sch-chip" style={{ background: "var(--gray-100)", color: "var(--gray-600)" }}>
      <DoctorIconInline icon={X} size="sm">
        Cancelled
      </DoctorIconInline>
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

  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [search, setSearch] = useState("");
  const [selPatient, setSelPatient] = useState<DoctorPatient | null>(null);
  const [searchMsg, setSearchMsg] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [newGender, setNewGender] = useState("Male");
  const [newAge, setNewAge] = useState("");
  const [newCnic, setNewCnic] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const [date, setDate] = useState(todayInput());
  const [time, setTime] = useState("");
  const [source, setSource] = useState<ManualBookingSource>("WALK_IN");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const [modal, setModal] = useState<ModalState>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [cancelWhy, setCancelWhy] = useState("");

  const { data: patients } = useDoctorPatients();
  const { data: profile } = useDoctorProfile();
  const { data: schedules } = useDoctorSchedules();
  const listQuery = useDoctorAppointments({ kind: "PHYSICAL", manualOnly: true, limit: 50 });
  const detailsId = modal?.kind === "details" ? modal.appt.id : null;
  const detailQuery = useDoctorAppointmentDetail(detailsId);
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
    const nq = normSearchValue(q);
    const found = (patients ?? []).find((p) => {
      const name = `${p.user.firstName} ${p.user.lastName}`.toLowerCase();
      const pid = (p.patientNumber ?? p.patientId).toLowerCase();
      const phone = p.user.phone ? normSearchValue(p.user.phone) : "";
      return (
        pid === q ||
        pid.includes(q) ||
        name.includes(q) ||
        (phone && (phone.includes(nq) || nq.includes(phone)))
      );
    });
    if (found) {
      setSelPatient(found);
      setSearchMsg(null);
      showToast("✅ Patient found — details auto-filled");
    } else {
      setSelPatient(null);
      setSearchMsg(`No registered patient matched “${search.trim()}” — use the New Patient tab to create one.`);
    }
  };

  const resetForm = () => {
    setSelPatient(null);
    setSearch("");
    setSearchMsg(null);
    setNewName("");
    setNewMobile("");
    setNewAge("");
    setNewCnic("");
    setNewAddress("");
    setReason("");
    setNotes("");
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
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
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
        subtitle={<PhysicianDashboardLabel />}
        title="Manual Appointments"
        dateStr={todayFormatted()}
        actions={
          <button
            type="button"
            className="btn-w btn-hd-icon-amber"
            onClick={() => router.push("/doctor/clinic-schedule")}
          >
            <DoctorIconInline icon={Zap} size="button" tone="amber">
              Daily Capacity
            </DoctorIconInline>
          </button>
        }
      />

      <DashCard
        title={
          <DoctorIconInline icon={ClipboardPlus} size="button">
            Create Manual Appointment{" "}
            <span style={{ fontWeight: 500, fontSize: ".72rem", color: "var(--gray-400)" }}>
              — walk-in · phone · clinic visit · emergency
            </span>
          </DoctorIconInline>
        }
      >
        <div className="ma-form">
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button
              type="button"
              className={`ca-btn ${mode === "existing" ? "primary" : ""}`}
              onClick={() => {
                setMode("existing");
                setSelPatient(null);
              }}
            >
              <DoctorIconInline icon={Search} size="sm">
                Existing Patient
              </DoctorIconInline>
            </button>
            <button
              type="button"
              className={`ca-btn ${mode === "new" ? "primary" : ""}`}
              onClick={() => {
                setMode("new");
                setSelPatient(null);
              }}
            >
              <DoctorIconInline icon={Plus} size="sm">
                New Patient
              </DoctorIconInline>
            </button>
          </div>

          {mode === "existing" ? (
            <>
              <div className="ma-patient-search-row">
                <div className="form-group ma-patient-search-field">
                  <label>Search by Patient ID/ Mobile Number / Name</label>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") doSearch();
                    }}
                    placeholder="e.g. PT-1001, +92 3xx xxxxxxx or Sarah"
                  />
                </div>
                <div className="form-group ma-patient-search-btn">
                  <label aria-hidden="true">&nbsp;</label>
                  <button type="button" className="btn-w ma-search-submit" onClick={doSearch}>
                    <DoctorIconInline icon={Search} size="sm">
                      Search
                    </DoctorIconInline>
                  </button>
                </div>
              </div>
              {selPatient ? (
                <div className="ma-patient-found">
                  <PersonAvatar
                    initials={getInitials(selPatient.user.firstName, selPatient.user.lastName)}
                    seed={selPatient.patientId}
                  />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ fontWeight: 700, fontSize: ".9rem" }}>
                      {selPatient.user.firstName} {selPatient.user.lastName}{" "}
                      <span className="cons-chip cc-done" style={{ marginLeft: 6 }}>
                        Registered
                      </span>
                    </div>
                    <div style={{ fontSize: ".76rem", color: "var(--gray-500)" }}>
                      ID {selPatient.patientNumber ?? selPatient.patientId.slice(-6).toUpperCase()}
                      {selPatient.gender ? ` · ${selPatient.gender}` : ""}
                      {selPatient.age ? ` · ${selPatient.age} yrs` : ""}
                      {selPatient.user.phone ? ` · ${selPatient.user.phone}` : ""}
                    </div>
                  </div>
                  <button type="button" className="ca-btn" onClick={() => setSelPatient(null)}>
                    <DoctorIconInline icon={X} size="sm">
                      Change
                    </DoctorIconInline>
                  </button>
                </div>
              ) : searchMsg ? (
                <div className="ma-patient-msg ma-patient-msg-error">{searchMsg}</div>
              ) : (
                <div className="ma-patient-msg">Search the registry to auto-fill patient details.</div>
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
                    CNIC / Patient ID <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={newCnic}
                    onChange={(e) => setNewCnic(e.target.value)}
                    placeholder="42101-xxxxxxx-x"
                  />
                </div>
                <div className="form-group">
                  <label>
                    Address <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>(optional)</span>
                  </label>
                  <input type="text" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} placeholder="Area, City" />
                </div>
              </div>
              <div style={{ fontSize: ".74rem", color: "var(--gray-400)" }}>
                New patients are saved without a portal account — the appointment won&rsquo;t appear on a Patient
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
            <DoctorIconInline icon={Calendar} size="button">
              Appointment Information
            </DoctorIconInline>
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
              <select value={source} onChange={(e) => setSource(e.target.value as ManualBookingSource)}>
                {BOOKING_SOURCES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
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
            <div className="form-group">
              <label>
                Notes <span style={{ color: "var(--gray-400)", fontWeight: 500 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes"
              />
            </div>
          </div>
          <div style={{ fontSize: ".72rem", color: "var(--gray-400)", marginBottom: 12 }}>
            Validated against working days, hours, break time, holidays, existing bookings and daily capacity — the
            same rules as website bookings. Manual appointments are auto-<b>Confirmed</b> (no approval needed).
          </div>
          <button type="button" className="btn-w" disabled={createManual.isPending} onClick={doSave}>
            <DoctorIconInline icon={Save} size="sm">
              Save Manual Appointment
            </DoctorIconInline>
          </button>
        </div>
      </DashCard>

      <DashCard
        title={
          <DoctorIconInline icon={FileText} size="button">
            Manual Appointments{" "}
            <span style={{ fontWeight: 500, fontSize: ".72rem", color: "var(--gray-400)" }}>
              — {counts.confirmed} confirmed · {counts.today} today · {counts.completed} completed · {counts.cancelled}{" "}
              cancelled
            </span>
          </DoctorIconInline>
        }
      >
        <div className="pt-table-wrap">
          <table className="pt-table pt-table-manual">
            <colgroup>
              <col className="ma-col-id" />
              <col className="ma-col-patient" />
              <col className="ma-col-mobile" />
              <col className="ma-col-datetime" />
              <col className="ma-col-reason" />
              <col className="ma-col-status" />
              <col className="ma-col-actions" />
            </colgroup>
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
                    No manual appointments yet — use the form above to add one.
                  </td>
                </tr>
              ) : (
                list.map((appt) => (
                  <tr key={appt.id}>
                    <td className="ma-cell-id">
                      <strong>MA-{appt.id.slice(-4).toUpperCase()}</strong>
                      <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{sourceLabel(appt.bookingSource)}</div>
                    </td>
                    <td className="ma-cell-patient">
                      <strong>{patientName(appt)}</strong>
                      <div className="ma-cell-patient-meta">
                        <span className="cons-chip cc-done" style={{ fontSize: ".6rem", padding: "2px 7px" }}>
                          Registered
                        </span>
                        {appt.patient?.gender ? (
                          <span style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{appt.patient.gender}</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="ma-cell-mobile">{appt.patient?.user?.phone ?? "—"}</td>
                    <td className="ma-cell-datetime">
                      {formatDate(appt.scheduledAt)}
                      <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{apptTime(appt)}</div>
                    </td>
                    <td className="ma-cell-reason">
                      {appt.reason ?? "Manual booking"}
                      {appt.notes ? (
                        <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>{appt.notes}</div>
                      ) : null}
                      {appt.cancelReason ? (
                        <div style={{ fontSize: ".7rem", color: "var(--gray-400)" }}>
                          <DoctorIconInline icon={CircleX} size="sm">
                            {appt.cancelReason}
                          </DoctorIconInline>
                        </div>
                      ) : null}
                    </td>
                    <td className="ma-cell-status">{maChip(appt)}</td>
                    <td className="ma-cell-actions">
                      <div className="pt-actions">
                        {appt.status === "CONFIRMED" ? (
                          <>
                            <button type="button" className="pt-act-btn" onClick={() => openEdit(appt)}>
                              <DoctorIconInline icon={Pencil} size="sm">
                                Edit / Reschedule
                              </DoctorIconInline>
                            </button>
                            <button
                              type="button"
                              className="pt-act-btn pt-act-btn-success"
                              disabled={updateStatus.isPending}
                              onClick={() => doComplete(appt)}
                            >
                              <DoctorIconInline icon={BadgeCheck} size="sm">
                                Complete
                              </DoctorIconInline>
                            </button>
                            <button
                              type="button"
                              className="pt-act-btn pt-act-btn-critical"
                              onClick={() => setModal({ kind: "cancel", appt })}
                            >
                              <DoctorIconInline icon={X} size="sm">
                                Cancel
                              </DoctorIconInline>
                            </button>
                            <button
                              type="button"
                              className="pt-act-btn pt-act-btn-neutral"
                              onClick={() => setModal({ kind: "details", appt })}
                            >
                              <DoctorIconInline icon={Eye} size="sm">
                                Details
                              </DoctorIconInline>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="pt-act-btn pt-act-btn-neutral"
                            onClick={() => setModal({ kind: "details", appt })}
                          >
                            <DoctorIconInline icon={Eye} size="sm">
                              Details
                            </DoctorIconInline>
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
        icon={<DoctorIcon icon={Pencil} size="button" />}
        title={`Edit / Reschedule — MA-${modal ? modal.appt.id.slice(-4).toUpperCase() : ""}`}
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Back
            </ConsModalButton>
            <ConsModalButton variant="blue" onClick={doEdit} disabled={reschedule.isPending}>
              <DoctorIconInline icon={Save} size="sm">
                Save Changes
              </DoctorIconInline>
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
        icon={<DoctorIcon icon={AlertTriangle} size="button" />}
        title="Cancel Manual Appointment"
        warn
        onClose={closeModal}
        footer={
          <>
            <ConsModalButton variant="ghost" onClick={closeModal}>
              Keep it
            </ConsModalButton>
            <ConsModalButton variant="red" onClick={doCancel} disabled={updateStatus.isPending}>
              <DoctorIconInline icon={X} size="sm">
                Cancel Appointment
              </DoctorIconInline>
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
          <ManualAppointmentDetailsBody
            appt={(detailQuery.data ?? modal.appt) as DoctorAppointmentDetail}
            clinicLabel={
              profile?.city
                ? `${profile?.hospital || "Dr Insight Clinic"} — ${profile.city}`
                : profile?.hospital || "Dr Insight Clinic"
            }
            doctorName={
              profile?.user
                ? `Dr. ${profile.user.firstName} ${profile.user.lastName}`.trim()
                : "Doctor"
            }
            loading={detailQuery.isLoading}
          />
        ) : null}
      </ConsModal>
    </>
  );
}
