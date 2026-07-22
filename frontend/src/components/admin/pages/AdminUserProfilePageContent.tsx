"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  AdminButton,
  AdminPanel,
  GridTwo,
  PanelTable,
  StatusChip,
  UserAvatar,
} from "@/components/admin/ui/AdminPrimitives";
import { adminAppointmentDetailHref, adminBlogArticleHref, adminDoctorProfileHref, adminPatientProfileHref } from "@/lib/admin-routes";
import {
  appointmentStatusChip,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  userRoleChip,
  userStatusChip,
} from "@/lib/admin-utils";
import { useAdminUserProfile, useUpdateUserStatus } from "@/services/admin-api-hooks";
import { useAdminUiStore } from "@/store/admin-ui.store";

function detailValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

export function AdminUserProfilePageContent({ userId }: { userId: string }) {
  const router = useRouter();
  const showToast = useAdminUiStore((s) => s.showToast);
  const profileQuery = useAdminUserProfile(userId);
  const updateStatus = useUpdateUserStatus();
  const profile = profileQuery.data;

  const doctor = profile?.doctorProfile as { id?: string } | null | undefined;
  const patient = profile?.patientProfile as { id?: string } | null | undefined;
  const isDoctor = profile?.role === "DOCTOR" && doctor?.id;
  const isPatient = profile?.role === "PATIENT" && patient?.id;

  useEffect(() => {
    if (isDoctor && doctor?.id) {
      router.replace(adminDoctorProfileHref(doctor.id));
      return;
    }
    if (isPatient && patient?.id) {
      router.replace(adminPatientProfileHref(patient.id));
    }
  }, [isDoctor, doctor?.id, isPatient, patient?.id, router]);

  if (profileQuery.isLoading || isDoctor || isPatient) {
    return <AdminPanel title="Loading profile...">Opening profile workspace...</AdminPanel>;
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
  const patientProfile = profile.patientProfile as Record<string, unknown> | null | undefined;

  const appointmentRows = (profile.recentAppointments as Array<Record<string, unknown>>).map((apt) => {
    const aptStatus = appointmentStatusChip(String(apt.status ?? ""));
    const otherParty = (apt.doctor as { user?: { firstName?: string; lastName?: string } })?.user;
    const otherLabel = otherParty ? `${otherParty.firstName ?? ""} ${otherParty.lastName ?? ""}`.trim() : "—";
    return [
      `#APT-${String(apt.id).slice(-4)}`,
      `Dr. ${otherLabel}`,
      formatDateTime(String(apt.scheduledAt)),
      <StatusChip key={`${apt.id}-st`} label={aptStatus.label} className={aptStatus.className} />,
      <Link key={`${apt.id}-lnk`} href={adminAppointmentDetailHref(String(apt.id))} className="btn">
        Details
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
        href={profile.role === "PATIENT" ? "/admin/patient-profiles" : "/admin/users"}
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
        <div className="kv-card">
          <strong>{formatNumber(profile.stats.publicationBookmarkCount)}</strong>
          <span>Saved Articles</span>
        </div>
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

        <AdminPanel title={patientProfile ? "Patient Profile" : "Profile"}>
          <dl className="detail-list">
            {patientProfile ? (
              <>
                <div className="detail-row">
                  <dt>Date of birth</dt>
                  <dd>
                    {patientProfile.dateOfBirth ? formatDateTime(String(patientProfile.dateOfBirth)) : "—"}
                  </dd>
                </div>
                <div className="detail-row">
                  <dt>Gender</dt>
                  <dd>{detailValue(patientProfile.gender)}</dd>
                </div>
                <div className="detail-row">
                  <dt>Blood group</dt>
                  <dd>{detailValue(patientProfile.bloodGroup)}</dd>
                </div>
                <div className="detail-row">
                  <dt>Allergies</dt>
                  <dd>{detailValue(patientProfile.allergies)}</dd>
                </div>
                <div className="detail-row">
                  <dt>Medical history</dt>
                  <dd>{detailValue(patientProfile.medicalHistory)}</dd>
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
          headers={["ID", "Doctor", "Scheduled", "Status", "Actions"]}
          rows={appointmentRows}
          emptyMessage="No appointments"
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
