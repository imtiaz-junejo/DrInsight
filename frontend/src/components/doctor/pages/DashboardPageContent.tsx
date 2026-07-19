"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  BookOpenText,
  Calendar,
  ClipboardList,
  DoctorIcon,
  DoctorIconInline,
  FilePenLine,
  MessageSquare,
  Pencil,
  Phone,
  PhysicianDashboardLabel,
  Star,
  Stethoscope,
  Users,
  Video,
  Wallet,
  Zap,
} from "@/components/doctor/icons/DoctorIcons";
import {
  CardLink,
  DashButton,
  DashCard,
  DashPageHeader,
  EarningsChart,
  PersonAvatar,
  StatCardRow,
} from "@/components/doctor/ui/DoctorPrimitives";
import {
  consultationTypeLabel,
  earningsToChartData,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatTimeSlot,
  getInitials,
  gradientForId,
  isSameDay,
  scheduleChipForStatus,
  starsDisplay,
} from "@/lib/data-mappers";
import { doctorDisplayName, todayFormatted, todayShortFormatted } from "@/lib/doctor-utils";
import { findNextJoinableAppointment, doctorConsultationPath } from "@/lib/consultation-utils";
import {
  useDoctorAppointments,
  useDoctorBlogPosts,
  useDoctorEarnings,
  useDoctorPatients,
  useDoctorProfile,
  useDoctorReviews,
  usePendingQuestions,
  useUpdateAppointmentStatus,
} from "@/services/doctor-api-hooks";
import type { Appointment } from "@/services/api-hooks";
import { useDoctorUiStore } from "@/store/doctor-ui.store";
import { ConsultationScheduleButton } from "@/components/doctor/ConsultationScheduleButton";
import { useAuthStore } from "@/store/auth.store";

function EmptyState({ loading, message }: { loading?: boolean; message: string }) {
  return (
    <div style={{ padding: "24px 0", textAlign: "center", color: "var(--gray-400)", fontSize: "0.84rem" }}>
      {loading ? "Loading..." : message}
    </div>
  );
}

function ScheduleList({
  appointments,
  loading,
  compact,
}: {
  appointments: Appointment[];
  loading?: boolean;
  compact?: boolean;
}) {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientModal = useDoctorUiStore((s) => s.openPatientModal);
  const updateStatus = useUpdateAppointmentStatus();

  if (loading) return <EmptyState loading message="" />;
  if (!appointments.length) return <EmptyState message="No appointments scheduled for today" />;

  return (
    <>
      {appointments.map((appt) => {
        const user = appt.patient?.user;
        const name = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Patient";
        const initials = getInitials(user?.firstName, user?.lastName);
        const avatarBg = gradientForId(appt.id);
        const { chip, chipLabel, live } = scheduleChipForStatus(appt.status);
        const sub = `${consultationTypeLabel(appt.consultationType)} · ${appt.reason ?? "Consultation"}`;

        return (
          <div key={appt.id} className="sch-item">
            <div className="sch-time">{formatTimeSlot(appt.scheduledAt)}</div>
            <PersonAvatar initials={initials} seed={name} className="sch-av" style={{ background: avatarBg }} />
            <div className="sch-info">
              <div className="sch-name">{name}</div>
              <div className="sch-sub">{sub}</div>
            </div>
            <span className={`sch-chip ${chip}`}>{chipLabel}</span>
            {appt.status === "PENDING" ? (
              <button
                type="button"
                className="sch-btn"
                disabled={updateStatus.isPending}
                onClick={() =>
                  updateStatus.mutate(
                    { id: appt.id, status: "CONFIRMED" },
                    { onSuccess: () => showToast("Consultation confirmed!") },
                  )
                }
              >
                Confirm
              </button>
            ) : (
              <ConsultationScheduleButton
                appointment={appt}
                compact={compact}
                onPrepFallback={() => {
                  if (user) {
                    openPatientModal({
                      initials,
                      name,
                      age: "—",
                      gender: "M",
                      diagnosis: appt.reason ?? "—",
                      status: "Active",
                      avatarBg,
                    });
                  }
                }}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

export function DashboardPageContent() {
  const showToast = useDoctorUiStore((s) => s.showToast);
  const openPatientModal = useDoctorUiStore((s) => s.openPatientModal);
  const user = useAuthStore((s) => s.user);
  const displayName = doctorDisplayName(user?.firstName, user?.lastName);

  const appointmentsQuery = useDoctorAppointments({ limit: 100 });
  const patientsQuery = useDoctorPatients();
  const questionsQuery = usePendingQuestions();
  const earningsQuery = useDoctorEarnings();
  const profileQuery = useDoctorProfile();
  const reviewsQuery = useDoctorReviews(profileQuery.data?.id);
  const blogQuery = useDoctorBlogPosts(user?.id);

  const today = useMemo(() => new Date(), []);
  const todayAppointments = useMemo(
    () =>
      (appointmentsQuery.data?.data ?? [])
        .filter((a) => isSameDay(new Date(a.scheduledAt), today))
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()),
    [appointmentsQuery.data, today],
  );

  const earnings = earningsQuery.data;
  const monthly = earnings?.monthly ?? [];
  const chartData = earningsToChartData(monthly);
  const thisMonthCents = monthly.length ? monthly[monthly.length - 1].amountCents : 0;
  const yearCents = earnings?.totalCents ?? 0;
  const pendingCount = questionsQuery.data?.meta.total ?? 0;
  const patientCount = patientsQuery.data?.length ?? 0;
  const remainingToday = todayAppointments.filter((a) => !["COMPLETED", "CANCELLED"].includes(a.status)).length;
  const nextVideoConsultation = useMemo(
    () => findNextJoinableAppointment(todayAppointments),
    [todayAppointments],
  );
  const reviews = reviewsQuery.data?.data ?? [];
  const articles = blogQuery.data?.data ?? [];

  return (
    <>
      <DashPageHeader
        subtitle={<PhysicianDashboardLabel />}
        title={
          <>
            Good morning, {displayName}{" "}
            <DoctorIcon icon={Stethoscope} size="header" className="dr-icon-inline-title" />
          </>
        }
        dateStr={todayFormatted()}
        actions={
          <>
            {nextVideoConsultation ? (
              <Link href={doctorConsultationPath(nextVideoConsultation.id)}>
                <DashButton variant="outline">
                  <DoctorIconInline icon={Video} size="button">
                    Start Consultation
                  </DoctorIconInline>
                </DashButton>
              </Link>
            ) : (
              <Link href="/doctor/appointments">
                <DashButton variant="outline">
                  <DoctorIconInline icon={Video} size="button">
                    Start Consultation
                  </DoctorIconInline>
                </DashButton>
              </Link>
            )}
            <Link href="/doctor/submit-article">
              <DashButton variant="solid">
                <DoctorIconInline icon={FilePenLine} size="button">
                  Submit Article
                </DoctorIconInline>
              </DashButton>
            </Link>
          </>
        }
      />

      <StatCardRow
        items={[
          {
            ic: "ic1",
            icon: <DoctorIcon icon={Users} size="stat" />,
            num: patientsQuery.isLoading ? "—" : String(patientCount),
            label: "Total Patients",
            tag: patientsQuery.isLoading ? "Loading" : `${patientCount} registered`,
            tagClass: "tt-b",
            bgIcon: <DoctorIcon icon={Users} size="stat" />,
          },
          {
            ic: "ic2",
            icon: <DoctorIcon icon={Calendar} size="stat" />,
            num: appointmentsQuery.isLoading ? "—" : String(todayAppointments.length),
            label: "Today's Consultations",
            tag: appointmentsQuery.isLoading ? "Loading" : `${remainingToday} remaining`,
            tagClass: "tt-g",
            bgIcon: <DoctorIcon icon={Calendar} size="stat" />,
          },
          {
            ic: "ic3",
            icon: <DoctorIcon icon={MessageSquare} size="stat" />,
            num: questionsQuery.isLoading ? "—" : String(pendingCount),
            label: "Pending Q&A Replies",
            tag: pendingCount > 0 ? "Needs attention" : "All caught up",
            tagClass: pendingCount > 0 ? "tt-r" : "tt-g",
            bgIcon: <DoctorIcon icon={MessageSquare} size="stat" />,
          },
          {
            ic: "ic2",
            icon: <DoctorIcon icon={Wallet} size="stat" />,
            num: earningsQuery.isLoading ? "—" : formatCurrency(thisMonthCents / 100),
            label: "This Month's Earnings",
            tag: earningsQuery.isLoading ? "Loading" : `${earnings?.paymentCount ?? 0} payments`,
            tagClass: "tt-g",
            bgIcon: <DoctorIcon icon={Wallet} size="stat" />,
          },
        ]}
      />

      <div className="g21-dr">
        <DashCard title={<DoctorIconInline icon={Calendar} size="button">{`Today's Schedule — ${todayShortFormatted()}`}</DoctorIconInline>} actions={<CardLink onClick={() => showToast("Opening calendar...")}>Full calendar →</CardLink>}>
          <ScheduleList appointments={todayAppointments} loading={appointmentsQuery.isLoading} />
        </DashCard>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <DashCard title={<DoctorIconInline icon={Wallet} size="button">Earnings Overview</DoctorIconInline>} actions={<CardLink href="/doctor/earnings">Details →</CardLink>}>
            {earningsQuery.isLoading ? (
              <EmptyState loading message="" />
            ) : (
              <>
                <div className="earn-grid">
                  <div className="earn-box">
                    <div className="earn-n">{formatCurrency(thisMonthCents / 100)}</div>
                    <div className="earn-l">This Month</div>
                    <div className="earn-s" style={{ color: "var(--green)" }}>
                      {monthly.length > 1 ? "Latest period" : "—"}
                    </div>
                  </div>
                  <div className="earn-box">
                    <div className="earn-n">{formatCurrency(yearCents / 100)}</div>
                    <div className="earn-l">Total Earned</div>
                    <div className="earn-s" style={{ color: "var(--blue)" }}>
                      {earnings?.paymentCount ?? 0} consultations
                    </div>
                  </div>
                  <div className="earn-box">
                    <div className="earn-n">{formatCurrency(0)}</div>
                    <div className="earn-l">Pending</div>
                    <div className="earn-s" style={{ color: "var(--amber)" }}>
                      Processing
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--gray-400)", marginBottom: 6 }}>Monthly earnings (last 6 months)</div>
                {chartData.length ? <EarningsChart data={chartData} /> : <EmptyState message="No earnings data yet" />}
              </>
            )}
          </DashCard>

          <DashCard title={<DoctorIconInline icon={Star} size="button">Patient Reviews</DoctorIconInline>} actions={<CardLink href="/doctor/reviews">All →</CardLink>}>
            {reviewsQuery.isLoading || profileQuery.isLoading ? (
              <EmptyState loading message="" />
            ) : (
              <>
                <div className="rev-summary">
                  <div className="rev-big">{profileQuery.data?.rating.toFixed(1) ?? "—"}</div>
                  <div>
                    <div className="stars-row">{starsDisplay(profileQuery.data?.rating ?? 0)}</div>
                    <div style={{ fontSize: "0.74rem", color: "var(--gray-400)" }}>
                      Based on {profileQuery.data?.reviewCount ?? 0} reviews
                    </div>
                  </div>
                </div>
                {reviews.length === 0 ? (
                  <EmptyState message="No reviews yet" />
                ) : (
                  reviews.slice(0, 2).map((rev) => {
                    const pUser = rev.patient?.user;
                    const name = `${pUser?.firstName ?? ""} ${pUser?.lastName ?? ""}`.trim() || "Patient";
                    const initials = getInitials(pUser?.firstName, pUser?.lastName);
                    const bg = gradientForId(rev.id);
                    return (
                      <div key={rev.id} className="rev-item">
                        <div className="rev-hd">
                          <PersonAvatar initials={initials} className="rev-av" style={{ background: bg }} seed={name} />
                          <span className="rev-name">{name}</span>
                          <span className="rev-stars">{starsDisplay(rev.rating)}</span>
                        </div>
                        <div className="rev-text">&quot;{rev.comment ?? "No comment"}&quot;</div>
                        <div className="rev-date">{formatDate(rev.createdAt)}</div>
                      </div>
                    );
                  })
                )}
              </>
            )}
          </DashCard>
        </div>
      </div>

      <div className="g13">
        <DashCard
          title={
            <>
            <DoctorIconInline icon={MessageSquare} size="button">
              Patient Questions — Awaiting Reply{" "}
            </DoctorIconInline>
              {!questionsQuery.isLoading && pendingCount > 0 ? (
                <span style={{ fontSize: "0.72rem", background: "var(--red)", color: "#fff", padding: "2px 8px", borderRadius: 50, marginLeft: 4 }}>
                  {pendingCount}
                </span>
              ) : null}
            </>
          }
          actions={<CardLink href="/doctor/questions">View all →</CardLink>}
        >
          {questionsQuery.isLoading ? (
            <EmptyState loading message="" />
          ) : (questionsQuery.data?.data ?? []).length === 0 ? (
            <EmptyState message="No pending questions" />
          ) : (
            (questionsQuery.data?.data ?? []).slice(0, 3).map((q) => {
              const name = q.isAnonymous ? q.submitterName ?? "Anonymous" : q.submitterName ?? "Patient";
              const initials = getInitials(name.split(" ")[0], name.split(" ")[1]);
              const avatarBg = gradientForId(q.id);
              return (
                <div key={q.id} className="qa-item">
                  <div className="qa-top">
                    <PersonAvatar initials={initials} className="qa-av" style={{ background: avatarBg }} seed={name} />
                    <div className="qa-meta">
                      <div className="qa-pname">
                        {name}
                        {q.category.toLowerCase().includes("urgent") ? (
                          <span className="qa-urgent">
                            <DoctorIconInline icon={Zap} size="sm">
                              Urgent
                            </DoctorIconInline>
                          </span>
                        ) : null}
                      </div>
                      <div className="qa-spec">
                        {q.category} · {formatRelativeTime(q.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="qa-q">&quot;{q.question}&quot;</div>
                  <div className="qa-actions">
                    <button type="button" className="qa-btn reply" onClick={() => showToast("Reply editor opened")}>
                      <DoctorIconInline icon={Pencil} size="sm">
                        Reply Now
                      </DoctorIconInline>
                    </button>
                    <button
                      type="button"
                      className="qa-btn"
                      onClick={() =>
                        openPatientModal({
                          initials,
                          name,
                          age: "—",
                          gender: "M",
                          diagnosis: q.category,
                          status: "Active",
                          avatarBg,
                        })
                      }
                    >
                      <DoctorIconInline icon={ClipboardList} size="sm">
                        Patient File
                      </DoctorIconInline>
                    </button>
                    <button type="button" className="qa-btn" onClick={() => showToast("Calling patient...")}>
                      <DoctorIconInline icon={Phone} size="sm">
                        Call
                      </DoctorIconInline>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </DashCard>

        <DashCard title={<DoctorIconInline icon={BookOpenText} size="button">My Articles</DoctorIconInline>} actions={<CardLink href="/doctor/articles">All {blogQuery.data?.meta.total ?? 0} →</CardLink>}>
          {blogQuery.isLoading ? (
            <EmptyState loading message="" />
          ) : articles.length === 0 ? (
            <EmptyState message="No articles yet" />
          ) : (
            articles.slice(0, 4).map((post) => {
              const status = (post as { status?: string }).status ?? "DRAFT";
              const statusClass = status === "PUBLISHED" ? "as-live" : status === "DRAFT" ? "as-draft" : "as-review";
              const statusLabel = status === "PUBLISHED" ? "Live" : status === "DRAFT" ? "Draft" : "Review";
              const views = (post as { viewCount?: number }).viewCount;
              const meta =
                status === "PUBLISHED"
                  ? `${views?.toLocaleString() ?? 0} views · ${post.publishedAt ? formatDate(post.publishedAt) : "—"}`
                  : status === "DRAFT"
                    ? "Draft · Last edited recently"
                    : "Under Review";
              const bg = "#dbeafe,#bfdbfe";
              return (
                <div key={post.id} className="art-item">
                  <div className="art-thumb" style={{ background: `linear-gradient(135deg,${bg})` }}>
                    <DoctorIcon icon={BookOpenText} size="stat" />
                  </div>
                  <div className="art-info">
                    <div className="art-title">{post.title}</div>
                    <div className="art-meta">{meta}</div>
                  </div>
                  <span className={`art-status ${statusClass}`}>{statusLabel}</span>
                </div>
              );
            })
          )}
        </DashCard>
      </div>
    </>
  );
}
