"use client";

import Link from "next/link";

export default function PatientError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card">
      <div className="card-bd">
        <h3 style={{ marginBottom: 8 }}>Something went wrong</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--gray-600)", marginBottom: 14 }}>
          Unable to load this patient dashboard page. Please try again.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className="ca-btn primary" onClick={reset}>
            Retry
          </button>
          <Link href="/patient" className="ca-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
