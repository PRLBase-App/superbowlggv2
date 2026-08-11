import type { Metadata } from "next";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card, TeamBadge } from "@/components/ui";
import { getStandings } from "@/lib/data";

export const metadata: Metadata = {
  title: "NFL Playoffs & Playoff Picture",
  description: "NFL playoff picture: current conference standings and what it means for the postseason.",
};

export const revalidate = 600;

export default async function NflPlayoffsPage() {
  const standings = await getStandings();
  const seeds = [...standings].sort((a, b) => (b.wins - b.losses) - (a.wins - a.losses) || (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst));
  const afc = seeds.filter((s) => s.team.conference === "AFC").slice(0, 7);
  const nfc = seeds.filter((s) => s.team.conference === "NFC").slice(0, 7);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Playoffs" }]} />
      <SeoHubShell title="NFL Playoff Picture" description="Projected playoff seeds from the current standings. Update as the season progresses.">
        <p className="text-sm text-brand-muted">
          Current seeds are projected from standings — tiebreakers and division winners are applied as the season develops. Playoff predictions and picks will appear here in the postseason.
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {(["AFC", "NFC"] as const).map((conf) => {
            const rows = conf === "AFC" ? afc : nfc;
            return (
              <div key={conf}>
                <h2 className="font-display mb-3 text-xl font-semibold text-brand-text">{conf} — projected seeds</h2>
                <div className="space-y-2">
                  {rows.map((s, i) => (
                    <Card key={s.id} className="flex items-center justify-between !p-3">
                      <div className="flex items-center gap-3">
                        <span className="font-display w-6 text-lg font-bold text-brand-primary">{i + 1}</span>
                        <TeamBadge abbr={s.team.abbreviation} color={s.team.primaryColor} size="sm" />
                        <span className="text-sm font-medium text-brand-text">{s.team.name}</span>
                      </div>
                      <span className="scoreboard-num text-sm text-brand-muted">{s.wins}-{s.losses}</span>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SeoHubShell>
    </>
  );
}
