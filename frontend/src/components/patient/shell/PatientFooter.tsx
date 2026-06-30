"use client";

import Link from "next/link";
import { usePatientUiStore } from "@/store/patient-ui.store";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"];

export function PatientFooter() {
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

export function ConsultationModal() {
  const open = usePatientUiStore((s) => s.consultationModalOpen);
  const closeConsultationModal = usePatientUiStore((s) => s.closeConsultationModal);
  const showToast = usePatientUiStore((s) => s.showToast);

  if (!open) return null;

  return (
    <div
      className="modal-ov show"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeConsultationModal();
      }}
    >
      <div className="modal">
        <div className="modal-hd">
          <div className="m-av" style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
            PS
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--gray-900)" }}>
              Consultation Summary
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--blue)", fontWeight: 600 }}>Dr. Priya Sharma — Endocrinology</div>
            <div style={{ fontSize: "0.7rem", color: "var(--gray-400)" }}>May 28, 2026 · Chat · 25 minutes</div>
          </div>
          <button type="button" className="modal-close" onClick={closeConsultationModal}>
            ✕
          </button>
        </div>
        <div className="modal-bd">
          <div className="msec">
            <h4>📋 Consultation Details</h4>
            <div className="info-grid">
              <div className="ii">
                <label>Reason for Visit</label>
                <span>HbA1c review — Pre-diabetes monitoring</span>
              </div>
              <div className="ii">
                <label>Duration</label>
                <span>25 minutes</span>
              </div>
              <div className="ii">
                <label>Type</label>
                <span>💬 Chat Consultation</span>
              </div>
              <div className="ii">
                <label>Status</label>
                <span style={{ color: "var(--green)", fontWeight: 700 }}>✓ Completed</span>
              </div>
            </div>
          </div>
          <div className="msec">
            <h4>📝 Doctor&apos;s Notes &amp; Findings</h4>
            <div
              style={{
                background: "var(--gray-50)",
                borderRadius: 10,
                padding: 14,
                border: "1px solid var(--gray-200)",
                fontSize: "0.84rem",
                color: "var(--gray-800)",
                lineHeight: 1.75,
              }}
            >
              <p>
                <strong>Chief Complaint:</strong> Patient reports increased fatigue and occasional blurred vision. HbA1c
                results reviewed — 6.2% (pre-diabetic range).
              </p>
              <br />
              <p>
                <strong>Assessment:</strong> Pre-diabetes (IFG). No overt Type 2 Diabetes at this stage.
              </p>
              <br />
              <p>
                <strong>Plan:</strong> Continue lifestyle interventions. Increase physical activity to 150 min/week.
                Recheck HbA1c in 3 months. Metformin 500mg BD initiated as preventive measure.
              </p>
            </div>
          </div>
          <div className="msec">
            <h4>💊 Prescription Issued</h4>
            <div
              style={{
                background: "#f0fdf4",
                borderRadius: 10,
                padding: "12px 14px",
                border: "1px solid #bbf7d0",
                fontSize: "0.84rem",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 3 }}>Metformin 500mg</div>
              <div style={{ fontSize: "0.76rem", color: "var(--gray-500)" }}>
                Twice daily with meals · 3-month supply · Refill as needed
              </div>
            </div>
          </div>
          <div className="msec">
            <h4>📅 Consultation History</h4>
            <div className="tl-list">
              <div className="tl-item">
                <div className="tl-dot">💬</div>
                <div>
                  <div className="tl-t">Chat Consultation — Pre-diabetes review</div>
                  <div className="tl-s">May 28, 2026 · Dr. Priya Sharma · 25 min</div>
                  <div className="tl-note">HbA1c 6.2% — pre-diabetic. Metformin initiated.</div>
                </div>
              </div>
              <div className="tl-item">
                <div className="tl-dot">📹</div>
                <div>
                  <div className="tl-t">Video Consultation — Initial endocrine assessment</div>
                  <div className="tl-s">March 10, 2026 · Dr. Priya Sharma · 40 min</div>
                  <div className="tl-note">Fatigue and weight changes investigated. Full blood panel ordered.</div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-bm" onClick={() => showToast("Follow-up booking opened")}>
              🔄 Book Follow-up
            </button>
            <button type="button" className="btn-om" onClick={() => showToast("Prescription opened")}>
              💊 Prescription
            </button>
            <button type="button" className="btn-om" onClick={() => showToast("PDF downloading...")}>
              📄 Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReviewModal() {
  const open = usePatientUiStore((s) => s.reviewModalOpen);
  const rating = usePatientUiStore((s) => s.reviewRating);
  const closeReviewModal = usePatientUiStore((s) => s.closeReviewModal);
  const setReviewRating = usePatientUiStore((s) => s.setReviewRating);
  const showToast = usePatientUiStore((s) => s.showToast);

  if (!open) return null;

  const handleSubmit = () => {
    if (!rating) {
      showToast("⚠️ Please select a star rating");
      return;
    }
    closeReviewModal();
    showToast("✓ Review submitted — thank you!");
  };

  return (
    <div
      className="modal-ov show"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeReviewModal();
      }}
    >
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-hd">
          <div className="m-av" style={{ background: "linear-gradient(135deg,#059669,#10b981)" }}>
            PS
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--gray-900)" }}>
              Leave a Review
            </div>
            <div style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>Dr. Priya Sharma · Consultation May 28, 2026</div>
          </div>
          <button type="button" className="modal-close" onClick={closeReviewModal}>
            ✕
          </button>
        </div>
        <div className="modal-bd">
          <div className="msec">
            <h4>⭐ Rate Your Experience</h4>
            <div className="star-row">
              {[1, 2, 3, 4, 5].map((v) => (
                <span
                  key={v}
                  className={v <= rating ? "on" : ""}
                  role="button"
                  tabIndex={0}
                  onClick={() => setReviewRating(v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setReviewRating(v);
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <p
              style={{
                fontSize: "0.78rem",
                color: rating >= 4 ? "var(--green)" : rating === 3 ? "var(--amber)" : rating > 0 ? "var(--red)" : "var(--gray-400)",
              }}
            >
              {rating ? `${RATING_LABELS[rating]} (${rating}/5)` : "Click a star to rate"}
            </p>
          </div>
          <div className="msec">
            <h4>💬 Your Feedback</h4>
            <textarea className="review-ta" placeholder="Share your experience with Dr. Sharma..." />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn-bm" onClick={handleSubmit}>
              ✓ Submit Review
            </button>
            <button type="button" className="btn-om" onClick={closeReviewModal}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
