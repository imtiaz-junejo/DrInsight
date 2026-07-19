"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminNav, adminRouteId } from "@/config/admin-nav";
import { useAuthStore } from "@/store/auth.store";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { getInitials } from "@/lib/admin-utils";
import { useAdminNavBadges } from "@/services/cms-api-hooks";
import { AdminNavIcon, DoctorIconInline, LogOut } from "@/components/doctor/icons/DoctorIcons";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const sidebarOpen = useAdminUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAdminUiStore((s) => s.setSidebarOpen);
  const showToast = useAdminUiStore((s) => s.showToast);
  const badgesQuery = useAdminNavBadges();
  const badges = badgesQuery.data ?? {};
  const routeId = adminRouteId(pathname);

  const handleSignOut = () => {
    showToast("Signing out...");
    clearAuth();
    router.replace("/login");
  };

  return (
    <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
      <div className="sb-logo">
        <div className="sb-logo-ic">✚</div>
        <div>
          <div className="sb-logo-txt">DrInsight</div>
          <div className="sb-logo-sub">Admin Panel</div>
        </div>
      </div>
      <nav className="sb-nav">
        {adminNav.map((group) => (
          <div key={group.lbl}>
            <div className="sb-section-lbl">{group.lbl}</div>
            {group.items.map((item) => {
              const active = routeId === item.id || pathname === item.href;
              const badgeCount = badges[item.badgeKey ?? item.id] ?? 0;
              const badge = badgeCount > 0 ? String(badgeCount > 99 ? "99+" : badgeCount) : undefined;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`sb-item${active ? " active" : ""}`}
                  data-id={item.id}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sb-ico">
                    <AdminNavIcon id={item.id} />
                  </span>
                  {item.name}
                  {badge ? <span className="sb-badge">{badge}</span> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sb-foot">
        <div className="sb-admin">
          <div className="sb-av">{getInitials(user?.firstName, user?.lastName)}</div>
          <div>
            <div className="sb-admin-name">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="sb-admin-role">Super Admin</div>
          </div>
        </div>
        <button type="button" className="sb-signout" onClick={handleSignOut}>
          <DoctorIconInline icon={LogOut} size="sidebar" tone="error">
            Sign Out
          </DoctorIconInline>
        </button>
      </div>
    </aside>
  );
}
