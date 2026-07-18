"use client";

import { AdminButton } from "@/components/admin/ui/AdminPrimitives";
import { formatDate } from "@/lib/data-mappers";

export interface VersionTimelineItem {
  id: string;
  versionNumber: string;
  changeLog?: string | null;
  isCurrent: boolean;
  createdAt: string;
  createdBy?: { firstName: string; lastName: string };
}

export function VersionTimeline({
  versions,
  onRollback,
}: {
  versions: VersionTimelineItem[];
  onRollback?: (versionId: string) => void;
}) {
  if (!versions.length) return <p className="empty-state">No version history yet.</p>;

  return (
    <div className="version-timeline">
      {versions.map((v) => (
        <div key={v.id} className={`version-item${v.isCurrent ? " current" : ""}`}>
          <div className="version-marker" />
          <div className="version-body">
            <div className="version-hd">
              <strong>v{v.versionNumber}</strong>
              {v.isCurrent ? <span className="chip ch-g">Current</span> : null}
            </div>
            <div className="version-meta">
              {v.createdBy ? `${v.createdBy.firstName} ${v.createdBy.lastName} · ` : ""}
              {formatDate(v.createdAt)}
            </div>
            {v.changeLog ? <p className="version-log">{v.changeLog}</p> : null}
            {!v.isCurrent && onRollback ? (
              <AdminButton onClick={() => onRollback(v.id)}>Rollback to this version</AdminButton>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
