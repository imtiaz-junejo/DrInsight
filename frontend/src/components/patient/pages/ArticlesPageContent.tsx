"use client";

import Link from "next/link";
import { SAVED_ARTICLES_FULL } from "@/components/patient/data/patient-demo-data";
import { ActionButton, DashButton, DashCard, DashPageHeader } from "@/components/patient/ui/PatientPrimitives";
import { todayFormatted } from "@/lib/patient-utils";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function ArticlesPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title="Saved Articles"
        dateStr={todayFormatted()}
        actions={
          <Link href="/blog">
            <DashButton variant="solid">Browse More →</DashButton>
          </Link>
        }
      />

      <DashCard
        title="🔖 Reading List"
        headerExtra={<span style={{ fontSize: "0.76rem", color: "var(--gray-400)" }}>12 articles saved</span>}
      >
        {SAVED_ARTICLES_FULL.map((art) => (
          <div key={art.title} className="art-item">
            <div className="art-thumb" style={{ background: `linear-gradient(135deg,${art.bg})` }}>
              {art.emoji}
            </div>
            <div className="art-info">
              <div className="art-cat">{art.cat}</div>
              <div className="art-title">{art.title}</div>
              <div className="art-meta">
                By {art.by} · {art.date} · {art.rt} read
              </div>
              <div className="art-bar">
                <div className="art-fill" style={{ width: `${art.pct}%` }} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
              <ActionButton variant="primary" onClick={() => showToast("Opening article...")}>
                Read →
              </ActionButton>
              <ActionButton variant="danger" onClick={() => showToast("Article removed")}>
                Remove
              </ActionButton>
            </div>
          </div>
        ))}
      </DashCard>
    </>
  );
}
