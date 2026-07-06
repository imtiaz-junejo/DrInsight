"use client";

import {
  PanelTable,
  StatCardRow,
  StatusChip,
} from "@/components/admin/ui/AdminPrimitives";
import { formatNumber, formatRelativeTime } from "@/lib/admin-utils";
import { useAdminNotifications, usePlatformStats } from "@/services/admin-api-hooks";

export function NotificationsPageContent() {
  const notificationsQuery = useAdminNotifications({ limit: 20 });
  const statsQuery = usePlatformStats();
  const notifications = notificationsQuery.data?.data ?? [];
  const total = notificationsQuery.data?.meta.total ?? 0;
  const unread = notifications.filter((n) => !n.readAt).length;
  const read = notifications.filter((n) => n.readAt).length;
  const deliveryRate = notifications.length > 0 ? Math.round((read / notifications.length) * 100) : 0;

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
          {
            ic: "ic1",
            icon: "🔔",
            num: formatNumber(statsQuery.data?.notificationCount ?? total),
            label: "Total Notifications",
            tag: "Platform-wide",
            tagClass: "tt-b",
          },
          {
            ic: "ic2",
            icon: "✅",
            num: `${deliveryRate}%`,
            label: "Read Rate",
            tag: "Your inbox sample",
            tagClass: "tt-g",
          },
          {
            ic: "ic3",
            icon: "📬",
            num: formatNumber(total),
            label: "Your Notifications",
            tag: `${unread} unread`,
            tagClass: "tt-b",
          },
          {
            ic: "ic4",
            icon: "💬",
            num: formatNumber(statsQuery.data?.messageCount ?? 0),
            label: "Messages",
            tag: "Platform-wide",
            tagClass: "tt-b",
          },
        ]}
      />
      <PanelTable
        title="Recent Notification Log"
        headers={["Recipient", "Type", "Channel", "Message", "Sent", "Status"]}
        rows={rows}
        loading={notificationsQuery.isLoading}
        emptyMessage="No notifications found"
      />
    </>
  );
}
