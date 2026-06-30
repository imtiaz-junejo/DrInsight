"use client";

import {
  PanelTable,
  StatCardRow,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber, formatRelativeTime } from "@/lib/admin-utils";
import { useAdminNotifications } from "@/services/admin-api-hooks";

export function NotificationsPageContent() {
  const notificationsQuery = useAdminNotifications({ limit: 20 });
  const notifications = notificationsQuery.data?.data ?? [];
  const total = notificationsQuery.data?.meta.total ?? 0;

  const rows = notifications.map((n) => [
    "Admin",
    n.type,
    "In-app",
    n.title,
    formatRelativeTime(n.createdAt),
    <StatusChip key={n.id} label={n.readAt ? "Delivered" : "Unread"} className={n.readAt ? "ch-g" : "ch-a"} />,
  ]);

  return (
    <>
      <StatCardRow
        items={[
          { ic: "ic1", icon: "🔔", num: formatNumber(total), label: "Sent (30 days)", tag: "Your notifications", tagClass: "tt-b" },
          { ic: "ic2", icon: "✅", num: "—", label: "Delivery Rate", tag: "No system log API", tagClass: "tt-g" },
          { ic: "ic3", icon: "📧", num: "—", label: "Email", tag: "No API", tagClass: "tt-b" },
          { ic: "ic4", icon: "📱", num: "—", label: "SMS / Push", tag: "No API", tagClass: "tt-b" },
        ]}
      />
      <PanelTable
        title="Recent Notification Log"
        headers={["Recipient", "Type", "Channel", "Message", "Sent", "Status"]}
        rows={rows}
        loading={notificationsQuery.isLoading}
        emptyMessage="No notifications — system-wide log API not available"
      />
    </>
  );
}
