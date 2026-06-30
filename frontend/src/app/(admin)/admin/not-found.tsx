import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="panel">
      <div className="panel-bd">
        <h3 style={{ marginBottom: 8 }}>Page not found</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--gray-600)", marginBottom: 14 }}>
          This admin page does not exist.
        </p>
        <Link href="/admin" className="btn primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
