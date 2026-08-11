import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Badge, TeamBadge, EmptyState } from "@/components/ui";
import { getGames, getSeason } from "@/lib/data";
import { kickoffDisplay, gameStatusLabel } from "@sbgg/core";

export const metadata: Metadata = {
  title: "NFL Schedule 2026 — Every Game, Every Week",
  description: "Full 2026 NFL schedule by week: dates, times, matchups and broadcast info.",
};

export const revalidate = 60;

export default async function NflSchedulePage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const sp = await searchParams;
  const season = await getSeason();
  const weeks = Array.from({ length: Math.max(4, season?.currentWeek ?? 4) }, (_, i) => i + 1);
  const week = sp.week ? Number(sp.week) : 1;
  const games = await getGames({ week, limit: 40 });

  const schedSchema = { "@context": "https://schema.org", "@type": "ItemList", name: `NFL Week ${week} Schedule`, itemListElement: games.map((g, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "SportsEvent", name: `${g.awayTeam.name} at ${g.homeTeam.name}`, startDate: g.scheduledAt.toISOString() } })) };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schedSchema) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Schedule" }]} />
      <SeoHubShell title="NFL Schedule 2026" description="Every NFL game by week with kickoff times and broadcast info. Updated continuously during the season.">
        <nav className="mb-4 flex flex-wrap gap-2" aria-label="Week selection">
          {weeks.map((w) => (
            <Link key={w} href={`/nfl/schedule?week=${w}`} className={`tab ${week === w ? "tab-active" : ""}`}>Week {w}</Link>
          ))}
        </nav>
        {games.length === 0 ? (
          <EmptyState title="No games this week" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-brand-border">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface">
                <tr>
                  <th className="table-head px-4 py-3">Matchup</th>
                  <th className="table-head hidden px-4 py-3 md:table-cell">Kickoff</th>
                  <th className="table-head hidden px-4 py-3 lg:table-cell">Venue</th>
                  <th className="table-head px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {games.map((g) => (
                  <tr key={g.id} className="hover:bg-brand-surface">
                    <td className="px-4 py-3">
                      <Link href={`/games/${g.id}`} className="flex items-center gap-3">
                        <TeamBadge abbr={g.awayTeam.abbreviation} color={g.awayTeam.primaryColor} size="sm" />
                        <span className="text-brand-muted">@</span>
                        <TeamBadge abbr={g.homeTeam.abbreviation} color={g.homeTeam.primaryColor} size="sm" />
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-brand-muted md:table-cell">{kickoffDisplay(g.scheduledAt)}</td>
                    <td className="hidden px-4 py-3 text-brand-muted lg:table-cell">{g.venue}</td>
                    <td className="px-4 py-3"><Badge tone={g.status === "LIVE" ? "red" : g.status === "FINAL" ? "slate" : "blue"}>{gameStatusLabel(g.status)}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SeoHubShell>
    </>
  );
}
