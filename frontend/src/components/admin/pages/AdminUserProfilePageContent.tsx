"use client";

import Link from "next/link";
import {
  AdminButton,
  AdminPanel,
  GridTwo,
  PanelTable,
  StatusChip,
  UserAvatar,
} from "@/components/admin/ui/AdminPrimitives";
import {
  adminAppointmentDetailHref,
  adminBlogArticleHref,
  adminDoctorArticlesHref,
} from "@/lib/admin-routes";
import {
  appointmentStatusChip,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  userRoleChip,
  userStatusChip,
} from "@/lib/admin-utils";
import {
  useAdminUserProfile,
  useUpdateUserStatus,
} from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

function detailValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

export function AdminUserProfilePageContent({ userId }: { userId: string }) {
  const showToast = useAdminUiStore((s) => s.showToast);
  const profileQuery = useAdminUserProfile(userId);
  const updateStatus = useUpdateUserStatus();
  const profile = profileQuery.data;

  if (profileQuery.isLoading) {
    return <AdminPanel title="Loading profile...">Fetching user data from database...</AdminPanel>;
  }

  if (profileQuery.isError || !profile) {
    return (
      <AdminPanel title="Profile not found">
        <p>Unable to load this user profile.</p>
        <Link href="/admin/users" className="detail-back">
          ← Back to Users
        </Link>
      </AdminPanel>
    );
  }

  const role = userRoleChip(profile.role, profile.status);
  const status = userStatusChip(profile.status);
  const doctor = profile.doctorProfile as Record<string, unknown> | null | undefined;
  const patient = profile.patientProfile as Record<string, unknown> | null | undefined;
  const isDoctor = profile.role === "DOCTOR" && doctor;

  const appointmentRows = (profile.recentAppointments as Array<Record<string, unknown>>).map((apt) => {
    const aptStatus = appointmentStatusChip(String(apt.status ?? ""));
    const isDoctorView = Boolean(isDoctor);
    const otherParty = isDoctorView
      ? (apt.patient as { user?: { firstName?: string; lastName?: string } })?.user
      : (apt.doctor as { user?: { firstName?: string; lastName?: string } })?.user;
    const otherLabel = otherParty
      ? `${otherParty.firstName ?? ""} ${otherParty.lastName ?? ""}`.trim()
      : "—";
    return [
      `#APT-${String(apt.id).slice(-4)}`,
      isDoctorView ? otherLabel : `Dr. ${otherLabel}`,
      formatDateTime(String(apt.scheduledAt)),
      <StatusChip key={`${apt.id}-st`} label={aptStatus.label} className={aptStatus.className} />,
      <Link key={`${apt.id}-lnk`} href={adminAppointmentDetailHref(String(apt.id))} className="btn">
        Details
      </Link>,
    ];
  });

  const blogRows = (profile.recentBlogPosts as Array<Record<string, unknown>>).map((post) => {
    const postStatus = String(post.status ?? "DRAFT");
    return [
      String(post.title),
      (post.category as { name?: string })?.name ?? "—",
      <StatusChip
        key={`${post.id}-s`}
        label={postStatus}
        className={postStatus === "PUBLISHED" ? "ch-g" : "ch-a"}
      />,
      post.publishedAt ? formatDateTime(String(post.publishedAt)) : "—",
      <Link key={`${post.id}-v`} href={adminBlogArticleHref(String(post.slug))} className="btn">
        View
      </Link>,
    ];
  });

  const auditRows = profile.auditLogs.map((entry) => [
    formatRelativeTime(entry.createdAt),
    entry.action,
    entry.target ?? "—",
    <StatusChip
      key={`${entry.id}-sev`}
      label={entry.severity}
      className={entry.severity === "CRITICAL" ? "ch-r" : "ch-gray"}
    />,
  ]);

  return (
    <>
      <Link
        href={profile.role === "DOCTOR" ? "/admin/doctors" : profile.role === "PATIENT" ? "/admin/patients" : "/admin/users"}
        className="detail-back"
      >
        ← Back
      </Link>

      <div className="profile-hero">
        <UserAvatar firstName={profile.firstName} lastName={profile.lastName} seed={profile.id} />
        <div style={{ flex: 1 }}>
          <h2>
            {profile.firstName} {profile.lastName}
          </h2>
          <div className="cell-sub">{profile.email}</div>
          <div className="profile-meta">
            <StatusChip label={role.label} className={role.className} />
            <StatusChip label={status.label} className={status.className} />
            {profile.isOnline ? <StatusChip label="Online" className="ch-g" /> : null}
            {profile.emailVerified ? <StatusChip label="Email verified" className="ch-g" /> : null}
          </div>
          <div className="btn-row" style={{ marginTop: 14 }}>
            {isDoctor ? (
              <Link href={adminDoctorArticlesHref(profile.id)} className="btn btn-primary">
                Articles
              </Link>
            ) : null}
            {profile.status === "SUSPENDED" ? (
              <AdminButton
                variant="green"
                onClick={() =>
                  updateStatus.mutate(
                    { id: profile.id, status: "ACTIVE" },
                    { onSuccess: () => showToast("User reactivated") },
                  )
                }
              >
                Reactivate
              </AdminButton>
            ) : profile.status === "PENDING" ? (
              <AdminButton
                variant="green"
                onClick={() =>
                  updateStatus.mutate(
                    { id: profile.id, status: "ACTIVE" },
                    { onSuccess: () => showToast("User verified ✓") },
                  )
                }
              >
                Verify
              </AdminButton>
            ) : profile.status === "ACTIVE" ? (
              <AdminButton
                variant="danger"
                onClick={() =>
                  updateStatus.mutate(
                    { id: profile.id, status: "SUSPENDED" },
                    { onSuccess: () => showToast("User suspended") },
                  )
                }
              >
                Suspend
              </AdminButton>
            ) : null}
          </div>
        </div>
      </div>

      <div className="kv-grid" style={{ marginBottom: 18 }}>
        <div className="kv-card">
          <strong>{formatNumber(profile.stats.appointmentCount)}</strong>
          <span>Appointments</span>
        </div>
        <div className="kv-card">
          <strong>{formatNumber(profile.stats.completedAppointments)}</strong>
          <span>Completed</span>
        </div>
        <div className="kv-card">
          <strong>{formatNumber(profile.stats.upcomingAppointments)}</strong>
          <span>Upcoming</span>
        </div>
        {isDoctor ? (
          <>
            <div className="kv-card">
              <strong>{formatNumber(profile.stats.blogPostCount)}</strong>
              <span>Articles</span>
            </div>
            <div className="kv-card">
              <strong>{formatNumber(profile.stats.publicationCount)}</strong>
              <span>Publications</span>
            </div>
            <div className="kv-card">
              <strong>{typeof doctor?.rating === "number" ? Number(doctor.rating).toFixed(1) : "—"}</strong>
              <span>Avg. Rating</span>
            </div>
          </>
        ) : (
          <div className="kv-card">
            <strong>{formatNumber(profile.stats.publicationBookmarkCount)}</strong>
            <span>Saved Articles</span>
          </div>
        )}
      </div>

      <GridTwo>
        <AdminPanel title="Account Details">
          <dl className="detail-list">
            <div className="detail-row">
              <dt>User ID</dt>
              <dd>#USR-{profile.id.slice(-4)}</dd>
            </div>
            <div className="detail-row">
              <dt>Phone</dt>
              <dd>{detailValue(profile.phone)}</dd>
            </div>
            <div className="detail-row">
              <dt>Joined</dt>
              <dd>{formatDateTime(profile.createdAt)}</dd>
            </div>
            <div className="detail-row">
              <dt>Last seen</dt>
              <dd>{profile.lastSeenAt ? formatRelativeTime(profile.lastSeenAt) : "—"}</dd>
            </div>
          </dl>
        </AdminPanel>

        <AdminPanel title={isDoctor ? "Doctor Profile" : patient ? "Patient Profile" : "Profile"}>
          <dl className="detail-list">
            {isDoctor ? (
              <>
                <div className="detail-row">
                  <dt>Specialty</dt>
                  <dd>{detailValue(doctor?.specialty)}</dd>
                </div>
                <div className="detail-row">
                  <dt>Hospital</dt>
                  <dd>{detailValue(doctor?.hospital)}</dd>
                </div>
                <div className="detail-row">
                  <dt>License</dt>
                  <dd>{detailValue(doctor?.licenseNumber)}</dd>
                </div>
                <div className="detail-row">
                  <dt>Experience</dt>
                  <dd>{detailValue(doctor?.experienceYears)} years</dd>
                </div>
                <div className="detail-row">
                  <dt>Consultation fee</dt>
                  <dd>${detailValue(doctor?.consultationFee)}</dd>
                </div>
                <div className="detail-row">
                  <dt>Bio</dt>
                  <dd>{detailValue(doctor?.bio)}</dd>
                </div>
              </>
            ) : patient ? (
              <>
                <div className="detail-row">
                  <dt>Date of birth</dt>
                  <dd>
                    {patient.dateOfBirth
                      ? formatDateTime(String(patient.dateOfBirth))
                      : "—"}
                  </dd>
                </div>
                <div className="detail-row">
                  <dt>Gender</dt>
                  <dd>{detailValue(patient.gender)}</dd>
                </div>
                <div className="detail-row">
                  <dt>Blood group</dt>
                  <dd>{detailValue(patient.bloodGroup)}</dd>
                </div>
                <div className="detail-row">
                  <dt>Allergies</dt>
                  <dd>{detailValue(patient.allergies)}</dd>
                </div>
                <div className="detail-row">
                  <dt>Medical history</dt>
                  <dd>{detailValue(patient.medicalHistory)}</dd>
                </div>
              </>
            ) : (
              <div className="detail-row">
                <dt>Role</dt>
                <dd>{profile.role}</dd>
              </div>
            )}
          </dl>
        </AdminPanel>
      </GridTwo>

      {appointmentRows.length > 0 ? (
        <PanelTable
          title="Recent Appointments"
          headers={["ID", isDoctor ? "Patient" : "Doctor", "Scheduled", "Status", "Actions"]}
          rows={appointmentRows}
          emptyMessage="No appointments"
        />
      ) : null}

      {isDoctor && blogRows.length > 0 ? (
        <PanelTable
          title="Recent Articles"
          actions={
            <Link href={adminDoctorArticlesHref(profile.id)} className="btn">
              All articles →
            </Link>
          }
          headers={["Title", "Category", "Status", "Published", "Actions"]}
          rows={blogRows}
          emptyMessage="No articles"
        />
      ) : null}

      {auditRows.length > 0 ? (
        <PanelTable
          title="Activity & Audit History"
          headers={["Time", "Action", "Target", "Severity"]}
          rows={auditRows}
          emptyMessage="No activity recorded"
        />
      ) : null}
    </>
  );
}
