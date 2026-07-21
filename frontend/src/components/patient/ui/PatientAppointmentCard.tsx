"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DoctorIconComponent } from "@/components/doctor/icons/DoctorIcons";
import {
  BadgeCheck,
  Calendar,
  CalendarClock,
  Circle,
  CircleX,
  ClipboardList,
  Clock3,
  DoctorIcon,
  DoctorIconInline,
  Download,
  Hospital,
  MessageSquare,
  Phone,
  Pill,
  Video,
} from "@/components/doctor/icons/DoctorIcons";
import { PersonAvatar } from "@/components/patient/ui/PatientPrimitives";
import { patientConsultationPath } from "@/lib/consultation-utils";
import { doctorFullName, formatDate, getInitials, gradientForId } from "@/lib/data-mappers";
import type { Appointment } from "@/services/api-hooks";
import { useCancelAppointment } from "@/services/patient-api-hooks";
import { usePatientUiStore } from "@/store/patient-ui.store";

const ONLINE_TYPE_META: Record<string, { icon: DoctorIconComponent; label: string }> = {
  VIDEO: { icon: Video, label: "Video Consultation" },
  AUDIO: { icon: Phone, label: "Voice Consultation" },
  CHAT: { icon: MessageSquare, label: "Chat Consultation" },
};

function isPhysical(appt: Appointment) {
  return appt.consultationType === "IN_PERSON";
}

function typeMeta(type: string) {
  if (type === "IN_PERSON") return { icon: Hospital, label: "In-Person Visit" };
  return ONLINE_TYPE_META[type] ?? ONLINE_TYPE_META.VIDEO;
}

function cardClass(appt: Appointment) {
  if (appt.status === "COMPLETED") return "completed";
  if (appt.status === "CANCELLED") return "cancelled";
  if (appt.status === "PENDING") return "pending";
  return "upcoming";
}

function apptTime(appt: Appointment) {
  return new Date(appt.scheduledAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function doctorSpec(appt: Appointment) {
  const doctor = appt.doctor;
  const specialty = doctor?.specialty ?? "General";
  const cred = doctor?.subSpecialty ?? doctor?.credentials ?? "Board Certified";
  return `${specialty} · ${cred}`;
}

function clinicLabel(appt: Appointment) {
  const doctor = appt.doctor;
  const hospital = doctor?.hospital ?? "Dr Insight Clinic";
  const city = doctor?.city;
  return city ? `${hospital} — ${city}` : hospital;
}

function StatusChip({ appt }: { appt: Appointment }) {
  switch (appt.status) {
    case "PENDING":
      return (
        <span className="cons-chip cc-pending">
          <DoctorIconInline icon={Clock3} size="sm">
            Pending Approval
          </DoctorIconInline>
        </span>
      );
    case "CONFIRMED":
      return (
        <span className="cons-chip cc-up">
          <DoctorIconInline icon={Calendar} size="sm">
            Upcoming
          </DoctorIconInline>
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="cons-chip cc-live">
          <DoctorIconInline icon={Circle} size="sm">
            Ongoing
          </DoctorIconInline>
        </span>
      );
    case "COMPLETED":
      return (
        <span className="cons-chip cc-done">
          <DoctorIconInline icon={BadgeCheck} size="sm">
            Completed
          </DoctorIconInline>
        </span>
      );
    case "CANCELLED":
      return (
        <span className="cons-chip cc-cancel">
          <DoctorIconInline icon={CircleX} size="sm">
            Cancelled
          </DoctorIconInline>
        </span>
      );
    default:
      return <span className="cons-chip cc-up">{appt.status}</span>;
  }
}

export function PatientAppointmentCard({ appt }: { appt: Appointment }) {
  const router = useRouter();
  const showToast = usePatientUiStore((s) => s.showToast);
  const openConsultationModal = usePatientUiStore((s) => s.openConsultationModal);
  const cancelMutation = useCancelAppointment();

  const physical = isPhysical(appt);
  const t = typeMeta(appt.consultationType);
  const meetingLive = appt.meetingStatus === "LIVE" || appt.status === "IN_PROGRESS";
  const canJoin = !physical && ["VIDEO", "AUDIO", "CHAT"].includes(appt.consultationType) && meetingLive;

  const handleCancel = () => {
    cancelMutation.mutate(appt.id, {
      onSuccess: () => showToast("Appointment cancelled"),
      onError: () => showToast("Could not cancel appointment"),
    });
  };

  const detailsButton = (
    <button type="button" className="ca-btn" onClick={openConsultationModal}>
      <DoctorIconInline icon={ClipboardList} size="sm">
        Details
      </DoctorIconInline>
    </button>
  );

  const renderActions = () => {
    if (appt.status === "COMPLETED") {
      return (
        <>
          <button type="button" className="ca-btn" onClick={openConsultationModal}>
            <DoctorIconInline icon={ClipboardList} size="sm">
              Visit Summary
            </DoctorIconInline>
          </button>
          <Link href="/book-consultation" className="ca-btn primary" style={{ textDecoration: "none" }}>
            <DoctorIconInline icon={CalendarClock} size="sm">
              Book Follow-up
            </DoctorIconInline>
          </Link>
          <button
            type="button"
            className="ca-btn"
            onClick={() =>
              appt.prescription?.id
                ? showToast("Opening e-prescription...")
                : showToast("No prescription on file for this visit")
            }
          >
            <DoctorIconInline icon={Pill} size="sm">
              View e-Prescription
            </DoctorIconInline>
          </button>
          <button type="button" className="ca-btn" onClick={() => showToast("Downloading visit summary PDF...")}>
            <DoctorIconInline icon={Download} size="sm">
              Download PDF
            </DoctorIconInline>
          </button>
        </>
      );
    }

    if (appt.status === "CANCELLED") {
      return (
        <>
          {detailsButton}
          <Link href="/book-consultation" className="ca-btn primary" style={{ textDecoration: "none" }}>
            <DoctorIconInline icon={CalendarClock} size="sm">
              Rebook
            </DoctorIconInline>
          </Link>
        </>
      );
    }

    if (appt.status === "PENDING") {
      return (
        <>
          {detailsButton}
          <button type="button" className="ca-btn danger" onClick={handleCancel}>
            <DoctorIconInline icon={CircleX} size="sm">
              Cancel Request
            </DoctorIconInline>
          </button>
        </>
      );
    }

    if (appt.status === "IN_PROGRESS" || (canJoin && appt.status === "CONFIRMED")) {
      return (
        <>
          <button type="button" className="ca-btn primary" onClick={() => router.push(patientConsultationPath(appt.id))}>
            <DoctorIconInline icon={t.icon} size="sm">
              Join Call
            </DoctorIconInline>
          </button>
          {detailsButton}
          <button type="button" className="ca-btn danger" onClick={handleCancel}>
            <DoctorIconInline icon={CircleX} size="sm">
              Cancel
            </DoctorIconInline>
          </button>
        </>
      );
    }

    if (appt.status === "CONFIRMED") {
      if (physical) {
        return (
          <>
            <button type="button" className="ca-btn primary" onClick={() => showToast("Directions opened")}>
              <DoctorIconInline icon={Hospital} size="sm">
                Get Directions
              </DoctorIconInline>
            </button>
            <button type="button" className="ca-btn" onClick={() => showToast("Reschedule request sent")}>
              <DoctorIconInline icon={CalendarClock} size="sm">
                Reschedule
              </DoctorIconInline>
            </button>
            <button type="button" className="ca-btn danger" onClick={handleCancel}>
              <DoctorIconInline icon={CircleX} size="sm">
                Cancel
              </DoctorIconInline>
            </button>
          </>
        );
      }

      return (
        <>
          {detailsButton}
          <button type="button" className="ca-btn" onClick={() => showToast("Notes saved")}>
            <DoctorIconInline icon={ClipboardList} size="sm">
              Add Notes
            </DoctorIconInline>
          </button>
          <button type="button" className="ca-btn danger" onClick={handleCancel}>
            <DoctorIconInline icon={CircleX} size="sm">
              Cancel
            </DoctorIconInline>
          </button>
        </>
      );
    }

    return detailsButton;
  };

  return (
    <div className={`cons-card ${cardClass(appt)}`}>
      <div className="cons-top">
        <PersonAvatar
          initials={getInitials(appt.doctor?.user?.firstName, appt.doctor?.user?.lastName)}
          seed={appt.id}
          style={{ background: gradientForId(appt.id) }}
        />
        <div className="cons-top-main">
          <div className="cons-dr-name">{doctorFullName(appt.doctor?.user)}</div>
          <div className="cons-dr-spec">{doctorSpec(appt)}</div>
        </div>
        <StatusChip appt={appt} />
      </div>

      <div className="cons-details">
        <span>
          <DoctorIcon icon={t.icon} size="sm" /> {t.label}
        </span>
        {physical ? (
          <span>
            <DoctorIconInline icon={Hospital} size="sm">
              {clinicLabel(appt)}
            </DoctorIconInline>
          </span>
        ) : null}
        <span>
          <DoctorIconInline icon={Calendar} size="sm">
            {formatDate(appt.scheduledAt)}
          </DoctorIconInline>
        </span>
        <span>
          <DoctorIconInline icon={Clock3} size="sm">
            {apptTime(appt)}
          </DoctorIconInline>
        </span>
        <span>
          <DoctorIconInline icon={Clock3} size="sm">
            {appt.durationMinutes} min
          </DoctorIconInline>
        </span>
      </div>

      {appt.status === "CANCELLED" ? (
        <div className="cons-note">
          <DoctorIconInline icon={CircleX} size="sm">
            <strong>Cancelled:</strong> {appt.cancelReason ?? "Not specified"}
          </DoctorIconInline>
        </div>
      ) : (
        <div className="cons-note">
          <DoctorIconInline icon={ClipboardList} size="sm">
            <strong>Reason:</strong> {appt.reason ?? (physical ? "In-person visit" : "Consultation")}
          </DoctorIconInline>
        </div>
      )}

      <div className="cons-actions">{renderActions()}</div>
    </div>
  );
}
