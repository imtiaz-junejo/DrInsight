import { useMemo, useState } from "react";
import {
  useCreateManualAppointment,
  useDoctorAppointmentDetail,
  useDoctorAppointments,
  useDoctorPatients,
  useDoctorProfile,
  useDoctorSchedules,
  useRescheduleAppointment,
  useUpdateAppointmentStatus,
  type DoctorPatient,
} from "@/services/doctor-api-hooks";
import type { Appointment } from "@/services/api-hooks.types";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import type { ManualBookingSource, ModalState } from "../types";
import { normSearchValue, pad, slotTimes, todayInput } from "../utils";

export function useManualAppointments() {
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

  return {
    mode,
    setMode,
    search,
    setSearch,
    selPatient,
    setSelPatient,
    searchMsg,
    newName,
    setNewName,
    newMobile,
    setNewMobile,
    newGender,
    setNewGender,
    newAge,
    setNewAge,
    newCnic,
    setNewCnic,
    newAddress,
    setNewAddress,
    date,
    setDate,
    time,
    setTime,
    source,
    setSource,
    reason,
    setReason,
    notes,
    setNotes,
    modal,
    setModal,
    editDate,
    setEditDate,
    editTime,
    setEditTime,
    cancelWhy,
    setCancelWhy,
    slots,
    editSlots,
    listQuery,
    list,
    counts,
    detailQuery,
    profile,
    createManual,
    updateStatus,
    reschedule,
    doSearch,
    doSave,
    closeModal,
    openEdit,
    doEdit,
    doCancel,
    doComplete,
  };
}

export type UseManualAppointmentsReturn = ReturnType<typeof useManualAppointments>;
