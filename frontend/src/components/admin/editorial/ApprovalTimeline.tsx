"use client";

import { StatusChip } from "@/components/admin/ui/AdminPrimitives";
import { formatDate } from "@/lib/data-mappers";
import {
  STAGE_LABELS,
  type EditorialReviewStage,
  type MedicalReviewStage,
} from "@/services/editorial-api-hooks";

const STAGE_CHIP: Record<string, string> = {
  PENDING: "ch-gray",
  IN_PROGRESS: "ch-a",
  COMPLETED: "ch-g",
  REJECTED: "ch-r",
  SKIPPED: "ch-gray",
};

export function ApprovalTimeline({ stages }: { stages: MedicalReviewStage[] }) {
  return (
    <div className="approval-timeline">
      {stages.map((stage, index) => (
        <div key={stage.id} className="approval-stage">
          {index < stages.length - 1 ? <div className="approval-connector" /> : null}
          <div className="approval-node">
            <StatusChip label={STAGE_LABELS[stage.stage as EditorialReviewStage]} className="ch-p" />
            <StatusChip label={stage.status.replace(/_/g, " ")} className={STAGE_CHIP[stage.status] ?? "ch-gray"} />
          </div>
          <div className="approval-details">
            <div>
              <span className="approval-label">Reviewer</span>
              <span>
                {stage.reviewer
                  ? `Dr. ${stage.reviewer.firstName} ${stage.reviewer.lastName}`
                  : "Unassigned"}
              </span>
            </div>
            <div>
              <span className="approval-label">Review Date</span>
              <span>{stage.reviewDate ? formatDate(stage.reviewDate) : "—"}</span>
            </div>
            <div>
              <span className="approval-label">Due Date</span>
              <span>{stage.dueDate ? formatDate(stage.dueDate) : "—"}</span>
            </div>
            {stage.notes ? (
              <div>
                <span className="approval-label">Notes</span>
                <span>{stage.notes}</span>
              </div>
            ) : null}
            {stage.medicalNotes ? (
              <div>
                <span className="approval-label">Medical Notes</span>
                <span>{stage.medicalNotes}</span>
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
