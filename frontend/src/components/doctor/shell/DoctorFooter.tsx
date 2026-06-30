"use client";

import Link from "next/link";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { patientStatusLabel } from "@/lib/doctor-utils";

export function DoctorFooter() {
  return (
    <footer>
      <div className="footer-main">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo" style={{ color: "#fff", marginBottom: 14 }}>
              <div className="logo-icon">✚</div>
              MedAuthority
            </div>
            <p>
              Your trusted platform for evidence-based medical information, expert doctor consultations, and health
              tools — reviewed and approved by licensed physicians.
            </p>
            <div className="footer-badges">
              <span className="footer-badge">🛡️ HIPAA Compliant</span>
              <span className="footer-badge">🇪🇺 GDPR Compliant</span>
            </div>
            <div className="footer-social">
              <a href="#" className="social-btn">
                𝕏
              </a>
              <a href="#" className="social-btn">
                f
              </a>
              <a href="#" className="social-btn">
                in
              </a>
              <a href="#" className="social-btn">
                ▶
              </a>
              <a href="#" className="social-btn">
                📸
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/health-tools">Health Tools</Link>
              </li>
              <li>
                <Link href="/ask-doctor">Ask the Doctor</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/book-consultation">Book Consultation</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Medical Categories</h4>
            <ul>
              <li>
                <a href="#">Clinical Specialties</a>
              </li>
              <li>
                <a href="#">Surgical Specialties</a>
              </li>
              <li>
                <a href="#">Diagnostic Specialties</a>
              </li>
              <li>
                <a href="#">Preventive Health</a>
              </li>
              <li>
                <a href="#">Mental Health</a>
              </li>
              <li>
                <a href="#">Women&apos;s Health</a>
              </li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact Information</h4>
            <div className="footer-contact-item">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              +1 (800) MED-HELP (633-4357)
            </div>
            <div className="footer-contact-item">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              contact@medauthority.com
            </div>
            <div className="footer-contact-item" style={{ color: "#25d366" }}>
              📱 WhatsApp: +1 (800) 633-4357
            </div>
          </div>
          <div className="footer-col">
            <h4>Expert Health Insights</h4>
            <p style={{ fontSize: "0.82rem", marginBottom: 14, lineHeight: 1.6 }}>
              Get the latest medical news and health tips delivered weekly to your inbox.
            </p>
            <div className="footer-subscribe">
              <input type="email" placeholder="your@email.com" />
              <button type="button">Subscribe Free →</button>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div>
          <p>© 2026 MedAuthority. All rights reserved.</p>
          <p style={{ marginTop: 4, fontSize: "0.75rem", color: "#475569" }}>
            ⚕️ The content on MedAuthority is for informational purposes only and is not a substitute for professional
            medical advice, diagnosis, or treatment.
          </p>
        </div>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Medical Disclaimer</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}

export function PatientDetailModal() {
  const patient = useDoctorUiStore((s) => s.patientModal);
  const closePatientModal = useDoctorUiStore((s) => s.closePatientModal);
  const showToast = useDoctorUiStore((s) => s.showToast);

  if (!patient) return null;

  const status = patientStatusLabel(patient.status);
  const genderLabel = patient.gender === "M" ? "Male" : "Female";

  return (
    <div
      className={`modal-ov${patient ? " show" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePatientModal();
      }}
    >
      <div className="modal">
        <div className="modal-hd">
          <div className="modal-av" style={{ background: patient.avatarBg }}>
            {patient.initials}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--gray-900)" }}>
              {patient.name}
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--blue)", fontWeight: 600 }}>{patient.diagnosis}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>#PT-2891 · Patient since March 2024</div>
          </div>
          <button type="button" className="modal-close" onClick={closePatientModal}>
            ✕
          </button>
        </div>
        <div className="modal-bd">
          <div className="msec">
            <h4>📊 Latest Vitals</h4>
            <div className="vitals-grid-m">
              {[
                ["148/92", "mmHg", "Blood Pressure", "vb-h", "High"],
                ["78", "bpm", "Heart Rate", "vb-n", "Normal"],
                ["96%", "SpO₂", "Oxygen Sat.", "vb-l", "Borderline"],
                ["36.8", "°C", "Temperature", "vb-n", "Normal"],
                ["68", "kg", "Weight", "vb-n", "Stable"],
                ["27.1", "kg/m²", "BMI", "vb-n", "Normal"],
              ].map(([val, unit, label, badge, badgeLabel]) => (
                <div key={label} className="vital-box">
                  <div className="v-val">{val}</div>
                  <div className="v-unit">{unit}</div>
                  <div className="v-label">{label}</div>
                  <div className={`v-badge ${badge}`}>{badgeLabel}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="msec">
            <h4>👤 Patient Information</h4>
            <div className="info-grid">
              <div className="ii">
                <label>Full Name</label>
                <span>{patient.name}</span>
              </div>
              <div className="ii">
                <label>Age / Gender</label>
                <span>
                  {patient.age} / {genderLabel}
                </span>
              </div>
              <div className="ii">
                <label>Diagnosis</label>
                <span>{patient.diagnosis}</span>
              </div>
              <div className="ii">
                <label>Status</label>
                <span style={{ color: status.color, fontWeight: 700 }}>
                  {status.label}
                </span>
              </div>
              <div className="ii">
                <label>Blood Group</label>
                <span>A+</span>
              </div>
              <div className="ii">
                <label>Allergies</label>
                <span>Penicillin, Sulfa drugs</span>
              </div>
            </div>
          </div>
          <div className="msec">
            <h4>💊 Current Medications</h4>
            <div className="med-list">
              {[
                ["Furosemide 40mg", "Once daily — Morning"],
                ["Carvedilol 6.25mg", "Twice daily — With meals"],
                ["Lisinopril 5mg", "Once daily — Evening"],
              ].map(([name, dose]) => (
                <div key={name} className="med-row">
                  <div>
                    <div className="med-n">{name}</div>
                    <div className="med-d">{dose}</div>
                  </div>
                  <span className="st-chip st-active">Active</span>
                </div>
              ))}
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-blue-m" onClick={() => showToast("Opening video call...")}>
              📹 Start Consultation
            </button>
            <button type="button" className="btn-out-m" onClick={() => showToast("Note editor opened")}>
              📝 Add Note
            </button>
            <button type="button" className="btn-out-m" onClick={() => showToast("Prescription pad opened")}>
              💊 Prescribe
            </button>
            <button
              type="button"
              style={{
                background: "#fef2f2",
                color: "var(--red)",
                border: "1.5px solid #fecaca",
                padding: "11px 18px",
                borderRadius: 10,
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                flex: 1,
              }}
              onClick={() => showToast("Patient flagged as critical")}
            >
              🚨 Flag Critical
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
