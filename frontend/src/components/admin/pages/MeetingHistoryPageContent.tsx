"use client";

import { useState } from "react";
import { useAdminMeetingHistory } from "@/services/meeting-api-hooks";

export function MeetingHistoryPageContent() {
  const [page, setPage] = useState(1);
  const historyQuery = useAdminMeetingHistory(page, 20);
  const meetings = (historyQuery.data?.data ?? []) as Array<Record<string, unknown>>;
  const meta = historyQuery.data?.meta as { totalPages?: number } | undefined;

  return (
    <div style={{ padding: 24 }}>
      <h1>Meeting History</h1>
      {historyQuery.isLoading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Room</th>
              <th align="left">Status</th>
              <th align="left">Doctor</th>
              <th align="left">Patient</th>
              <th align="left">Duration</th>
              <th align="left">Started</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((m) => {
              const appt = m.appointment as Record<string, unknown> | undefined;
              const doctor = (appt?.doctor as { user?: { firstName?: string; lastName?: string } })?.user;
              const patient = (appt?.patient as { user?: { firstName?: string; lastName?: string } })?.user;
              return (
                <tr key={m.id as string}>
                  <td>{m.roomId as string}</td>
                  <td>{m.status as string}</td>
                  <td>{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "—"}</td>
                  <td>{patient ? `${patient.firstName} ${patient.lastName}` : "—"}</td>
                  <td>{m.durationSeconds ? `${m.durationSeconds}s` : "—"}</td>
                  <td>{m.startedAt ? new Date(m.startedAt as string).toLocaleString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {meta?.totalPages ?? 1}
        </span>
        <button
          type="button"
          disabled={page >= (meta?.totalPages ?? 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
