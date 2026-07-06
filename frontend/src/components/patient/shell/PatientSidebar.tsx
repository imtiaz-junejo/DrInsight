"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { patientNav } from "@/config/patient-nav";
import { formatDate } from "@/lib/data-mappers";
import { getInitials, patientDisplayName } from "@/lib/patient-utils";
import { useAuthProfile, usePatientAppointments } from "@/services/patient-api-hooks";
import { useAuthStore } from "@/store/auth.store";
import { usePatientUiStore } from "@/store/patient-ui.store";

const UPCOMING_STATUSES = new Set(["CONFIRMED", "PENDING", "IN_PROGRESS"]);

export function PatientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const showToast = usePatientUiStore((s) => s.showToast);
  const setMobileSidebarOpen = usePatientUiStore((s) => s.setMobileSidebarOpen);
  const mobileSidebarOpen = usePatientUiStore((s) => s.mobileSidebarOpen);
  const profileQuery = useAuthProfile();
  const appointmentsQuery = usePatientAppointments({ limit: 50 });

  const profile = profileQuery.data;
  const initials = getInitials(profile?.firstName ?? user?.firstName, profile?.lastName ?? user?.lastName);
  const fullName = patientDisplayName(profile?.firstName ?? user?.firstName, profile?.lastName ?? user?.lastName);
  const memberSince = profile?.createdAt ? formatDate(profile.createdAt, { month: "short", year: "numeric" }) : "—";

  const appointments = appointmentsQuery.data?.data ?? [];
  const upcomingCount = appointments.filter((a) => UPCOMING_STATUSES.has(a.status)).length;
  const totalCount = appointmentsQuery.data?.meta.total ?? appointments.length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  const handleSignOut = () => {
    showToast("Signing out...");
    clearAuth();
    router.replace("/login");
  };

  return (
    <aside className={`dash-sidebar${mobileSidebarOpen ? " open" : ""}`}>
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
        <div className="hs-label">My Consultations</div>
        <div className="hs-row">
          <div
            className="hs-circle"
            style={{
              background: `conic-gradient(var(--green) 0% ${totalCount > 0 ? Math.min(100, (upcomingCount / totalCount) * 100) : 0}%, var(--gray-200) ${totalCount > 0 ? Math.min(100, (upcomingCount / totalCount) * 100) : 0}%)`,
            }}
          >
            <div className="hs-inner">
              <div className="hs-num">{upcomingCount}</div>
              <div className="hs-sub">upcoming</div>
            </div>
          </div>
          <div>
            <div className="hs-status">{upcomingCount > 0 ? "Scheduled 🟢" : "All clear 🟢"}</div>
            <div className="hs-desc">
              {appointmentsQuery.isLoading
                ? "Loading appointments..."
                : `${totalCount} total consultation${totalCount === 1 ? "" : "s"}`}
            </div>
          </div>
        </div>
        <div className="mb-rows">
          {[
            { label: "Total", value: totalCount, color: "var(--blue)" },
            { label: "Upcoming", value: upcomingCount, color: "var(--green)" },
            { label: "Completed", value: completedCount, color: "var(--teal)" },
          ].map((m) => (
            <div key={m.label} className="mb-row">
              <span className="mb-lbl">{m.label}</span>
              <div className="mb-bar">
                <div
                  className="mb-fill"
                  style={{
                    width: totalCount > 0 ? `${Math.min(100, (m.value / totalCount) * 100)}%` : "0%",
                    background: m.color,
                  }}
                />
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
