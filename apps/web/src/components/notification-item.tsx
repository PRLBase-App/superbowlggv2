"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { timeAgo } from "@sbgg/core";
import { safeReturnTo } from "@/lib/return-url";

export function NotificationItem({ notification }: { notification: { id: string; title: string; body: string | null; link: string | null; read: boolean; createdAt: string } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const destination = safeReturnTo(notification.link, "/notifications");
  const content = <><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-brand-text">{notification.title}</p>{notification.body ? <p className="mt-0.5 text-sm text-brand-muted">{notification.body}</p> : null}<p className="mt-1 text-xs text-brand-muted">{timeAgo(notification.createdAt)}</p></div>{!notification.read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-primary" aria-label="Unread" /> : null}</div>{error ? <p className="mt-2 text-xs text-brand-danger" role="alert">{error}</p> : null}</>;

  if (notification.read) return <Link href={destination} className="card card-hover block opacity-60">{content}</Link>;
  return <button type="button" disabled={busy} className="card card-hover block w-full text-left disabled:opacity-70" onClick={async () => {
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const response = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: notification.id }) });
      if (!response.ok) throw new Error("Could not mark this notification as read.");
      router.push(destination);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The network did not respond.");
      setBusy(false);
    }
  }}>{content}</button>;
}
