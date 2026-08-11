import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/games", label: "Games" },
  { href: "/admin/predictions", label: "Predictions" },
  { href: "/admin/marketplace", label: "Marketplace" },
  { href: "/admin/affiliate", label: "Affiliate" },
  { href: "/admin/ads", label: "Ads" },
  { href: "/admin/gamification", label: "Gamification" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/audit-log", label: "Audit log" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="font-display mb-3 text-lg font-semibold text-brand-text">Admin</p>
        <nav className="flex flex-wrap gap-1 lg:flex-col" aria-label="Admin">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="tab lg:w-full">{n.label}</Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
