"use client";

import { DashCard, DashPageHeader, GridTwo, PersonAvatar } from "@/components/doctor/ui/DoctorPrimitives";
import { todayFormatted } from "@/lib/doctor-utils";

const REVIEWS = [
  ["Sara Malik", "SM", "linear-gradient(135deg,#e11d48,#f43f5e)", "Explained my condition in terms I could actually understand. Excellent doctor.", "June 3, 2026 · Video"],
  ["Fatima Khan", "FK", "linear-gradient(135deg,#059669,#10b981)", "Very thorough and patient. Best cardiology consultation I have had.", "June 1, 2026 · Phone"],
  ["Ahmed Raza", "AR", "linear-gradient(135deg,#7c3aed,#8b5cf6)", "Fast response to my urgent query. Felt genuinely cared for.", "May 28, 2026 · Chat"],
];

export function ReviewsPageContent() {
  return (
    <>
      <DashPageHeader subtitle="👨‍⚕️ Physician Dashboard" title="Reviews & Ratings" dateStr={todayFormatted()} />

      <GridTwo>
        <DashCard title="⭐ Patient Reviews">
          <div className="rev-summary">
            <div className="rev-big">4.9</div>
            <div>
              <div className="stars-row">★★★★★</div>
              <div style={{ fontSize: "0.74rem", color: "var(--gray-400)" }}>Based on 312 reviews</div>
            </div>
          </div>
          {REVIEWS.map(([name, initials, bg, text, date]) => (
            <div key={name} className="rev-item">
              <div className="rev-hd">
                <PersonAvatar initials={initials} className="rev-av" style={{ background: bg }} seed={name} />
                <span className="rev-name">{name}</span>
                <span className="rev-stars">★★★★★</span>
              </div>
              <div className="rev-text">&quot;{text}&quot;</div>
              <div className="rev-date">{date}</div>
            </div>
          ))}
        </DashCard>

        <DashCard title="📊 Rating Breakdown">
          {[
            [5, 87],
            [4, 9],
            [3, 3],
            [2, 1],
            [1, 0],
          ].map(([stars, pct]) => (
            <div key={stars} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: "0.78rem", width: 15 }}>{stars}★</span>
              <div style={{ flex: 1, height: 8, background: "var(--gray-200)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "var(--amber)", borderRadius: 4 }} />
              </div>
              <span style={{ fontSize: "0.74rem", color: "var(--gray-400)", width: 30 }}>{pct}%</span>
            </div>
          ))}
        </DashCard>
      </GridTwo>
    </>
  );
}
