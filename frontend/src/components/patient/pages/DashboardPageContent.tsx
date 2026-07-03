"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ConsultationCard, EmptyState, MedicationsList, VitalsGrid, type VitalItem } from "@/components/patient/ui/PatientShared";
import { CardLink, DashButton, DashCard, DashPageHeader, GridThree, PersonAvatar, StatCardRow } from "@/components/patient/ui/PatientPrimitives";
import { formatDate, formatDateTime, mapAppointmentToConsultation, mapBlogPostToCard } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import { useBlogPosts, useNotifications } from "@/services/api-hooks";
import type { AuthProfile } from "@/services/patient-api-hooks";
import { useAuthProfile, usePatientAppointments, usePatientPrescriptions } from "@/services/patient-api-hooks";
import { useAuthStore } from "@/store/auth.store";
import { usePatientUiStore } from "@/store/patient-ui.store";

const HEALTH_TOOLS = [
  { icon: "⚖️", name: "BMI Calculator", sub: "Check your BMI", toast: "Opening BMI Calculator..." },
  { icon: "❤️", name: "Heart Risk", sub: "Assess cardiovascular risk", toast: "Opening Heart Risk..." },
  { icon: "🩸", name: "Diabetes Risk", sub: "Screen diabetes risk", toast: "Opening Diabetes Risk..." },
  { icon: "🫁", name: "Lung Age", sub: "Estimate lung age", toast: "Opening Lung Age..." },
  { icon: "🧠", name: "Mental Health", sub: "PHQ-9 screening", toast: "Opening Mental Health..." },
  { icon: "🔎", name: "Symptom Checker", sub: "Try it now", toast: "Opening Symptom Checker..." },
] as const;

const UPCOMING_STATUSES = new Set(["CONFIRMED", "PENDING", "IN_PROGRESS"]);

function buildProfileVitals(patientProfile: AuthProfile["patientProfile"]): VitalItem[] {
  if (!patientProfile) return [];
  const items: VitalItem[] = [];
  if (patientProfile.bloodGroup) {
    items.push({ val: patientProfile.bloodGroup, unit: "", label: "Blood Group", badge: "vb-n", badgeLabel: "On file" });
  }
  if (patientProfile.allergies?.length) {
    items.push({ val: patientProfile.allergies.join(", "), unit: "", label: "Allergies", badge: "vb-l", badgeLabel: "Listed" });
  }
  if (patientProfile.gender) {
    items.push({ val: patientProfile.gender, unit: "", label: "Gender", badge: "vb-n", badgeLabel: "On file" });
  }
  if (patientProfile.dateOfBirth) {
    items.push({ val: formatDate(patientProfile.dateOfBirth), unit: "", label: "Date of Birth", badge: "vb-n", badgeLabel: "On file" });
  }
  if (patientProfile.medicalHistory) {
    items.push({ val: patientProfile.medicalHistory, unit: "", label: "Medical History", badge: "vb-n", badgeLabel: "On file" });
  }
  return items;
}

export function DashboardPageContent() {
  const showToast = usePatientUiStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const profileQuery = useAuthProfile();
  const appointmentsQuery = usePatientAppointments({ limit: 50 });
  const prescriptionsQuery = usePatientPrescriptions();
  const notificationsQuery = useNotifications();
  const blogQuery = useBlogPosts({ limit: 3 });

  const firstName = profileQuery.data?.firstName?.split(" ")[0] ?? user?.firstName?.split(" ")[0] ?? "there";

  const appointments = appointmentsQuery.data?.data ?? [];
  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => UPCOMING_STATUSES.has(a.status))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [appointments],
  );
  const upcomingMapped = upcoming.slice(0, 2).map((a) => mapAppointmentToConsultation(a));
  const nextAppointment = upcoming[0];

  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const articles = (blogQuery.data?.data ?? []).map(mapBlogPostToCard);
  const profileVitals = buildProfileVitals(profileQuery.data?.patientProfile);
  const prescriptions = prescriptionsQuery.data ?? [];

  const totalConsultations = appointmentsQuery.data?.meta.total ?? appointments.length;

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

      {nextAppointment ? (
        <div className="alert-banner">
          <div className="ab-ico">📅</div>
          <div className="ab-text">
            <strong>
              Consultation — {mapAppointmentToConsultation(nextAppointment).doctorName}
            </strong>
            <span>
              {formatDateTime(nextAppointment.scheduledAt)}. Make sure your camera and microphone are working.
            </span>
          </div>
          <button type="button" className="ab-btn" onClick={() => showToast("Preparing...")}>
            Prepare Now →
          </button>
        </div>
      ) : null}

      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: "📅",
            num: String(totalConsultations),
            label: "Total Consultations",
            tag: `${upcoming.length} upcoming`,
            tagClass: "tt-b",
            bgIcon: "📅",
          },
          {
            ic: "ic2",
            icon: "💬",
            num: String(notificationsQuery.data?.meta.total ?? notifications.length),
            label: "Notifications",
            tag: unreadCount > 0 ? `${unreadCount} new` : "All read",
            tagClass: unreadCount > 0 ? "tt-g" : "tt-b",
            bgIcon: "💬",
          },
          {
            ic: "ic3",
            icon: "🔖",
            num: String(blogQuery.data?.meta.total ?? articles.length),
            label: "Suggested Articles",
            tag: "From blog",
            tagClass: "tt-a",
            bgIcon: "📚",
          },
          {
            ic: "ic4",
            icon: "💊",
            num: String(prescriptions.length),
            label: "Prescriptions",
            tag: `${prescriptions.flatMap((p) => p.items).length} medications`,
            tagClass: "tt-t",
            bgIcon: "⚕️",
          },
        ]}
      />

      <div className="g21">
        <DashCard title="📅 Upcoming Consultations" actions={<CardLink href="/patient/consultations">View All →</CardLink>}>
          <div className="cons-list">
            {appointmentsQuery.isLoading ? (
              <EmptyState message="Loading consultations..." />
            ) : upcomingMapped.length > 0 ? (
              upcomingMapped.map((item) => <ConsultationCard key={item.id} item={item} />)
            ) : (
              <EmptyState message="No upcoming consultations. Book one to get started." />
            )}
          </div>
        </DashCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <DashCard title="📊 My Latest Vitals" actions={<CardLink href="/patient/health">Update →</CardLink>}>
            {profileQuery.isLoading ? (
              <EmptyState message="Loading profile..." />
            ) : profileVitals.length > 0 ? (
              <>
                <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", marginBottom: 12 }}>From your medical profile</div>
                <VitalsGrid vitals={profileVitals} />
              </>
            ) : (
              <EmptyState message="No vitals recorded" />
            )}
          </DashCard>

          <DashCard title="💊 Current Medications" actions={<CardLink onClick={() => showToast("Opening medications...")}>Manage →</CardLink>}>
            <MedicationsList prescriptions={prescriptions} loading={prescriptionsQuery.isLoading} />
          </DashCard>
        </div>
      </div>

      <GridThree>
        <DashCard
          title="💬 Doctor Replies"
          headerExtra={
            unreadCount > 0 ? (
              <span style={{ fontSize: "0.7rem", background: "var(--green)", color: "#fff", padding: "2px 9px", borderRadius: 50, fontWeight: 700 }}>
                {unreadCount} new
              </span>
            ) : null
          }
        >
          {notificationsQuery.isLoading ? (
            <EmptyState message="Loading notifications..." />
          ) : notifications.length > 0 ? (
            notifications.slice(0, 2).map((reply) => (
              <div key={reply.id} className="reply-item">
                <div className="reply-meta">
                  <PersonAvatar initials="DR" className="reply-av" seed={reply.id} />
                  <span className="reply-name">{reply.title}</span>
                  <span className="reply-time">Recent</span>
                </div>
                <div className="reply-q">&quot;{reply.title}&quot;</div>
                <div className="reply-a">{reply.body}</div>
              </div>
            ))
          ) : (
            <EmptyState message="No doctor replies yet." />
          )}
        </DashCard>

        <DashCard title="🔖 Saved Articles" actions={<CardLink href="/patient/articles">All →</CardLink>}>
          {blogQuery.isLoading ? (
            <EmptyState message="Loading articles..." />
          ) : articles.length > 0 ? (
            articles.map((art) => (
              <div key={art.slug} className="art-item">
                <div className="art-thumb" style={{ background: art.authorGradient }}>
                  {art.emoji}
                </div>
                <div className="art-info">
                  <div className="art-cat">{art.cat}</div>
                  <div className="art-title">{art.title}</div>
                  <div className="art-meta">
                    {art.author} · {art.read}
                  </div>
                  <div className="art-bar">
                    <div className="art-fill" style={{ width: "0%" }} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No suggested articles available." />
          )}
        </DashCard>

        <DashCard title="⚡ Recent Activity" actions={<CardLink onClick={() => showToast("Opening activity...")}>All →</CardLink>}>
          {notificationsQuery.isLoading ? (
            <EmptyState message="Loading activity..." />
          ) : notifications.length > 0 ? (
            notifications.slice(0, 6).map((act) => (
              <div key={act.id} className="act-item">
                <div className={`act-dot ${act.readAt ? "ad-b" : "ad-g"}`}>🔔</div>
                <div className="act-text">
                  <p>
                    <strong>{act.title}</strong> — {act.body}
                  </p>
                  <span>Recent</span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No recent activity." />
          )}
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
