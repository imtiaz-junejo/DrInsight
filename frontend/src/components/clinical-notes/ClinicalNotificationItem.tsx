"use client";

import { useRouter } from "next/navigation";
import { useMarkNotificationRead } from "@/services/api-hooks";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type?: string;
  data?: { noteId?: string; patientId?: string; doctorId?: string; appointmentId?: string };
  readAt?: string | null;
  createdAt?: string;
}

export function ClinicalNotificationItem({
  notification,
  role,
}: {
  notification: AppNotification;
  role: "doctor" | "patient";
}) {
  const router = useRouter();
  const markRead = useMarkNotificationRead();
  const isUnread = !notification.readAt;
  const noteId = notification.data?.noteId;
  const isClinical = notification.type === "CLINICAL_NOTE" && noteId;

  const handleClick = async () => {
    if (!notification.readAt) {
      await markRead.mutateAsync(notification.id);
    }
    if (!isClinical) return;
    if (role === "patient") {
      router.push(`/patient/notes/${noteId}`);
      return;
    }
    const patientId = notification.data?.patientId;
    if (patientId) {
      router.push(`/doctor/patient-notes/${patientId}/${noteId}`);
    }
  };

  return (
    <button
      type="button"
      className={`clinical-notif-item${isUnread ? " unread" : ""}`}
      onClick={handleClick}
      style={{ cursor: isClinical ? "pointer" : "default", width: "100%", textAlign: "left" }}
    >
      <div className={`act-dot ${isUnread ? "ad-g" : "ad-b"}`}>🔔</div>
      <div className="act-text">
        <p>
          <strong>{notification.title}</strong> — {notification.body}
        </p>
        {isClinical ? <span>Open note →</span> : <span>Recent</span>}
      </div>
    </button>
  );
}
