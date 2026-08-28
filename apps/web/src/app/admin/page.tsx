import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/lib/data";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Admin", description: "Superbowl.gg admin" };

export const revalidate = 30;

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Registered Users", value: stats.users, href: "/admin/users" },
    { label: "DAU / WAU / MAU", value: `${stats.dau} / ${stats.wau} / ${stats.mau}`, href: "/admin/analytics" },
    { label: "Predictions", value: stats.predictions, href: "/admin/predictions" },
    { label: "Active Games", value: stats.games, href: "/admin/games" },
    { label: "Affiliate Clicks", value: stats.clicks, href: "/admin/affiliate" },
    { label: "Conversions", value: stats.conversions, href: "/admin/affiliate" },
    { label: "Ad Impressions", value: stats.impressions, href: "/admin/ads" },
    { label: "Rewards Store Redemptions", value: stats.redemptions, href: "/admin/marketplace" },
    { label: "SEO Organic Keywords", value: stats.seoKeywords, href: "/admin/seo" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Dashboard</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card card-hover">
            <p className="text-xs uppercase tracking-wide text-brand-muted">{c.label}</p>
            <p className="scoreboard-num mt-1 text-2xl font-bold text-brand-text">{c.value.toLocaleString()}</p>
          </Link>
        ))}
      </div>

      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-brand-text">Recent users</h2>
          <Link href="/admin/users" className="text-xs text-brand-primary hover:underline">View all</Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface">
              <tr>
                <th className="table-head px-4 py-2 text-left">User</th>
                <th className="table-head px-4 py-2 text-left">Email</th>
                <th className="table-head px-4 py-2 text-left">Role</th>
                <th className="table-head px-4 py-2 text-right">Predictions</th>
                <th className="table-head px-4 py-2 text-left">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {stats.recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-brand-surface">
                  <td className="px-4 py-2 font-medium text-brand-text">{u.name ?? "—"}</td>
                  <td className="px-4 py-2 text-brand-muted">{u.email}</td>
                  <td className="px-4 py-2"><Badge tone={u.role === "SUPER_ADMIN" ? "gold" : u.role === "ADMIN" ? "blue" : "slate"}>{u.role}</Badge></td>
                  <td className="scoreboard-num px-4 py-2 text-right">{u._count.predictions}</td>
                  <td className="px-4 py-2 text-brand-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-brand-muted">All figures come from the live database — no mocked numbers.</p>
    </div>
  );
}
