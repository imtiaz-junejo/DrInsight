"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { adminNav, adminRouteId } from "@/config/admin-nav";
import { useAuthStore } from "@/store/auth.store";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { getInitials } from "@/lib/admin-utils";
import { useAdminNavBadges } from "@/services/cms-api-hooks";
import { usePublicSiteConfig } from "@/services/configuration-api-hooks";
import { BRAND_LOGO_ALT, FOOTER_LOGO_SRC } from "@/config/brand-logos";
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
  const siteConfig = usePublicSiteConfig();
  const badges = badgesQuery.data ?? {};
  const routeId = adminRouteId(pathname);
  const footerLogo = siteConfig.data?.footerLogoUrl?.trim() || FOOTER_LOGO_SRC;
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    adminNav.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children?.some((child) => child.id === routeId)) {
          setOpenMenus((prev) => ({ ...prev, [item.id]: true }));
        }
      });
    });
  }, [routeId]);

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderBadge = (item: { badgeKey?: string; id: string }) => {
    const badgeCount = badges[item.badgeKey ?? item.id] ?? 0;
    return badgeCount > 0 ? (
      <span className="sb-badge">{badgeCount > 99 ? "99+" : badgeCount}</span>
    ) : null;
  };

  return (
    <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
      <div className="sb-logo">
        <img src={footerLogo} alt={BRAND_LOGO_ALT} className="sb-logo-img" />
      </div>
      <nav className="sb-nav">
        {adminNav.map((group) => (
          <div key={group.lbl}>
            <div className="sb-section-lbl">{group.lbl}</div>
            {group.items.map((item) => {
              if (item.children?.length) {
                const childActive = item.children.some((child) => routeId === child.id);
                const open = openMenus[item.id] ?? childActive;
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      className={`sb-item sb-parent${childActive ? " active" : ""}`}
                      onClick={() => toggleMenu(item.id)}
                    >
                      <span className="sb-ico">
                        <AdminNavIcon id={item.id} />
                      </span>
                      <span className="sb-item-label" title={item.name}>
                        {item.name}
                      </span>
                      {renderBadge(item)}
                      <span className={`sb-caret${open ? " open" : ""}`}>▾</span>
                    </button>
                    <div className={`sb-subwrap${open ? " open" : ""}`}>
                      {item.children.map((child) => {
                        const active = routeId === child.id || pathname === child.href;
                        return (
                          <Link
                            key={child.id}
                            href={child.href!}
                            className={`sb-item sb-sub${active ? " active" : ""}`}
                            data-id={child.id}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <span className="sb-ico">
                              <AdminNavIcon id={child.id} />
                            </span>
                            <span className="sb-item-label" title={child.name}>
                              {child.name}
                            </span>
                            {renderBadge(child)}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const active = routeId === item.id || pathname === item.href;
              return (
                <Link
                  key={item.id}
                  href={item.href!}
                  className={`sb-item${active ? " active" : ""}`}
                  data-id={item.id}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sb-ico">
                    <AdminNavIcon id={item.id} />
                  </span>
                  <span className="sb-item-label" title={item.name}>
                    {item.name}
                  </span>
                  {renderBadge(item)}
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
        <button
          type="button"
          className="sb-signout"
          onClick={() => {
            showToast("Signing out...");
            clearAuth();
            router.replace("/login");
          }}
        >
          <DoctorIconInline icon={LogOut} size="sidebar" tone="error">
            Sign Out
          </DoctorIconInline>
        </button>
      </div>
    </aside>
  );
}
