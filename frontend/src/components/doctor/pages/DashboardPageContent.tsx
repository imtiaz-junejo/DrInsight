"use client";

import Link from "next/link";
import {
  CardLink,
  DashButton,
  DashCard,
  DashPageHeader,
  EarningsChart,
  PersonAvatar,
  StatCardRow,
} from "@/components/doctor/ui/DoctorPrimitives";
import { EARNINGS_CHART, QA_PENDING, SCHEDULE_ITEMS } from "@/components/doctor/data/doctor-demo-data";
import { doctorDisplayName, todayFormatted, todayShortFormatted } from "@/lib/doctor-utils";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { useAuthStore } from "@/store/auth.store";

function ScheduleList({ compact }: { compact?: boolean }) {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientModal = useDoctorUiStore((s) => s.openPatientModal);

  return (
    <>
      {SCHEDULE_ITEMS.map((item) => (
        <div key={item.time + item.name} className="sch-item">
          <div className="sch-time">{item.time}</div>
          <PersonAvatar initials={item.initials} seed={item.name} className="sch-av" style={{ background: item.avatarBg }} />
          <div className="sch-info">
            <div className="sch-name">{item.name}</div>
            <div className="sch-sub">{item.sub}</div>
          </div>
          <span className={`sch-chip ${item.chip}`}>{item.chipLabel}</span>
          {item.chip === "sc-pend" ? (
            <button type="button" className="sch-btn" onClick={() => showToast("Consultation confirmed!")}>
              Confirm
            </button>
          ) : (
            <button
              type="button"
              className={`sch-btn${item.live ? " go" : ""}`}
              onClick={() => {
                if (item.live) showToast("Joining video call...");
                else if (item.patient) openPatientModal(item.patient);
                else showToast("Preparing...");
              }}
            >
              {item.live ? "Join →" : compact ? "Prep" : "Prep"}
            </button>
          )}
        </div>
      ))}
    </>
  );
}

export function DashboardPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientModal = useDoctorUiStore((s) => s.openPatientModal);
  const user = useAuthStore((s) => s.user);
  const displayName = doctorDisplayName(user?.firstName, user?.lastName);

  return (
    <>
      <DashPageHeader
        subtitle="👨‍⚕️ Physician Dashboard"
        title={`Good morning, ${displayName} 👨‍⚕️`}
        dateStr={todayFormatted()}
        actions={
          <>
            <DashButton variant="outline" onClick={() => showToast("Opening video call...")}>
              📹 Start Consultation
            </DashButton>
            <Link href="/doctor/submit-article">
              <DashButton variant="solid">✍️ Submit Article</DashButton>
            </Link>
          </>
        }
      />

      <StatCardRow
        items={[
          { ic: "ic1", icon: "👥", num: "142", label: "Total Patients", tag: "+8 this month", tagClass: "tt-b", bgIcon: "👥" },
          { ic: "ic2", icon: "📅", num: "6", label: "Today's Consultations", tag: "3 remaining", tagClass: "tt-g", bgIcon: "📅" },
          { ic: "ic3", icon: "💬", num: "12", label: "Pending Q&A Replies", tag: "Needs attention", tagClass: "tt-r", bgIcon: "💬" },
          { ic: "ic2", icon: "💰", num: "$3,240", label: "This Month's Earnings", tag: "↑ 18% vs last", tagClass: "tt-g", bgIcon: "💰" },
        ]}
      />

      <div className="g21-dr">
        <DashCard title={`📅 Today's Schedule — ${todayShortFormatted()}`} actions={<CardLink onClick={() => showToast("Opening calendar...")}>Full calendar →</CardLink>}>
          <ScheduleList />
        </DashCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <DashCard title="💰 Earnings Overview" actions={<CardLink href="/doctor/earnings">Details →</CardLink>}>
            <div className="earn-grid">
              <div className="earn-box">
                <div className="earn-n">$3,240</div>
                <div className="earn-l">This Month</div>
                <div className="earn-s" style={{ color: "var(--green)" }}>
                  ↑ 18%
                </div>
              </div>
              <div className="earn-box">
                <div className="earn-n">$38,120</div>
                <div className="earn-l">This Year</div>
                <div className="earn-s" style={{ color: "var(--blue)" }}>
                  On track
                </div>
              </div>
              <div className="earn-box">
                <div className="earn-n">$840</div>
                <div className="earn-l">Pending</div>
                <div className="earn-s" style={{ color: "var(--amber)" }}>
                  Processing
                </div>
              </div>
            </div>
            <div style={{ fontSize: "0.74rem", color: "var(--gray-400)", marginBottom: 6 }}>Monthly earnings (last 6 months)</div>
            <EarningsChart data={EARNINGS_CHART} />
          </DashCard>

          <DashCard title="⭐ Patient Reviews" actions={<CardLink href="/doctor/reviews">All →</CardLink>}>
            <div className="rev-summary">
              <div className="rev-big">4.9</div>
              <div>
                <div className="stars-row">★★★★★</div>
                <div style={{ fontSize: "0.74rem", color: "var(--gray-400)" }}>Based on 312 reviews</div>
              </div>
            </div>
            {[
              ["Sara Malik", "SM", "linear-gradient(135deg,#e11d48,#f43f5e)", "Explained my condition in terms I could actually understand. Excellent doctor.", "June 3, 2026 · Video Consultation"],
              ["Fatima Khan", "FK", "linear-gradient(135deg,#059669,#10b981)", "Very thorough and patient. Best cardiology consultation I have had.", "June 1, 2026 · Phone Consultation"],
            ].map(([name, initials, bg, text, date]) => (
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
        </div>
      </div>

      <div className="g13">
        <DashCard
          title={
            <>
              💬 Patient Questions — Awaiting Reply{" "}
              <span style={{ fontSize: "0.72rem", background: "var(--red)", color: "#fff", padding: "2px 8px", borderRadius: 50, marginLeft: 4 }}>
                12
              </span>
            </>
          }
          actions={<CardLink href="/doctor/questions">View all →</CardLink>}
        >
          {QA_PENDING.map((q) => (
            <div key={q.name + q.spec} className="qa-item">
              <div className="qa-top">
                <PersonAvatar initials={q.initials} className="qa-av" style={{ background: q.avatarBg }} seed={q.name} />
                <div className="qa-meta">
                  <div className="qa-pname">
                    {q.name}
                    {q.urgent ? <span className="qa-urgent">⚡ Urgent</span> : null}
                  </div>
                  <div className="qa-spec">{q.spec}</div>
                </div>
              </div>
              <div className="qa-q">&quot;{q.question}&quot;</div>
              <div className="qa-actions">
                <button type="button" className="qa-btn reply" onClick={() => showToast("Reply editor opened")}>
                  ✏️ Reply Now
                </button>
                <button type="button" className="qa-btn" onClick={() => openPatientModal(q.modal)}>
                  📋 Patient File
                </button>
                <button type="button" className="qa-btn" onClick={() => showToast("Calling patient...")}>
                  📞 Call
                </button>
              </div>
            </div>
          ))}
        </DashCard>

        <DashCard title="📰 My Articles" actions={<CardLink href="/doctor/articles">All 47 →</CardLink>}>
          {[
            ["Hypertension Management Guidelines 2025", "14.2K views · 4.9 ★ · Jun 1, 2026", "as-live", "Live", "❤️", "#fce7f3,#fbcfe8"],
            ["Beta Blockers: Complete Clinical Guide", "8.7K views · 4.8 ★ · May 20, 2026", "as-live", "Live", "💊", "#dbeafe,#bfdbfe"],
            ["ECG Interpretation for Beginners", "Draft · Last edited today", "as-draft", "Draft", "🔬", "#fef3c7,#fde68a"],
            ["Heart Failure: A Patient's Guide", "Under Review · Submitted Jun 3", "as-review", "Review", "📋", "#f5f3ff,#ede9fe"],
          ].map(([title, meta, statusClass, statusLabel, emoji, bg]) => (
            <div key={title} className="art-item">
              <div className="art-thumb" style={{ background: `linear-gradient(135deg,${bg})` }}>
                {emoji}
              </div>
              <div className="art-info">
                <div className="art-title">{title}</div>
                <div className="art-meta">{meta}</div>
              </div>
              <span className={`art-status ${statusClass}`}>{statusLabel}</span>
            </div>
          ))}
        </DashCard>
      </div>
    </>
  );
}
