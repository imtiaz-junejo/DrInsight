"use client";

import { useRef, useState } from "react";
import {
  useCreatePatientAlert,
  usePatientAlerts,
  useRemovePatientAlert,
  useResolvePatientAlert,
  type PatientCriticalAlert,
} from "@/services/doctor-api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { formatDate, formatDateTime } from "@/lib/data-mappers";
import { uploadFile, validateLicenseCertificateFile } from "@/lib/upload";

const SEVERITIES = [
  { key: "CRITICAL" as const, label: "🔴 Critical", className: "crit" },
  { key: "URGENT" as const, label: "🟡 Urgent", className: "" },
  { key: "STABLE" as const, label: "🟢 Stable", className: "" },
];

const CATEGORIES = [
  "Clinical Deterioration",
  "Medication Non-compliance",
  "Abnormal Vitals",
  "Missed Follow-up",
  "Emergency Symptoms",
  "Post-operative Concern",
  "Other",
];

export function FlagCriticalModal({
  patientId,
  patientName,
  patientCode,
}: {
  patientId: string;
  patientName: string;
  patientCode: string;
}) {
  const closePatientPanel = useDoctorUiStore((s) => s.closePatientPanel);
  const showToast = useDoctorUiStore((s) => s.showToast);
  const [tab, setTab] = useState<"flag" | "history">("flag");
  const [severity, setSeverity] = useState<"CRITICAL" | "URGENT" | "STABLE">("CRITICAL");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [reason, setReason] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [notifyTeam, setNotifyTeam] = useState(true);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const alertsQuery = usePatientAlerts(patientId);
  const createAlert = useCreatePatientAlert();
  const resolveAlert = useResolvePatientAlert();
  const removeAlert = useRemovePatientAlert();

  const activeAlert = alertsQuery.data?.find((a) => a.status === "ACTIVE");

  const handleSubmit = async () => {
    if (!reason.trim()) {
      showToast("⚠️ Please provide a reason for flagging");
      return;
    }
    try {
      setUploading(true);
      let attachments: Array<{ name: string; url: string; mimeType?: string }> | undefined;
      if (attachmentFile) {
        const validationError = validateLicenseCertificateFile(attachmentFile);
        if (validationError) {
          showToast(`⚠️ ${validationError}`);
          setUploading(false);
          return;
        }
        const url = await uploadFile(attachmentFile, "clinical-alerts");
        attachments = [
          {
            name: attachmentFile.name,
            url,
            mimeType: attachmentFile.type,
          },
        ];
      }

      await createAlert.mutateAsync({
        patientId,
        body: {
          severity,
          category,
          reason: reason.trim(),
          clinicalNotes: clinicalNotes.trim() || undefined,
          reviewDate: reviewDate || undefined,
          notifyTeam,
          attachments,
        },
      });
      const label = SEVERITIES.find((s) => s.key === severity)?.label ?? severity;
      showToast(`🚨 ${patientName} flagged as ${label}${notifyTeam ? " · care team notified" : ""}`);
      setReason("");
      setClinicalNotes("");
      setReviewDate("");
      setAttachmentFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      closePatientPanel();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : null;
      const text = Array.isArray(message) ? message[0] : message;
      showToast(text ?? "Failed to flag patient");
    } finally {
      setUploading(false);
    }
  };

  const handleResolve = async (alert: PatientCriticalAlert) => {
    await resolveAlert.mutateAsync({ alertId: alert.id, patientId });
    showToast("Alert resolved");
  };

  const handleRemove = async (alert: PatientCriticalAlert) => {
    if (!window.confirm("Remove this alert from the patient record?")) return;
    await removeAlert.mutateAsync({ alertId: alert.id, patientId });
    showToast("Alert removed");
  };

  return (
    <div
      className="modal-ov show"
      style={{ zIndex: 700 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePatientPanel();
      }}
    >
      <div className="modal patient-action-modal" style={{ maxWidth: 620 }}>
        <div className="modal-hd" style={{ background: "linear-gradient(135deg,#fef2f2,#fff)" }}>
          <div className="m-av" style={{ background: "linear-gradient(135deg,#e11d48,#f43f5e)" }}>
            🚨
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--gray-900)" }}>
              Flag Patient Status
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>
              for {patientName} · {patientCode}
            </div>
          </div>
          {activeAlert ? (
            <span className="st-chip st-critical" style={{ marginRight: 8 }}>
              🔴 Active Alert
            </span>
          ) : null}
          <button type="button" className="modal-close" onClick={closePatientPanel}>
            ✕
          </button>
        </div>
        <div className="modal-bd">
          <div className="pa-tabs">
            <button type="button" className={`pa-tab${tab === "flag" ? " on" : ""}`} onClick={() => setTab("flag")}>
              🚨 New Alert
            </button>
            <button type="button" className={`pa-tab${tab === "history" ? " on" : ""}`} onClick={() => setTab("history")}>
              📋 Alert History
            </button>
          </div>

          {tab === "flag" ? (
            <>
              <div className="af-field">
                <label>Severity Level</label>
                <div className="af-pills">
                  {SEVERITIES.map((s) => (
                    <div
                      key={s.key}
                      className={`af-pill${s.className ? ` ${s.className}` : ""}${severity === s.key ? " on" : ""}`}
                      onClick={() => setSeverity(s.key)}
                      onKeyDown={(e) => e.key === "Enter" && setSeverity(s.key)}
                      role="button"
                      tabIndex={0}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="af-field">
                <label>Alert Category</label>
                <select className="af-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="af-field">
                <label>Reason / Clinical Concern</label>
                <textarea
                  className="af-ta"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this patient being flagged? (visible to the care team)"
                />
              </div>
              <div className="af-field">
                <label>Detailed Clinical Notes</label>
                <textarea
                  className="af-ta"
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Additional clinical context, observations, or instructions..."
                />
              </div>
              <div className="af-row">
                <div className="af-field">
                  <label>Review Date</label>
                  <input className="af-input" type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
                </div>
                <div className="af-field">
                  <label>Supporting Document</label>
                  <input
                    ref={fileInputRef}
                    className="af-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
                  />
                  {attachmentFile ? (
                    <span className="file-chip" style={{ marginTop: 8 }}>
                      📎 {attachmentFile.name}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="af-field">
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, color: "var(--gray-800)", fontSize: "0.82rem" }}>
                  <input
                    type="checkbox"
                    checked={notifyTeam}
                    onChange={(e) => setNotifyTeam(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "var(--red)" }}
                  />
                  Notify on-call care team immediately
                </label>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="btn-bm"
                  style={{ flex: 1, background: "var(--red)" }}
                  onClick={handleSubmit}
                  disabled={createAlert.isPending || uploading}
                >
                  🚨 Confirm Flag
                </button>
                <button type="button" className="btn-om" onClick={closePatientPanel}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="alert-history-list">
              {alertsQuery.isLoading ? (
                <p style={{ color: "var(--gray-400)", textAlign: "center", padding: 20 }}>Loading alerts...</p>
              ) : (alertsQuery.data ?? []).length === 0 ? (
                <p style={{ color: "var(--gray-400)", textAlign: "center", padding: 20 }}>No alert history</p>
              ) : (
                (alertsQuery.data ?? []).map((alert) => (
                  <div key={alert.id} className={`alert-history-item${alert.status === "ACTIVE" ? " active" : ""}`}>
                    <div className="alert-history-top">
                      <strong>
                        {alert.severity === "CRITICAL" ? "🔴" : alert.severity === "URGENT" ? "🟡" : "🟢"} {alert.category}
                      </strong>
                      <span className={`st-chip ${alert.status === "ACTIVE" ? "st-critical" : "st-active"}`}>{alert.status}</span>
                    </div>
                    <p>{alert.reason}</p>
                    {alert.clinicalNotes ? <p className="alert-clinical">{alert.clinicalNotes}</p> : null}
                    <div className="alert-history-meta">
                      {formatDateTime(alert.createdAt)}
                      {alert.reviewDate ? ` · Review: ${formatDate(alert.reviewDate)}` : ""}
                    </div>
                    {alert.status === "ACTIVE" ? (
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <button type="button" className="tbl-btn view" onClick={() => handleResolve(alert)}>
                          Resolve
                        </button>
                        <button type="button" className="tbl-btn" onClick={() => handleRemove(alert)}>
                          Remove
                        </button>
                      </div>
                    ) : null}
                    {alert.history?.length ? (
                      <div className="alert-audit-trail">
                        {alert.history.slice(0, 5).map((h) => (
                          <div key={h.id} className="alert-audit-row">
                            <span>{formatDateTime(h.createdAt)}</span>
                            <span>{h.action}</span>
                            <span>{h.details}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
