"use client";

import { AdminButton, FormItem } from "@/components/admin/ui/AdminPrimitives";
import type { MedicalReviewer } from "@/services/editorial-api-hooks";

export function AssignmentModal({
  title,
  reviewers,
  loading,
  onClose,
  onAssign,
}: {
  title: string;
  reviewers: MedicalReviewer[];
  loading?: boolean;
  onClose: () => void;
  onAssign: (reviewerId: string) => void;
}) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <h3>{title}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-bd">
          <FormItem label="Select Medical Reviewer">
            <select id="assignment-reviewer-select" defaultValue="">
              <option value="" disabled>
                Choose reviewer...
              </option>
              {reviewers.map((r) => (
                <option key={r.user.id} value={r.user.id}>
                  Dr. {r.user.firstName} {r.user.lastName}
                  {r.specialty || r.user.doctorProfile?.specialty
                    ? ` — ${r.specialty ?? r.user.doctorProfile?.specialty}`
                    : ""}
                  {r.tier ? ` (Tier ${r.tier})` : ""}
                </option>
              ))}
            </select>
          </FormItem>
        </div>
        <div className="modal-ft">
          <AdminButton onClick={onClose}>Cancel</AdminButton>
          <AdminButton
            variant="primary"
            onClick={() => {
              const select = document.getElementById("assignment-reviewer-select") as HTMLSelectElement;
              if (select?.value) onAssign(select.value);
            }}
          >
            {loading ? "Assigning..." : "Assign Reviewer"}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
