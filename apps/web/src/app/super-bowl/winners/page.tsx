import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { SUPER_BOWLS, superBowlChampionships } from "@/lib/super-bowl-data";

export const metadata: Metadata = {
  title: "Super Bowl Winners — Every Champion",
  description: "Every Super Bowl winner by year, plus the all-time championship count by team.",
};

export const revalidate = 3600;

export default async function SuperBowlWinnersPage() {
  const champs = superBowlChampionships();
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Super Bowl", href: "/super-bowl" }, { label: "Winners" }]} />
      <SeoHubShell title="Super Bowl Winners" description="Every Super Bowl champion from 1967 to today.">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display mb-3 text-xl font-semibold">Champions by year</h2>
            <div className="space-y-1.5">
              {[...SUPER_BOWLS].reverse().map((sb) => (
                <div key={sb.number} className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm">
                  <span className="text-brand-muted">SB {sb.number} · {sb.year}</span>
                  <span className="font-semibold text-brand-text">{sb.winner} <span className="scoreboard-num text-brand-muted">{sb.score}</span></span>
                </div>
              ))}
            </div>
          </div>
          <aside>
            <h2 className="font-display mb-3 text-xl font-semibold">Championships by team</h2>
            <div className="space-y-1.5">
              {champs.map((c) => (
                <div key={c.team} className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm">
                  <span className="font-medium text-brand-text">{c.team}</span>
                  <span className="badge bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30">{c.count}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-brand-muted">
              See the <Link href="/super-bowl/history" className="text-brand-primary hover:underline">full history</Link> or{" "}
              <Link href="/super-bowl/mvp" className="text-brand-primary hover:underline">MVP list</Link>.
            </p>
          </aside>
        </div>
      </SeoHubShell>
    </>
  );
}
