import Link from "next/link";

export default function DoctorNotFound() {
  return (
    <div className="card">
      <div className="card-bd">
        <h3 style={{ marginBottom: 8 }}>Page not found</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--gray-600)", marginBottom: 14 }}>
          This doctor dashboard page does not exist.
        </p>
        <Link href="/doctor" className="ca-btn primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
