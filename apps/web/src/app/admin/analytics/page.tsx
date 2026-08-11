import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Admin · Analytics" };

export const revalidate = 60;

export default async function AdminAnalyticsPage() {
  // Server component: deliberately computed once for this request.
  // eslint-disable-next-line react-hooks/purity
  const last24hCutoff = new Date(Date.now() - 86400000);
  const [total, byEvent, byPage, last24h] = await Promise.all([
    prisma.analyticsEvent.count(),
    prisma.analyticsEvent.groupBy({ by: ["event"], _count: true, orderBy: { _count: { event: "desc" } }, take: 15 }),
    prisma.analyticsEvent.groupBy({ by: ["page"], _count: true, orderBy: { _count: { page: "desc" } }, take: 15 }),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: last24hCutoff } } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Analytics</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card><p className="text-xs uppercase tracking-wide text-brand-muted">All events</p><p className="scoreboard-num mt-1 text-2xl font-bold text-brand-text">{total}</p></Card>
        <Card><p className="text-xs uppercase tracking-wide text-brand-muted">Last 24h</p><p className="scoreboard-num mt-1 text-2xl font-bold text-brand-text">{last24h}</p></Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display mb-3 text-lg font-semibold">By event</h2>
          <div className="space-y-1.5">
            {byEvent.map((e) => (
              <div key={e.event} className="flex justify-between rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm">
                <span className="text-brand-text">{e.event}</span><span className="scoreboard-num text-brand-muted">{e._count}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-display mb-3 text-lg font-semibold">By page</h2>
          <div className="space-y-1.5">
            {byPage.map((p) => (
              <div key={p.page} className="flex justify-between rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm">
                <span className="truncate text-brand-text">{p.page}</span><span className="scoreboard-num text-brand-muted">{p._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
