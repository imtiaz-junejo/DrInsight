"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/data-mappers";
import { getInitials, patientDisplayName, todayFormatted } from "@/lib/patient-utils";
import { useAuthProfile } from "@/services/patient-api-hooks";
import { useAuthStore } from "@/store/auth.store";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function PatientDashHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const showToast = usePatientUiStore((s) => s.showToast);
  const profileQuery = useAuthProfile();

  const profile = profileQuery.data;
  const fullName = patientDisplayName(profile?.firstName ?? user?.firstName, profile?.lastName ?? user?.lastName);
  const initials = getInitials(profile?.firstName ?? user?.firstName, profile?.lastName ?? user?.lastName);
  const lastLogin = profile?.lastSeenAt
    ? formatDate(profile.lastSeenAt, { month: "short", day: "numeric", year: "numeric" })
    : profile?.createdAt
      ? formatDate(profile.createdAt, { month: "short", day: "numeric", year: "numeric" })
      : "Recently";

  const handleSignOut = () => {
    showToast("Signing out...");
    clearAuth();
    router.replace("/login");
  };

  return (
    <div className="dash-header">
      <div className="dash-header-inner">
        <div className="dash-welcome">
          <div className="dash-welcome-sub">Patient Dashboard</div>
          <h1>Welcome back, {fullName} 👋</h1>
          <p>
            {todayFormatted()} &nbsp;·&nbsp; Last login: {lastLogin}
          </p>
        </div>
        <div className="dash-header-right">
          <div className="dash-avatar">
            {initials}
            <div className="dash-online-dot" />
          </div>
          <div>
            <div className="dash-role-badge">🏥 Patient Account</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <Link href="/book-consultation">
                <button type="button" className="dash-btn solid" onClick={() => showToast("Opening booking...")}>
                  📅 Book Consultation
                </button>
              </Link>
              <button type="button" className="dash-btn" onClick={handleSignOut}>
                ← Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
