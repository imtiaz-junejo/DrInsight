"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { HEADER_LOGO_SRC } from "@/config/brand-logos";
import { formatDateTime } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import type { PrescriptionPreviewData } from "./EPrescriptionBuilder";
import "@/styles/e-prescription.css";

const BRAND = {
  name: "DrInsight",
  tagline: "Online Medical Consultation",
  website: "www.drinsight.org",
  phone: "+92 335 3545545",
  whatsapp: "+92 335 3545545",
  email: "care@drinsight.org",
  support: "support@drinsight.org",
};

function statusChipClass(status: string): string {
  const map: Record<string, string> = {
    approved: "appr",
    dismissed: "dism",
    "pending review": "pend",
    draft: "draft",
    finalized: "final",
  };
  return map[status.toLowerCase()] ?? "final";
}

function pseudoQrSvg(text: string): string {
  const N = 25;
  const cell = 3;
  const size = N * cell;
  let h = 2166136261;
  const seed = String(text || "");
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  const rnd = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    h >>>= 0;
    return h / 4294967296;
  };
  const grid: number[][] = [];
  for (let r = 0; r < N; r++) {
    grid[r] = [];
    for (let c = 0; c < N; c++) grid[r][c] = rnd() > 0.5 ? 1 : 0;
  }
  const finder = (or: number, oc: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = or + r;
        const cc = oc + c;
        if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue;
        const on =
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        grid[rr][cc] = on ? 1 : 0;
      }
    }
  };
  finder(0, 0);
  finder(0, N - 7);
  finder(N - 7, 0);
  for (let t = 8; t < N - 8; t++) {
    grid[6][t] = t % 2 ? 0 : 1;
    grid[t][6] = t % 2 ? 0 : 1;
  }
  let rects = "";
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c]) {
        rects += `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}"/>`;
      }
    }
  }
  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="#fff"/><g fill="#0f2b4c">${rects}</g></svg>`;
}

function InfoCell({ label, value, warn }: { label: string; value?: string | null; warn?: boolean }) {
  const display = value?.trim() ? value : "—";
  return (
    <div className={`rx-cell${warn ? " warn" : ""}`}>
      <label>{label}</label>
      <span>{display}</span>
    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children?: ReactNode }) {
  if (!children) return null;
  return (
    <div className="rx-sec">
      <div className="rx-sec-hd">
        <div className="rx-sec-ic">{icon}</div>
        <h3>{title}</h3>
        <div className="rx-hr" />
      </div>
      {children}
    </div>
  );
}

function RxDocument({ data }: { data: PrescriptionPreviewData }) {
  const { doctor: d, patient: p, consult: c, summary: s, symptoms: sy, exam: ex, assessment: as, advice: ad, followup: fu } =
    data;
  const statusLower = (data.status || "").toLowerCase();

  const stamp =
    statusLower === "approved" ? (
      <div className="rx-stampbox">
        <div className="rx-stamp">
          ✓ Approved
          <small>Reviewed by DrInsight Admin</small>
        </div>
      </div>
    ) : statusLower === "dismissed" ? (
      <div className="rx-stampbox">
        <div className="rx-stamp dismissed">
          ✕ Dismissed
          <small>Not dispensed — see notes</small>
        </div>
      </div>
    ) : statusLower === "pending review" ? (
      <div className="rx-stampbox">
        <div className="rx-stamp pending">
          ⏳ Pending Review
          <small>Awaiting admin approval</small>
        </div>
      </div>
    ) : null;

  const summaryHas =
    s.reason || s.chiefComplaint || s.notes || s.symptomDuration || s.prevTreatment || s.reports.length > 0;
  const symptomsHas =
    sy.reported.length > 0 || sy.severity || sy.progression || sy.associated || sy.aggravating || sy.relieving;
  const examHas = [
    ex.appearance,
    ex.alertness,
    ex.speech,
    ex.respiratory,
    ex.swelling,
    ex.skin,
    ex.temp,
    ex.bp,
    ex.sugar,
    ex.spo2,
    ex.hr,
    ex.other,
    ex.observations,
  ].some(Boolean);
  const assessHas = [as.provisional, as.differential, as.icd10, as.impression, as.risk].some(Boolean);
  const followHas = [fu.required, fu.date, fu.after, fu.type, fu.referral].some(Boolean);

  const adviceItems = [
    ["🥗 Diet", ad.diet, ""],
    ["🌿 Lifestyle", ad.lifestyle, ""],
    ["🏃 Exercise", ad.exercise, ""],
    ["💧 Hydration", ad.hydration, ""],
    ["😴 Sleep", ad.sleep, ""],
    ["🏠 Home Care", ad.homeCare, ""],
    ["🦠 Isolation", ad.isolation, ""],
    ["⚠️ Warning Signs", ad.warning, "warn"],
    ["🚨 Emergency Instructions", ad.emergency, "warn"],
  ].filter((item) => item[1]);

  return (
    <div className="rx-doc" id="rxDocRoot">
      <div className="rx-watermark">
        <span>℞</span>
      </div>

      <div className="rx-hd">
        <div className="rx-hd-top">
          <div className="rx-brand">
            <div className="rx-logo-img">
              <img src={HEADER_LOGO_SRC} alt="DrInsight" />
            </div>
            <div className="rx-tag">{BRAND.tagline}</div>
            <div className="rx-contact">
              <span>🌐 {BRAND.website}</span>
              <span>☎ {BRAND.phone}</span>
              <span>💬 WhatsApp {BRAND.whatsapp}</span>
              <span>✉ {BRAND.email}</span>
            </div>
          </div>
          <div className="rx-hd-right">
            <span className="rx-ebadge">🔒 Electronic Prescription</span>
            <div className="rx-qr">
              <div dangerouslySetInnerHTML={{ __html: pseudoQrSvg(`${data.rxNo}|${data.verifyId}`) }} />
              <div className="rx-qr-cap">SCAN TO VERIFY</div>
            </div>
          </div>
        </div>
        <div className="rx-hd-meta">
          <div className="rx-mchip">
            <b>Prescription No.</b>
            <span>{data.rxNo}</span>
          </div>
          <div className="rx-mchip">
            <b>Issued</b>
            <span>{data.issuedAt}</span>
          </div>
          <div className="rx-mchip">
            <b>Consultation ID</b>
            <span>{c.consultId}</span>
          </div>
          <div className="rx-mchip">
            <b>Type</b>
            <span>{c.type} Consultation</span>
          </div>
          <div className="rx-mchip">
            <b>Verification</b>
            <span>{data.verifyId}</span>
          </div>
        </div>
      </div>

      <div className="rx-body">
        <div className="rx-idband">
          <div className="rx-idcol doc">
            <div className="rx-idlabel">🩺 Prescribing Physician</div>
            <div className="rx-idname">{d.name}</div>
            <div className="rx-idsub">{d.specialization}</div>
            <div className="rx-idrows">
              <div>
                <b>Qualification:</b> {d.qualification}
              </div>
              <div>
                <b>Reg. No (PMDC):</b> {d.reg}
              </div>
              <div>
                <b>Doctor ID:</b> {c.doctorId}
              </div>
            </div>
          </div>
          <div className="rx-idcol">
            <div className="rx-idlabel">👤 Patient</div>
            <div className="rx-idname">{p.name}</div>
            <div className="rx-idsub">
              {p.age} yrs · {p.gender} · {p.blood}
            </div>
            <div className="rx-idrows">
              <div>
                <b>Patient ID:</b> {p.id}
              </div>
              <div>
                <b>Contact:</b> {p.phone}
              </div>
              <div>
                <b>City:</b> {[p.city, p.country].filter(Boolean).join(", ") || "—"}
              </div>
            </div>
          </div>
        </div>

        <Section icon="🔗" title="Consultation Record">
          <div className="rx-grid">
            <InfoCell label="Consultation ID" value={c.consultId} />
            <InfoCell label="Appointment ID" value={c.apptId} />
            <InfoCell label="Date & Time" value={c.dateTime} />
            <InfoCell label="Status" value={c.status} />
            <InfoCell label="Consultation Type" value={c.type} />
            <InfoCell label="Doctor ID" value={c.doctorId} />
            <InfoCell label="Patient ID" value={c.patientId} />
            <InfoCell label="Follow-up Ref" value={c.followupRef} />
          </div>
        </Section>

        <Section icon="👤" title="Patient Information">
          <div className="rx-grid">
            <InfoCell label="Full Name" value={p.name} />
            <InfoCell label="Date of Birth" value={p.dob} />
            <InfoCell label="Age / Gender" value={`${p.age} yrs / ${p.gender}`} />
            <InfoCell label="Blood Group" value={p.blood} />
            <InfoCell label="Height" value={p.height} />
            <InfoCell label="Weight" value={p.weight} />
            <InfoCell label="BMI" value={p.bmi} />
            <InfoCell label="Emergency Contact" value={p.emergency} />
            <InfoCell label="Phone" value={p.phone} />
            <InfoCell label="Email" value={p.email} />
            <InfoCell label="City" value={p.city} />
            <InfoCell label="Country" value={p.country} />
            <InfoCell label="Allergies" value={p.allergies} warn={!p.allergies.toLowerCase().includes("none")} />
            <InfoCell label="Chronic Conditions" value={p.chronic} />
            <div className="rx-cell full">
              <label>Current Medications</label>
              <span>{p.currentMeds}</span>
            </div>
          </div>
        </Section>

        <Section icon="📋" title="Consultation Summary">
          {summaryHas ? (
            <>
              <div className="rx-grid g2">
                <InfoCell label="Reason for Consultation" value={s.reason} />
                <InfoCell label="Symptom Duration" value={s.symptomDuration} />
              </div>
              {(s.chiefComplaint || s.notes || s.prevTreatment || s.prevConsultRef) && (
                <div className="rx-block">
                  {s.chiefComplaint ? (
                    <p>
                      <b>Chief Complaint —</b> {s.chiefComplaint}
                    </p>
                  ) : null}
                  {s.notes ? (
                    <p>
                      <b>Notes —</b> {s.notes}
                    </p>
                  ) : null}
                  {s.prevTreatment ? (
                    <p>
                      <b>Previous Treatment —</b> {s.prevTreatment}
                    </p>
                  ) : null}
                  {s.prevConsultRef ? (
                    <p>
                      <b>Previous Consultation —</b> {s.prevConsultRef}
                    </p>
                  ) : null}
                </div>
              )}
            </>
          ) : null}
        </Section>

        <Section icon="🩹" title="Symptoms">
          {symptomsHas ? (
            <>
              {sy.reported.length > 0 ? (
                <div className="rx-tags">
                  {sy.reported.map((tag) => (
                    <span key={tag} className="rx-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="rx-grid" style={{ marginTop: sy.reported.length ? 8 : 0 }}>
                <InfoCell label="Duration" value={sy.duration} />
                <InfoCell label="Severity" value={sy.severity} />
                <InfoCell label="Frequency" value={sy.frequency} />
                <InfoCell label="Progression" value={sy.progression} />
              </div>
              {(sy.associated || sy.aggravating || sy.relieving) && (
                <div className="rx-block">
                  {sy.associated ? (
                    <p>
                      <b>Associated —</b> {sy.associated}
                    </p>
                  ) : null}
                  {sy.aggravating ? (
                    <p>
                      <b>Aggravating factors —</b> {sy.aggravating}
                    </p>
                  ) : null}
                  {sy.relieving ? (
                    <p>
                      <b>Relieving factors —</b> {sy.relieving}
                    </p>
                  ) : null}
                </div>
              )}
            </>
          ) : null}
        </Section>

        <Section icon="🎥" title="Virtual Assessment">
          {examHas ? (
            <>
              <div className="rx-grid">
                <InfoCell label="General Appearance" value={ex.appearance} />
                <InfoCell label="Alertness" value={ex.alertness} />
                <InfoCell label="Speech" value={ex.speech} />
                <InfoCell label="Respiratory Distress" value={ex.respiratory} />
                <InfoCell label="Visible Swelling" value={ex.swelling} />
                <InfoCell label="Skin Findings" value={ex.skin} />
                <InfoCell label="Temperature (home)" value={ex.temp} />
                <InfoCell label="Blood Pressure (home)" value={ex.bp} />
                <InfoCell label="Blood Sugar (home)" value={ex.sugar} />
                <InfoCell label="SpO₂ (oximeter)" value={ex.spo2} />
                <InfoCell label="Heart Rate (home)" value={ex.hr} />
                <InfoCell label="Other Home Data" value={ex.other} />
              </div>
              {ex.observations ? (
                <div className="rx-block">
                  <p>
                    <b>Physician observations —</b> {ex.observations}
                  </p>
                </div>
              ) : null}
            </>
          ) : null}
        </Section>

        <Section icon="🧠" title="Clinical Assessment">
          {assessHas ? (
            <div className="rx-block">
              {as.provisional ? (
                <p>
                  <b>Provisional Diagnosis —</b> {as.provisional}
                  {as.icd10 ? (
                    <span style={{ color: "#0891b2", fontWeight: 600 }}> (ICD-10: {as.icd10})</span>
                  ) : null}
                </p>
              ) : null}
              {as.differential ? (
                <p>
                  <b>Differential —</b> {as.differential}
                </p>
              ) : null}
              {as.impression ? (
                <p>
                  <b>Clinical Impression —</b> {as.impression}
                </p>
              ) : null}
              {as.risk ? (
                <p>
                  <b>Risk Assessment —</b> {as.risk}
                </p>
              ) : null}
            </div>
          ) : null}
        </Section>

        <Section icon="🔬" title="Recommended Investigations">
          {data.investigations.length > 0 ? (
            <div className="rx-tags">
              {data.investigations.map((inv) => (
                <span key={inv} className="rx-tag inv">
                  {inv}
                </span>
              ))}
            </div>
          ) : null}
        </Section>

        <Section icon="💊" title="Prescription">
          <div className="rx-scriptwrap">
            <div className="rx-symbol">
              <span className="sym">℞</span>
              <span className="lab">Medications Prescribed</span>
            </div>
            <table className="rx-mtable">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medicine</th>
                  <th>Strength</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Route</th>
                  <th>Quantity</th>
                  <th>Food</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {data.meds.length ? (
                  data.meds.map((m, i) => (
                    <tr key={`${m.name}-${i}`}>
                      <td>
                        <div className="rx-mno">{i + 1}</div>
                      </td>
                      <td>
                        <div className="rx-mname">{m.name}</div>
                      </td>
                      <td>{m.strength || "—"}</td>
                      <td>{m.dosage || "—"}</td>
                      <td>{m.frequency || "—"}</td>
                      <td>{m.duration || "—"}</td>
                      <td>{m.route || "—"}</td>
                      <td>{m.quantity || "—"}</td>
                      <td>{m.food ? <span className="rx-pill-food">{m.food}</span> : "—"}</td>
                      <td>
                        <span className="rx-mins">{m.instructions || "—"}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", color: "#8296ac", padding: 16 }}>
                      No medications prescribed for this consultation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section icon="📝" title="Advice & Care Plan">
          {adviceItems.length > 0 ? (
            <div className="rx-advice">
              {adviceItems.map(([title, text, cls]) => (
                <div key={title} className={`rx-adv${cls ? ` ${cls}` : ""}`}>
                  <h5>{title}</h5>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          ) : null}
        </Section>

        <Section icon="🔄" title="Follow-up Plan">
          {followHas ? (
            <div className="rx-follow">
              <InfoCell label="Follow-up Required" value={fu.required} />
              <InfoCell label="Follow-up After" value={fu.after} />
              <InfoCell label="Follow-up Date" value={fu.date} />
              <InfoCell label="Recommended Mode" value={fu.type} />
              <InfoCell label="Referral" value={fu.referral} />
              <InfoCell label="Referral Notes" value={fu.referralNotes} />
            </div>
          ) : null}
        </Section>

        {data.doctorNotes.text ? (
          <Section icon="🔏" title="Doctor Notes">
            <div className="rx-privnote">
              <div className="rx-privlabel">
                🔒 {data.doctorNotes.includeInPatient ? "Shared with patient" : "Private — care team only"}
              </div>
              {data.doctorNotes.text}
            </div>
          </Section>
        ) : null}

        <div className="rx-signrow">
          <div className="rx-sign">
            <div className="rx-sig-mark">{data.digitalSignature || d.signature || d.name.replace(/^Dr\.?\s*/i, "")}</div>
            <div className="rx-sig-line">
              <div className="rx-sig-name">{d.name}</div>
              <div className="rx-sig-sub">
                {d.specialization} · Reg. {d.reg}
              </div>
            </div>
            <div className="rx-esign">✔ Electronically signed · {data.issuedAt}</div>
          </div>
          {stamp}
        </div>

        <div className="rx-ft">
          <div className="rx-ft-grid">
            <span>
              🌐 <b>{BRAND.website}</b>
            </span>
            <span>
              ☎ <b>{BRAND.phone}</b>
            </span>
            <span>
              💬 WhatsApp <b>{BRAND.whatsapp}</b>
            </span>
            <span>
              ✉ <b>{BRAND.email}</b>
            </span>
            <span>
              🛟 <b>{BRAND.support}</b>
            </span>
          </div>
          <div className="rx-disc">
            This electronic prescription has been generated through the DrInsight online consultation platform. It is
            electronically signed and linked to the consultation record. Patients should seek immediate medical
            attention if symptoms worsen or in case of a medical emergency.
          </div>
          <div className="rx-copyr">
            © 2026 DrInsight Telehealth. All rights reserved. This document is confidential and intended solely for the
            named patient.
          </div>
        </div>

        <div className="rx-pagefoot">
          {data.rxNo} · {BRAND.name} e-Prescription · Verify at {BRAND.website}/verify · {data.verifyId}
        </div>
      </div>
    </div>
  );
}

export function EPrescriptionViewer({
  data,
  onClose,
  meta,
  actions,
}: {
  data: PrescriptionPreviewData | null;
  onClose: () => void;
  meta?: {
    createdAt?: string;
    updatedAt?: string;
    prescriptionId?: string;
    patientId?: string;
    status?: string;
  };
  actions?: {
    onEdit?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onMarkCompleted?: () => void;
    onShare?: () => void;
  };
}) {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!data) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [data]);

  const statusClass = useMemo(() => (data ? statusChipClass(data.status) : "final"), [data]);

  const handlePrint = () => window.print();

  const handleDownload = () => {
    showToast('Opening print dialog — choose "Save as PDF" to download');
    window.setTimeout(() => window.print(), 350);
  };

  if (!mounted || !data) return null;

  return createPortal(
    <div
      id="rxViewer"
      className="open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="rx-vw-bar">
        <div className="rx-vw-title">
          💊 e-Prescription{" "}
          <span className={`rx-schip ${statusClass}`}>{data.status}</span>{" "}
          <span className="rx-vw-no">{data.rxNo}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {actions?.onEdit ? (
            <button type="button" className="rx-vw-btn" onClick={actions.onEdit}>
              ✏️ Edit
            </button>
          ) : null}
          {actions?.onDuplicate ? (
            <button type="button" className="rx-vw-btn" onClick={actions.onDuplicate}>
              📋 Duplicate
            </button>
          ) : null}
          {actions?.onMarkCompleted ? (
            <button type="button" className="rx-vw-btn green" onClick={actions.onMarkCompleted}>
              ✓ Mark Completed
            </button>
          ) : null}
          {actions?.onShare ? (
            <button type="button" className="rx-vw-btn" onClick={actions.onShare}>
              🔗 Share
            </button>
          ) : null}
          <button type="button" className="rx-vw-btn blue" onClick={handlePrint}>
            🖨️ Print
          </button>
          <button type="button" className="rx-vw-btn green" onClick={handleDownload}>
            ⬇️ Download PDF
          </button>
          {actions?.onDelete ? (
            <button type="button" className="rx-vw-btn" style={{ color: "#dc2626", borderColor: "#fecaca" }} onClick={actions.onDelete}>
              🗑️ Delete
            </button>
          ) : null}
          <button type="button" className="rx-vw-btn x" onClick={onClose}>
            ✕ Close
          </button>
        </div>
      </div>
      {meta?.createdAt || meta?.updatedAt ? (
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            padding: "8px 20px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            fontSize: "0.76rem",
            color: "#64748b",
          }}
        >
          {meta.createdAt ? <span>Created: {formatDateTime(meta.createdAt)}</span> : null}
          {meta.updatedAt ? <span>Updated: {formatDateTime(meta.updatedAt)}</span> : null}
          {meta.status ? <span>Status: {data.status}</span> : null}
        </div>
      ) : null}
      <div className="rx-vw-scroll">
        <RxDocument data={data} />
      </div>
    </div>,
    document.body,
  );
}
