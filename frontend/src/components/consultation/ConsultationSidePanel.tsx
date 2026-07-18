"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAutosaveConsultationNote, useCreateLabOrder } from "@/services/meeting-api-hooks";

interface ConsultationSidePanelProps {
  tab: "patient" | "prescription" | "notes" | "labs";
  onTabChange: (tab: "patient" | "prescription" | "notes" | "labs") => void;
  appointmentId: string;
  patient?: Record<string, unknown> | null;
  appointment?: Record<string, unknown>;
}

export function ConsultationSidePanel({
  tab,
  onTabChange,
  appointmentId,
  patient,
  appointment,
}: ConsultationSidePanelProps) {
  const [noteContent, setNoteContent] = useState("");
  const [noteId, setNoteId] = useState<string | undefined>();
  const [labTest, setLabTest] = useState("");
  const autosave = useAutosaveConsultationNote();
  const createLabOrder = useCreateLabOrder();

  const patientUser = patient?.user as { firstName?: string; lastName?: string } | undefined;
  const allergies = (patient?.allergies as string[]) ?? [];
  const medicalHistory = (patient?.medicalHistory as string) ?? "—";

  useEffect(() => {
    const interval = setInterval(() => {
      if (!noteContent.trim()) return;
      autosave.mutate(
        { appointmentId, title: "Consultation Note", content: noteContent, noteId },
        {
          onSuccess: (data: { id?: string }) => {
            if (data?.id) setNoteId(data.id);
          },
        },
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [appointmentId, autosave, noteContent, noteId]);

  const patientId = (appointment?.patient as { id?: string })?.id ?? (patient?.id as string | undefined);

  return (
    <aside className="consultation-side-panel">
      <div className="panel-tabs">
        {(["patient", "prescription", "notes", "labs"] as const).map((t) => (
          <button key={t} type="button" className={tab === t ? "active" : ""} onClick={() => onTabChange(t)}>
            {t === "patient" ? "Patient" : t === "prescription" ? "Rx" : t === "notes" ? "Notes" : "Labs"}
          </button>
        ))}
      </div>

      <div className="panel-content">
        {tab === "patient" && (
          <div className="panel-section">
            <h4>
              {patientUser ? `${patientUser.firstName ?? ""} ${patientUser.lastName ?? ""}` : "Patient"}
            </h4>
            <p>
              <strong>Allergies:</strong> {allergies.length ? allergies.join(", ") : "None recorded"}
            </p>
            <p>
              <strong>Medical History:</strong> {medicalHistory}
            </p>
            <p>
              <strong>Blood Group:</strong> {(patient?.bloodGroup as string) ?? "—"}
            </p>
          </div>
        )}

        {tab === "prescription" && patientId && (
          <div className="panel-section">
            <h4>E-Prescription</h4>
            <p>Issue a prescription linked to this consultation.</p>
            <Link
              href={`/doctor/prescriptions/new?patientId=${patientId}&appointmentId=${appointmentId}`}
              className="lab-order-btn"
            >
              Open Prescription Builder
            </Link>
          </div>
        )}

        {tab === "notes" && (
          <div className="panel-section">
            <h4>Private Clinical Notes</h4>
            <textarea
              className="notes-textarea"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Autosaves every 5 seconds..."
              rows={12}
            />
            {autosave.isPending && <span className="autosave-hint">Saving...</span>}
          </div>
        )}

        {tab === "labs" && (
          <div className="panel-section">
            <h4>Lab Orders</h4>
            <input
              value={labTest}
              onChange={(e) => setLabTest(e.target.value)}
              placeholder="Test name (e.g. CBC, Lipid Panel)"
            />
            <button
              type="button"
              className="lab-order-btn"
              disabled={!labTest.trim() || createLabOrder.isPending}
              onClick={() => {
                createLabOrder.mutate({
                  appointmentId,
                  tests: [{ name: labTest.trim() }],
                });
                setLabTest("");
              }}
            >
              Order Lab Test
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
