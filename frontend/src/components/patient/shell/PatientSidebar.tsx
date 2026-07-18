"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { patientNav, patientRouteId, type PatientBadgeKey } from "@/config/patient-nav";
import { formatDate } from "@/lib/data-mappers";
import { getInitials, patientDisplayName } from "@/lib/patient-utils";
import {
  useAuthProfile,
  usePatientDashboardCounts,
  usePatientHealthScore,
} from "@/services/patient-api-hooks";
import { useAuthStore } from "@/store/auth.store";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function PatientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const showToast = usePatientUiStore((s) => s.showToast);
  const profileQuery = useAuthProfile();
  const countsQuery = usePatientDashboardCounts();
  const healthScoreQuery = usePatientHealthScore();

  const profile = profileQuery.data;
  const initials = getInitials(profile?.firstName ?? user?.firstName, profile?.lastName ?? user?.lastName);
  const fullName = patientDisplayName(profile?.firstName ?? user?.firstName, profile?.lastName ?? user?.lastName);
  const memberSince = profile?.createdAt ? formatDate(profile.createdAt, { month: "short", year: "numeric" }) : "—";

  const healthScore = healthScoreQuery.data;
  const routeId = patientRouteId(pathname);

  const badgeValue = (key: PatientBadgeKey | undefined): number => {
    if (!key || !countsQuery.data) return 0;
    return countsQuery.data[key] ?? 0;
  };

  const handleSignOut = () => {
    showToast("Signing out...");
    clearAuth();
    router.replace("/login");
  };

  return (
    <aside className="dash-sidebar sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-avatar-ring">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-online" />
        </div>
        <div className="sidebar-name">{fullName}</div>
        <div className="sidebar-role">Patient</div>
        <div className="sidebar-spec">Member since {memberSince}</div>
      </div>

      <div className="hs-panel">
        <div className="hs-label">Overall Health Score</div>
        <div className="hs-row">
          <div
            className="hs-circle"
            style={{
              background: `conic-gradient(var(--green) 0% ${healthScore?.score ?? 0}%, var(--gray-200) ${healthScore?.score ?? 0}%)`,
            }}
          >
            <div className="hs-inner">
              <div className="hs-num">{healthScore?.score ?? "—"}</div>
              <div className="hs-sub">/ 100</div>
            </div>
          </div>
          <div>
            <div className="hs-status">{healthScore?.status ?? "Loading..."}</div>
            <div className="hs-desc">
              {healthScoreQuery.isLoading
                ? "Calculating your health metrics..."
                : `${healthScore?.attentionCount ?? 0} metric${healthScore?.attentionCount === 1 ? "" : "s"} need attention`}
            </div>
          </div>
        </div>
        <div className="mb-rows">
          {(healthScore?.dimensions ?? []).map((m) => (
            <div key={m.label} className="mb-row">
              <span className="mb-lbl">{m.label}</span>
              <div className="mb-bar">
                <div className="mb-fill" style={{ width: `${m.value}%`, background: m.color }} />
              </div>
              <span className="mb-v">{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      <nav className="snav">
        {patientNav.map((group) => (
          <div key={group.lbl}>
            <div className="snav-label">{group.lbl}</div>
            {group.items.map((item) => {
              const active = routeId === item.id;
              const badge = badgeValue(item.badgeKey);
              return (
                <Link key={item.id} href={item.href} className={`snav-item${active ? " active" : ""}`}>
                  <span className="snav-ico">{item.ico}</span>
                  {item.name}
                  {item.badgeKey && badge > 0 ? (
                    <span className={`snav-badge ${item.badgeClass ?? ""}`}>{badge}</span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-signout" onClick={handleSignOut}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
