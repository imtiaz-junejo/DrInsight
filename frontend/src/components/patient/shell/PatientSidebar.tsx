"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { patientNav } from "@/config/patient-nav";
import { HEALTH_SCORE } from "@/components/patient/data/patient-demo-data";
import { getInitials, patientDisplayName } from "@/lib/patient-utils";
import { useAuthStore } from "@/store/auth.store";
import { usePatientUiStore } from "@/store/patient-ui.store";

export function PatientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const showToast = usePatientUiStore((s) => s.showToast);
  const setMobileSidebarOpen = usePatientUiStore((s) => s.setMobileSidebarOpen);

  const initials = getInitials(user?.firstName, user?.lastName);
  const fullName = patientDisplayName(user?.firstName, user?.lastName);

  const handleSignOut = () => {
    showToast("Signing out...");
    clearAuth();
    router.replace("/login");
  };

  return (
    <aside className="dash-sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-avatar-ring">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-online" />
        </div>
        <div className="sidebar-name">{fullName}</div>
        <div className="sidebar-role">Patient</div>
        <div className="sidebar-spec">Member since Jan 2025</div>
      </div>

      <div className="hs-panel">
        <div className="hs-label">Overall Health Score</div>
        <div className="hs-row">
          <div
            className="hs-circle"
            style={{ background: `conic-gradient(var(--green) 0% ${HEALTH_SCORE.score}%, var(--gray-200) ${HEALTH_SCORE.score}%)` }}
          >
            <div className="hs-inner">
              <div className="hs-num">{HEALTH_SCORE.score}</div>
              <div className="hs-sub">/ 100</div>
            </div>
          </div>
          <div>
            <div className="hs-status">{HEALTH_SCORE.status}</div>
            <div className="hs-desc">{HEALTH_SCORE.desc}</div>
          </div>
        </div>
        <div className="mb-rows">
          {HEALTH_SCORE.metrics.map((m) => (
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
              const active =
                pathname === item.href || (item.href !== "/patient" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`snav-item${active ? " active" : ""}`}
                  onClick={() => setMobileSidebarOpen(false)}
                >
                  <span className="snav-ico">{item.ico}</span>
                  {item.name}
                  {item.badge ? (
                    <span className={`snav-badge ${item.badgeClass ?? ""}`}>{item.badge}</span>
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
