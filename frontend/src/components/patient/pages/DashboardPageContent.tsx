"use client";

import Link from "next/link";
import {
  DOCTOR_REPLIES,
  HEALTH_TOOLS,
  RECENT_ACTIVITY,
  SAVED_ARTICLES,
  UPCOMING_CONSULTATIONS,
  VITALS,
} from "@/components/patient/data/patient-demo-data";
import { ConsultationCard, MedicationsList, VitalsGrid } from "@/components/patient/ui/PatientShared";
import { CardLink, DashButton, DashCard, DashPageHeader, GridThree, PersonAvatar, StatCardRow } from "@/components/patient/ui/PatientPrimitives";
import { todayFormatted } from "@/lib/patient-utils";
import { useAuthStore } from "@/store/auth.store";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function DashboardPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName?.split(" ")[0] ?? "Sarah";

  return (
    <>
      <DashPageHeader
        subtitle="🏥 Patient Dashboard"
        title={`Good morning, ${firstName} 👋`}
        dateStr={todayFormatted()}
        actions={
          <>
            <DashButton variant="outline" onClick={() => showToast("Opening Ask Doctor...")}>
              ❓ Ask a Doctor
            </DashButton>
            <Link href="/book-consultation">
              <DashButton variant="solid">📅 Book Consultation</DashButton>
            </Link>
          </>
        }
      />

      <div className="alert-banner">
        <div className="ab-ico">📅</div>
        <div className="ab-text">
          <strong>Consultation Tomorrow — Dr. James Okafor (Neurology)</strong>
          <span>Video call at 3:00 PM EST. Make sure your camera and microphone are working.</span>
        </div>
        <button type="button" className="ab-btn" onClick={() => showToast("Preparing...")}>
          Prepare Now →
        </button>
      </div>

      <StatCardRow
        items={[
          { ic: "ic1", icon: "📅", num: "8", label: "Total Consultations", tag: "2 upcoming", tagClass: "tt-b", bgIcon: "📅" },
          { ic: "ic2", icon: "💬", num: "5", label: "Doctor Replies", tag: "2 new", tagClass: "tt-g", bgIcon: "💬" },
          { ic: "ic3", icon: "🔖", num: "12", label: "Saved Articles", tag: "3 updated", tagClass: "tt-a", bgIcon: "📚" },
          { ic: "ic4", icon: "🔧", num: "8", label: "Health Tools Used", tag: "Score: 78", tagClass: "tt-t", bgIcon: "⚕️" },
        ]}
      />

      <div className="g21">
        <DashCard title="📅 Upcoming Consultations" actions={<CardLink href="/patient/consultations">View All →</CardLink>}>
          <div className="cons-list">
            {UPCOMING_CONSULTATIONS.map((item) => (
              <ConsultationCard key={item.id} item={item} />
            ))}
          </div>
        </DashCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <DashCard title="📊 My Latest Vitals" actions={<CardLink href="/patient/health">Update →</CardLink>}>
            <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", marginBottom: 12 }}>Last recorded: May 28, 2026</div>
            <VitalsGrid vitals={VITALS} />
          </DashCard>

          <DashCard title="💊 Current Medications" actions={<CardLink onClick={() => showToast("Opening medications...")}>Manage →</CardLink>}>
            <MedicationsList />
          </DashCard>
        </div>
      </div>

      <GridThree>
        <DashCard
          title="💬 Doctor Replies"
          headerExtra={
            <span style={{ fontSize: "0.7rem", background: "var(--green)", color: "#fff", padding: "2px 9px", borderRadius: 50, fontWeight: 700 }}>
              2 new
            </span>
          }
        >
          {DOCTOR_REPLIES.map((reply) => (
            <div key={reply.name + reply.time} className="reply-item">
              <div className="reply-meta">
                <PersonAvatar initials={reply.initials} className="reply-av" style={{ background: reply.avatarBg }} seed={reply.name} />
                <span className="reply-name">{reply.name}</span>
                <span className="reply-time">{reply.time}</span>
              </div>
              <div className="reply-q">&quot;{reply.question}&quot;</div>
              <div className="reply-a">{reply.answer}</div>
            </div>
          ))}
        </DashCard>

        <DashCard title="🔖 Saved Articles" actions={<CardLink href="/patient/articles">All →</CardLink>}>
          {SAVED_ARTICLES.map((art) => (
            <div key={art.title} className="art-item">
              <div className="art-thumb" style={{ background: `linear-gradient(135deg,${art.bg})` }}>
                {art.emoji}
              </div>
              <div className="art-info">
                <div className="art-cat">{art.cat}</div>
                <div className="art-title">{art.title}</div>
                <div className="art-meta">{art.meta}</div>
                <div className="art-bar">
                  <div className="art-fill" style={{ width: `${art.pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </DashCard>

        <DashCard title="⚡ Recent Activity" actions={<CardLink onClick={() => showToast("Opening activity...")}>All →</CardLink>}>
          {RECENT_ACTIVITY.map((act) => (
            <div key={act.text} className="act-item">
              <div className={`act-dot ${act.dot}`}>{act.icon}</div>
              <div className="act-text">
                <p dangerouslySetInnerHTML={{ __html: act.text }} />
                <span>{act.time}</span>
              </div>
            </div>
          ))}
        </DashCard>
      </GridThree>

      <DashCard title="🔧 Health Tools" actions={<CardLink href="/health-tools">All tools →</CardLink>}>
        <div className="tools-grid">
          {HEALTH_TOOLS.map((tool) => (
            <button
              key={tool.name}
              type="button"
              className="tool-card"
              onClick={() => showToast(tool.toast)}
              style={{ border: "none", width: "100%", textAlign: "left", fontFamily: "inherit" }}
            >
              <div className="tc-ico">{tool.icon}</div>
              <div className="tc-text">
                <strong>{tool.name}</strong>
                <span>{tool.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </DashCard>
    </>
  );
}
