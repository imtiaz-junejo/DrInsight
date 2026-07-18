"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { usePatientAppointments } from "@/services/patient-api-hooks";
import {
  isOnlineConsultation,
  patientConsultationPath,
} from "@/lib/consultation-utils";
import type { Appointment } from "@/services/api-hooks";
import { doctorFullName, formatDateTime } from "@/lib/data-mappers";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

function findLiveAppointment(appointments: Appointment[]): Appointment | undefined {
  return appointments.find(
    (a) =>
      isOnlineConsultation(a.consultationType) &&
      (a.meetingStatus === "LIVE" || a.status === "IN_PROGRESS") &&
      !["COMPLETED", "CANCELLED"].includes(a.status),
  );
}

export function PatientConsultationJoinPrompt() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const appointmentsQuery = usePatientAppointments({ limit: 50 }, true);
  const [socketLiveId, setSocketLiveId] = useState<string | null>(null);

  const appointments = appointmentsQuery.data?.data ?? [];
  const liveFromApi = useMemo(() => findLiveAppointment(appointments), [appointments]);
  const liveAppointmentId = socketLiveId ?? liveFromApi?.id ?? null;
  const liveAppointment = appointments.find((a) => a.id === liveAppointmentId) ?? liveFromApi;

  useEffect(() => {
    if (!accessToken || role !== "PATIENT") return;

    const realtime = io(`${WS_URL}/realtime`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    const consultation = io(`${WS_URL}/consultation`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    const handleLive = (payload: Record<string, unknown>) => {
      if (payload.appointmentId && (payload.meetingStatus === "LIVE" || payload.action === "doctor_started")) {
        setSocketLiveId(payload.appointmentId as string);
        appointmentsQuery.refetch();
      }
      if (payload.action === "consultation_ended" && payload.appointmentId === liveAppointmentId) {
        setSocketLiveId(null);
        appointmentsQuery.refetch();
      }
    };

    realtime.on("notification", (notification: { type?: string; data?: Record<string, unknown> }) => {
      if (notification.type === "CONSULTATION" && notification.data?.appointmentId) {
        setSocketLiveId(notification.data.appointmentId as string);
        appointmentsQuery.refetch();
      }
    });

    consultation.on("appointment-status", handleLive);

    return () => {
      realtime.disconnect();
      consultation.disconnect();
    };
  }, [accessToken, role, appointmentsQuery, liveAppointmentId]);

  if (role !== "PATIENT" || !liveAppointment) return null;

  const doctorName = doctorFullName(liveAppointment.doctor?.user);

  return (
    <div className="patient-live-consultation-banner">
      <div className="plcb-content">
        <span className="plcb-pulse" aria-hidden />
        <div>
          <strong>Your doctor is ready — {doctorName}</strong>
          <p>Video consultation is live. Join now to connect with your doctor.</p>
        </div>
      </div>
      <Link href={patientConsultationPath(liveAppointment.id)} className="plcb-join-btn">
        Join Video Call
      </Link>
    </div>
  );
}

export function PatientUpcomingConsultationBanner() {
  const appointmentsQuery = usePatientAppointments({ limit: 50 });
  const appointments = appointmentsQuery.data?.data ?? [];
  const live = findLiveAppointment(appointments);

  const next = useMemo(() => {
    return appointments
      .filter(
        (a) =>
          ["CONFIRMED", "PENDING", "IN_PROGRESS"].includes(a.status) &&
          isOnlineConsultation(a.consultationType) &&
          a.meetingStatus !== "LIVE",
      )
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  }, [appointments]);

  if (live || !next) return null;

  const doctorName = doctorFullName(next.doctor?.user);

  return (
    <div className="alert-banner">
      <div className="ab-ico">📅</div>
      <div className="ab-text">
        <strong>Upcoming — {doctorName}</strong>
        <span>
          {formatDateTime(next.scheduledAt)}. Your doctor will notify you when the video call is ready to join.
        </span>
      </div>
      <Link href="/patient/consultations" className="ab-btn">
        View Details →
      </Link>
    </div>
  );
}
