"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminNav } from "@/config/admin-nav";
import { useAuthStore } from "@/store/auth.store";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { getInitials } from "@/lib/admin-utils";
import { usePendingUsers, useAdminAppointments } from "@/services/admin-api-hooks";

function resolveBadge(itemId: string, staticBadge: string | undefined, pendingCount: number, appointmentPending: number) {
  if (itemId === "consult-requests" && appointmentPending > 0) return String(appointmentPending);
  if (itemId === "audit-log" && pendingCount > 0) return String(Math.min(pendingCount, 9));
  return staticBadge;
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const sidebarOpen = useAdminUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAdminUiStore((s) => s.setSidebarOpen);
  const showToast = useAdminUiStore((s) => s.showToast);
  const pendingQuery = usePendingUsers();
  const appointmentsQuery = useAdminAppointments({ status: "PENDING", limit: 100 });
  const pendingUsers = pendingQuery.data?.length ?? 0;
  const pendingAppointments = appointmentsQuery.data?.meta.total ?? 0;

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
          <div className="sb-logo-txt">MedAuthority</div>
          <div className="sb-logo-sub">Admin Panel</div>
        </div>
      </div>
      <nav className="sb-nav">
        {adminNav.map((group) => (
          <div key={group.lbl}>
            <div className="sb-section-lbl">{group.lbl}</div>
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const badge = resolveBadge(item.id, item.badge, pendingUsers, pendingAppointments);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`sb-item${active ? " active" : ""}`}
                  data-id={item.id}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sb-ico">{item.ico}</span>
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
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
