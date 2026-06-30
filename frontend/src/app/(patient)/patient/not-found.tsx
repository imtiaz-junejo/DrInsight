import Link from "next/link";

export default function PatientNotFound() {
  return (
    <div className="card">
      <div className="card-bd">
        <h3 style={{ marginBottom: 8 }}>Page not found</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--gray-600)", marginBottom: 14 }}>
          This patient dashboard page does not exist.
        </p>
        <Link href="/patient" className="ca-btn primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
