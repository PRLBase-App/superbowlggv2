import type { Metadata } from "next";
import { requireSession } from "@/lib/session";
import { getNotifications } from "@/lib/data";
import { Card, SectionTitle, EmptyState } from "@/components/ui";
import { MarkAllReadButton } from "@/components/mark-all-read";
import { timeAgo } from "@sbgg/core";

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
            <Card key={n.id} className={`${n.read ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-brand-text">{n.title}</p>
                  {n.body ? <p className="mt-0.5 text-sm text-brand-muted">{n.body}</p> : null}
                  <p className="mt-1 text-xs text-brand-muted">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-primary" aria-label="Unread" /> : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
