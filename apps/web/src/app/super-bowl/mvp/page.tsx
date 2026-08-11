import type { Metadata } from "next";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { SUPER_BOWLS } from "@/lib/super-bowl-data";

export const metadata: Metadata = {
  title: "Super Bowl MVPs — Complete List",
  description: "Every Super Bowl MVP from Bart Starr (I) to the present.",
};

export const revalidate = 3600;

export default async function SuperBowlMvpPage() {
  const mvpCounts = new Map<string, number>();
  for (const sb of SUPER_BOWLS) {
    if (sb.mvp === "TBD") continue;
    for (const name of sb.mvp.split(" / ")) mvpCounts.set(name, (mvpCounts.get(name) ?? 0) + 1);
  }
  const top = [...mvpCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Super Bowl", href: "/super-bowl" }, { label: "MVP" }]} />
      <SeoHubShell title="Super Bowl MVPs" description="Every Super Bowl MVP, with the all-time leaders.">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display mb-3 text-xl font-semibold">MVP by game</h2>
            <div className="space-y-1.5">
              {[...SUPER_BOWLS].reverse().map((sb) => (
                <div key={sb.number} className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm">
                  <span className="text-brand-muted">SB {sb.number} · {sb.year}</span>
                  <span className="font-semibold text-brand-text">{sb.mvp}</span>
                </div>
              ))}
            </div>
          </div>
          <aside>
            <h2 className="font-display mb-3 text-xl font-semibold">Most MVPs</h2>
            <div className="space-y-1.5">
              {top.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm">
                  <span className="font-medium text-brand-text">{name}</span>
                  <span className="badge bg-brand-gold/15 text-brand-gold ring-1 ring-brand-gold/30">{count}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </SeoHubShell>
    </>
  );
}
