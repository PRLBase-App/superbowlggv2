import type { Metadata } from "next";
import Link from "next/link";
import { getAdminStats } from "@/lib/data";

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
    { label: "Marketplace Redemptions", value: stats.redemptions, href: "/admin/marketplace" },
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
      <p className="text-xs text-brand-muted">All figures come from the live database — no mocked numbers.</p>
    </div>
  );
}
