"use client";

import { AdminButton } from "@/components/admin/ui/AdminPrimitives";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="panel">
      <div className="panel-bd">
        <h3 style={{ marginBottom: 8 }}>Something went wrong</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--gray-600)", marginBottom: 14 }}>
          Unable to load this admin page. Please try again.
        </p>
        <AdminButton variant="primary" onClick={reset}>
          Retry
        </AdminButton>
      </div>
    </div>
  );
}
