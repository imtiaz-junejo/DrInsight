"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAdminPageMeta } from "@/config/admin-nav";
import { useAdminUiStore } from "@/store/admin-ui.store";
import { useAdminUnreadNotifications } from "@/services/admin-api-hooks";
import { AdminSearch } from "./AdminSearch";

export function AdminTopbar() {
  const pathname = usePathname();
  const [title, subtitle] = getAdminPageMeta(pathname);
  const toggleSidebar = useAdminUiStore((s) => s.toggleSidebar);
  const showToast = useAdminUiStore((s) => s.showToast);
  const unreadQuery = useAdminUnreadNotifications();
  const unreadCount = unreadQuery.data?.count ?? 0;

  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" className="mob-toggle" onClick={toggleSidebar}>
          ☰
        </button>
        <div>
          <div className="tb-title">{title}</div>
          <div className="tb-sub">{subtitle}</div>
        </div>
      </div>
      <div className="tb-right">
        <AdminSearch />
        <button
          type="button"
          className="tb-icon-btn"
          onClick={() => showToast(unreadCount > 0 ? `${unreadCount} new notifications` : "No new notifications")}
        >
          🔔
          {unreadCount > 0 ? <span className="tb-dot" /> : null}
        </button>
        <Link href="/admin/seo-settings" className="tb-icon-btn" onClick={() => showToast("Opening settings...")}>
          ⚙️
        </Link>
      </div>
    </div>
  );
}
