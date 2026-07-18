"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { doctorNav, doctorRouteId, type DoctorBadgeKey } from "@/config/doctor-nav";
import { getInitials } from "@/lib/doctor-utils";
import {
  useDoctorBlogPosts,
  useDoctorDashboardCounts,
  useDoctorPatients,
  useDoctorProfile,
} from "@/services/doctor-api-hooks";
import { useAuthStore } from "@/store/auth.store";
import { useDoctorUiStore, type DoctorAvailability } from "@/store/doctor-ui.store";

function availabilityClass(value: DoctorAvailability, current: DoctorAvailability) {
  if (value !== current) return "avail-btn";
  if (value === "online") return "avail-btn ag";
  if (value === "busy") return "avail-btn aa";
  return "avail-btn ao";
}

export function DoctorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const availability = useDoctorUiStore((s) => s.availability);
  const setAvailability = useDoctorUiStore((s) => s.setAvailability);
  const showToast = useDoctorUiStore((s) => s.showToast);

  const initials = getInitials(user?.firstName, user?.lastName);
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Doctor";

  const { data: profile } = useDoctorProfile();
  const { data: counts } = useDoctorDashboardCounts();
  const { data: patients } = useDoctorPatients();
  const { data: blog } = useDoctorBlogPosts(user?.id);

  const articleCount = blog?.meta?.total ?? blog?.data?.length ?? 0;

  const badgeValue = (key: DoctorBadgeKey | undefined): number => {
    if (!key) return 0;
    if (key === "articles") return articleCount;
    return counts?.[key] ?? 0;
  };

  const routeId = doctorRouteId(pathname);

  const handleAvailability = (value: DoctorAvailability) => {
    setAvailability(value);
    const label = value === "online" ? "Available" : value === "busy" ? "Busy" : "Offline";
    showToast(`Status set to ${label}`);
  };

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
        <div className="sidebar-name">{fullName.startsWith("Dr.") ? fullName : `Dr. ${fullName}`}</div>
        <div className="sidebar-role">{profile?.professionalTitle || profile?.specialty || "Physician"}</div>
        <div className="sidebar-spec">{profile?.specialty || "Medicine"} · PMC Verified ✓</div>
      </div>

      <div className="dr-stats">
        <div className="dstat">
          <div className="dstat-n">{patients?.length ?? 0}</div>
          <div className="dstat-l">Patients</div>
        </div>
        <div className="dstat">
          <div className="dstat-n">{counts?.consultationsToday ?? 0}</div>
          <div className="dstat-l">Today</div>
        </div>
        <div className="dstat">
          <div className="dstat-n">{articleCount}</div>
          <div className="dstat-l">Articles</div>
        </div>
        <div className="dstat">
          <div className="dstat-n">{profile?.rating ? `${Number(profile.rating).toFixed(1)}★` : "—"}</div>
          <div className="dstat-l">Rating</div>
        </div>
      </div>

      <nav className="snav">
        {doctorNav.map((group) => (
          <div key={group.lbl}>
            <div className="snav-label">{group.lbl}</div>
            {group.items.map((item) => {
              const active = routeId === item.id;
              const badge = badgeValue(item.badgeKey);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`snav-item${active ? " active" : ""}`}
                >
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

      <div className="avail-row">
        <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--gray-600)" }}>Set Availability</div>
        <div className="avail-btns">
          <button
            type="button"
            className={availabilityClass("online", availability)}
            onClick={() => handleAvailability("online")}
          >
            🟢 Online
          </button>
          <button
            type="button"
            className={availabilityClass("busy", availability)}
            onClick={() => handleAvailability("busy")}
          >
            🟡 Busy
          </button>
          <button
            type="button"
            className={availabilityClass("off", availability)}
            onClick={() => handleAvailability("off")}
          >
            ⚫ Off
          </button>
        </div>
      </div>

      <div className="sidebar-footer">
        <button type="button" className="sidebar-signout" onClick={handleSignOut}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
