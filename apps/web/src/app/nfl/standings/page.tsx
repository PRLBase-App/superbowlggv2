import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { TeamBadge, EmptyState } from "@/components/ui";
import { getStandings } from "@/lib/data";

export const metadata: Metadata = {
  title: "NFL Standings 2026 — AFC & NFC",
  description: "Current NFL standings for the 2026 season: wins, losses, points for and against.",
};

export const revalidate = 300;

export default async function NflStandingsPage() {
  const standings = await getStandings();
  const grouped: Record<string, typeof standings> = {};
  for (const s of standings) {
    const key = `${s.team.conference} ${s.team.division}`;
    (grouped[key] ??= []).push(s);
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Standings" }]} />
      <SeoHubShell title="NFL Standings 2026" description="Conference and division standings from genuine game results.">
        {standings.length === 0 ? (
          <EmptyState title="Standings update once games finish" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {Object.entries(grouped).map(([key, rows]) => (
              <div key={key} className="overflow-hidden rounded-xl border border-brand-border">
                <h2 className="bg-brand-surface px-4 py-2.5 font-display text-sm font-semibold text-brand-text">{key}</h2>
                <table className="w-full text-sm">
                  <thead className="bg-brand-surface/60">
                    <tr>
                      <th className="table-head px-4 py-2">Team</th>
                      <th className="table-head px-2 py-2 text-right">W</th>
                      <th className="table-head px-2 py-2 text-right">L</th>
                      <th className="table-head px-2 py-2 text-right">T</th>
                      <th className="table-head px-4 py-2 text-right">PF</th>
                      <th className="table-head px-4 py-2 text-right">PA</th>
                      <th className="table-head px-4 py-2 text-right">Strk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {rows.map((s) => (
                      <tr key={s.id} className="hover:bg-brand-surface">
                        <td className="px-4 py-2.5">
                          <Link href={`/nfl/teams/${s.team.slug}`} className="flex items-center gap-2.5">
                            <TeamBadge abbr={s.team.abbreviation} color={s.team.primaryColor} size="sm" />
                            <span className="font-medium text-brand-text">{s.team.name}</span>
                          </Link>
                        </td>
                        <td className="scoreboard-num px-2 py-2.5 text-right">{s.wins}</td>
                        <td className="scoreboard-num px-2 py-2.5 text-right">{s.losses}</td>
                        <td className="scoreboard-num px-2 py-2.5 text-right">{s.ties}</td>
                        <td className="scoreboard-num px-4 py-2.5 text-right text-brand-muted">{s.pointsFor}</td>
                        <td className="scoreboard-num px-4 py-2.5 text-right text-brand-muted">{s.pointsAgainst}</td>
                        <td className={`px-4 py-2.5 text-right text-xs font-bold ${s.streak === "W" ? "text-brand-success" : s.streak === "L" ? "text-brand-danger" : "text-brand-muted"}`}>{s.streak}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </SeoHubShell>
    </>
  );
}
