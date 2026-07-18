"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { patientConsultationPath } from "@/lib/consultation-utils";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

interface ConsultationAlert {
  appointmentId: string;
  roomId?: string;
  message: string;
}

export function ConsultationNotificationBanner() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const [alert, setAlert] = useState<ConsultationAlert | null>(null);

  useEffect(() => {
    if (!accessToken || role !== "PATIENT") return;

    const socket = io(`${WS_URL}/consultation`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    socket.on("appointment-status", (payload: Record<string, unknown>) => {
      if (payload.action === "doctor_started" && payload.appointmentId) {
        setAlert({
          appointmentId: payload.appointmentId as string,
          roomId: payload.roomId as string | undefined,
          message: (payload.message as string) || "Your doctor has started the consultation. Join now.",
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, role]);

  if (!alert) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: "#2563eb",
        color: "#fff",
        padding: "1rem 1.25rem",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        maxWidth: 360,
      }}
    >
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.9rem" }}>{alert.message}</p>
      <button
        type="button"
        onClick={() => router.push(patientConsultationPath(alert.appointmentId))}
        style={{
          background: "#fff",
          color: "#2563eb",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: 6,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Join Now
      </button>
    </div>
  );
}
