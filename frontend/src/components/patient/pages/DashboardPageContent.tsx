"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  EmptyState,
  MedicationsList,
  VitalsGrid,
} from "@/components/patient/ui/PatientShared";
import { PatientAppointmentCard } from "@/components/patient/ui/PatientAppointmentCard";
import { CardLink, DashButton, DashCard, DashPageHeader, GridThree, PersonAvatar, StatCardRow } from "@/components/patient/ui/PatientPrimitives";
import { doctorFullName, formatDate, formatDateTime, getInitials, mapBlogPostToCard } from "@/lib/data-mappers";
import { todayFormatted } from "@/lib/patient-utils";
import { useNotifications } from "@/services/api-hooks";
import { ClinicalNotificationItem } from "@/components/clinical-notes/ClinicalNotificationItem";
import {
  useAuthProfile,
  usePatientAppointments,
  usePatientHealthScore,
  usePatientHealthToolHistory,
  usePatientHealthVitals,
  usePatientPrescriptions,
  usePatientQuestions,
  useSavedBlogPosts,
} from "@/services/patient-api-hooks";
import { useAuthStore } from "@/store/auth.store";
import { usePatientUiStore } from "@/store/patient-ui.store";
import { PatientUpcomingConsultationBanner } from "@/components/consultation/PatientConsultationJoinPrompt";
import {
  Bolt,
  Book,
  CalendarDate,
  ChatRound,
  DoctorIcon,
  DoctorIconInline,
  Hospital,
  Pill,
  QuestionCircle,
  Widget,
  Zap,
} from "@/components/doctor/icons/DoctorIcons";
import { resolveEmojiIcon } from "@/components/doctor/icons/resolveEmojiIcon";

const HEALTH_TOOLS = [
  { icon: "⚖️", name: "BMI Calculator", sub: "Check your BMI", href: "/health-tools/bmi-calculator" },
  { icon: "❤️", name: "Heart Risk", sub: "Assess cardiovascular risk", href: "/health-tools/heart-risk" },
  { icon: "🩸", name: "Diabetes Risk", sub: "Screen diabetes risk", href: "/health-tools/diabetes-risk" },
  { icon: "🫁", name: "Lung Age", sub: "Estimate lung age", href: "/health-tools/lung-age" },
  { icon: "🧠", name: "Mental Health", sub: "PHQ-9 screening", href: "/health-tools/mental-health" },
  { icon: "🔎", name: "Symptom Checker", sub: "Try it now", href: "/health-tools/symptom-checker" },
] as const;

const UPCOMING_STATUSES = new Set(["CONFIRMED", "PENDING", "IN_PROGRESS"]);

function isTomorrow(dateStr: string) {
  const d = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
}

export function DashboardPageContent() {
  const router = useRouter();
  const showToast = usePatientUiStore((s) => s.showToast);
  const user = useAuthStore((s) => s.user);
  const profileQuery = useAuthProfile();
  const appointmentsQuery = usePatientAppointments({ limit: 50 });
  const prescriptionsQuery = usePatientPrescriptions();
  const notificationsQuery = useNotifications();
  const vitalsQuery = usePatientHealthVitals();
  const healthScoreQuery = usePatientHealthScore();
  const toolHistoryQuery = usePatientHealthToolHistory(6);
  const savedArticlesQuery = useSavedBlogPosts({ limit: 3 });
  const answeredQuestionsQuery = usePatientQuestions("answered", { limit: 5 });

  const firstName = profileQuery.data?.firstName?.split(" ")[0] ?? user?.firstName?.split(" ")[0] ?? "there";

  const appointments = appointmentsQuery.data?.data ?? [];
  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => UPCOMING_STATUSES.has(a.status))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [appointments],
  );
  const upcomingPreview = upcoming.slice(0, 2);
  const tomorrowAppt = upcoming.find((a) => isTomorrow(a.scheduledAt));

  const notifications = notificationsQuery.data?.data ?? [];

  const savedArticles = (savedArticlesQuery.data?.data ?? []).map((post) => ({
    ...mapBlogPostToCard(post),
    readPercent: post.readPercent ?? 0,
  }));
  const prescriptions = prescriptionsQuery.data ?? [];
  const vitals = vitalsQuery.data?.data ?? [];
  const toolHistory = toolHistoryQuery.data ?? [];
  const doctorReplies = answeredQuestionsQuery.data?.data ?? [];

  const totalConsultations = appointmentsQuery.data?.meta.total ?? appointments.length;
  const toolsUsedCount = toolHistory.length;
  const healthScore = healthScoreQuery.data?.score ?? 0;

  const toolSub = (slug: string) => {
    const hit = toolHistory.find((t) => t.tool.slug === slug);
    return hit?.resultSummary ?? "Not taken yet";
  };

  return (
    <>
      <DashPageHeader
        subtitle={
          <DoctorIconInline icon={Hospital} size="header" tone="indigo">
            Patient Dashboard
          </DoctorIconInline>
        }
        title={`Good morning, ${firstName}`}
        dateStr={todayFormatted()}
        actions={
          <>
            <DashButton variant="outline" onClick={() => router.push("/patient/questions/ask")}>
              <DoctorIconInline icon={QuestionCircle} size="button">
                Ask a Doctor
              </DoctorIconInline>
            </DashButton>
            <Link href="/book-consultation">
              <DashButton variant="solid">
                <DoctorIconInline icon={CalendarDate} size="button">
                  Book Consultation
                </DoctorIconInline>
              </DashButton>
            </Link>
          </>
        }
      />

      <PatientUpcomingConsultationBanner />

      {tomorrowAppt ? (
        <div className="alert-banner">
          <div className="ab-ico">
            <DoctorIcon icon={CalendarDate} size="stat" tone="indigo" />
          </div>
          <div className="ab-text">
            <strong>
              Consultation Tomorrow — {doctorFullName(tomorrowAppt.doctor?.user)} ({tomorrowAppt.doctor?.specialty})
            </strong>
            <span>
              {formatDateTime(tomorrowAppt.scheduledAt)}. Make sure your camera and microphone are working.
            </span>
          </div>
          <button type="button" className="ab-btn" onClick={() => router.push(`/patient/consultation/${tomorrowAppt.id}`)}>
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
            num: String(doctorReplies.length),
            label: "Doctor Replies",
            tag: doctorReplies.length > 0 ? `${Math.min(2, doctorReplies.length)} new` : "All read",
            tagClass: doctorReplies.length > 0 ? "tt-g" : "tt-b",
            bgIcon: "💬",
          },
          {
            ic: "ic3",
            icon: "🔖",
            num: String(savedArticlesQuery.data?.meta.total ?? savedArticles.length),
            label: "Saved Articles",
            tag: savedArticles.length > 0 ? `${savedArticles.length} saved` : "None yet",
            tagClass: "tt-a",
            bgIcon: "📚",
          },
          {
            ic: "ic4",
            icon: "🔧",
            num: String(toolsUsedCount),
            label: "Health Tools Used",
            tag: healthScore > 0 ? `Score: ${healthScore}` : "Track wellness",
            tagClass: "tt-t",
            bgIcon: "⚕️",
          },
        ]}
      />

      <div className="g21">
        <DashCard
          title={
            <DoctorIconInline icon={CalendarDate} size="button" tone="indigo">
              Upcoming Consultations
            </DoctorIconInline>
          }
          actions={<CardLink href="/patient/consultations/upcoming">View All →</CardLink>}
        >
          <div className="cons-list">
            {appointmentsQuery.isLoading ? (
              <EmptyState message="Loading consultations..." />
            ) : upcomingPreview.length > 0 ? (
              upcomingPreview.map((appt) => <PatientAppointmentCard key={appt.id} appt={appt} />)
            ) : (
              <EmptyState message="No upcoming consultations. Book one to get started." />
            )}
          </div>
        </DashCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <DashCard
            title={
              <DoctorIconInline icon={Widget} size="button" tone="blue">
                My Latest Vitals
              </DoctorIconInline>
            }
            actions={<CardLink href="/patient/health">Update →</CardLink>}
          >
            {vitalsQuery.isLoading ? (
              <EmptyState message="Loading vitals..." />
            ) : vitals.length > 0 ? (
              <>
                {vitalsQuery.data?.lastRecordedAt ? (
                  <div style={{ fontSize: "0.72rem", color: "var(--gray-400)", marginBottom: 12 }}>
                    Last recorded: {formatDate(vitalsQuery.data.lastRecordedAt)}
                  </div>
                ) : null}
                <VitalsGrid vitals={vitals} />
              </>
            ) : (
              <EmptyState message="No vitals recorded yet. Log your first reading." />
            )}
          </DashCard>

          <DashCard
            title={
              <DoctorIconInline icon={Pill} size="button" tone="red">
                Current Medications
              </DoctorIconInline>
            }
            actions={<CardLink href="/patient/consultations/completed">Manage →</CardLink>}
          >
            <MedicationsList prescriptions={prescriptions} loading={prescriptionsQuery.isLoading} />
          </DashCard>
        </div>
      </div>

      <GridThree>
        <DashCard
          title={
            <DoctorIconInline icon={ChatRound} size="button" tone="cyan">
              Doctor Replies
            </DoctorIconInline>
          }
          headerExtra={
            doctorReplies.length > 0 ? (
              <span style={{ fontSize: "0.7rem", background: "var(--green)", color: "#fff", padding: "2px 9px", borderRadius: 50, fontWeight: 700 }}>
                {doctorReplies.length} answered
              </span>
            ) : null
          }
        >
          {answeredQuestionsQuery.isLoading ? (
            <EmptyState message="Loading replies..." />
          ) : doctorReplies.length > 0 ? (
            doctorReplies.slice(0, 2).map((reply) => (
              <div key={reply.id} className="reply-item">
                <div className="reply-meta">
                  <PersonAvatar
                    initials={getInitials(reply.answeredBy?.firstName, reply.answeredBy?.lastName)}
                    className="reply-av"
                    seed={reply.id}
                  />
                  <span className="reply-name">{doctorFullName(reply.answeredBy)}</span>
                  <span className="reply-time">{reply.answeredAt ? formatDate(reply.answeredAt) : "Recent"}</span>
                </div>
                <div className="reply-q">&quot;{reply.title ?? reply.question}&quot;</div>
                <div className="reply-a">{reply.answer}</div>
              </div>
            ))
          ) : (
            <EmptyState message="No doctor replies yet." />
          )}
        </DashCard>

        <DashCard
          title={
            <DoctorIconInline icon={Book} size="button" tone="orange">
              Saved Articles
            </DoctorIconInline>
          }
          actions={<CardLink href="/patient/articles">All →</CardLink>}
        >
          {savedArticlesQuery.isLoading ? (
            <EmptyState message="Loading articles..." />
          ) : savedArticles.length > 0 ? (
            savedArticles.map((art) => (
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
                    <div className="art-fill" style={{ width: `${art.readPercent}%` }} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No saved articles yet." />
          )}
        </DashCard>

        <DashCard
          title={
            <DoctorIconInline icon={Zap} size="button" tone="warning">
              Recent Activity
            </DoctorIconInline>
          }
          actions={<CardLink href="/patient/settings">All →</CardLink>}
        >
          {notificationsQuery.isLoading ? (
            <EmptyState message="Loading activity..." />
          ) : notifications.length > 0 ? (
            notifications.slice(0, 6).map((act) => (
              <ClinicalNotificationItem key={act.id} notification={act} role="patient" />
            ))
          ) : (
            <EmptyState message="No recent activity." />
          )}
        </DashCard>
      </GridThree>

      <DashCard
        title={
          <DoctorIconInline icon={Bolt} size="button" tone="warning">
            Health Tools
          </DoctorIconInline>
        }
        actions={<CardLink href="/health-tools">All tools →</CardLink>}
      >
        <div className="tools-grid">
          {HEALTH_TOOLS.map((tool) => (
            <Link key={tool.name} href={tool.href} className="tool-card" onClick={() => showToast(`Opening ${tool.name}...`)}>
              <div className="tc-ico">{resolveEmojiIcon(tool.icon, "button")}</div>
              <div className="tc-text">
                <strong>{tool.name}</strong>
                <span>{toolSub(tool.href.split("/").pop() ?? "")}</span>
              </div>
            </Link>
          ))}
        </div>
      </DashCard>
    </>
  );
}
