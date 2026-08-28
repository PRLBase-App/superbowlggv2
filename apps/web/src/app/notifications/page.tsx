import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { getNotifications } from "@/lib/data";
import { SectionTitle, EmptyState } from "@/components/ui";
import { MarkAllReadButton } from "@/components/mark-all-read";
import { NotificationItem } from "@/components/notification-item";

export const metadata: Metadata = { title: "Notifications", description: "Your Superbowl.gg notifications." };

export const revalidate = 15;

export default async function NotificationsPage() {
  const session = await requireSession();
  const notifications = await getNotifications(session.user.id);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionTitle sub={unread ? `${unread} unread` : "All caught up"}>
        <span className="text-brand-text">Notifications</span>
      </SectionTitle>
      {unread ? <MarkAllReadButton /> : null}
      {notifications.length === 0 ? (
        <EmptyState title="No notifications yet" body="Follows, settled predictions and rewards land here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={{ ...n, createdAt: n.createdAt.toISOString() }} />
          ))}
        </div>
      )}
    </div>
  );
}
