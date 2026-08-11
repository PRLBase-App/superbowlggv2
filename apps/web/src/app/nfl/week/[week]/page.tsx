import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Badge, TeamBadge, EmptyState } from "@/components/ui";
import { getGames, getSeason } from "@/lib/data";
import { kickoffDisplay, gameStatusLabel } from "@sbgg/core";

export async function generateMetadata({ params }: { params: Promise<{ week: string }> }): Promise<Metadata> {
  const { week } = await params;
  return {
    title: `NFL Week ${week} — Schedule, Predictions, Odds & Scores`,
    description: `NFL Week ${week}: full schedule, community predictions, odds and scores.`,
    alternates: { canonical: `/nfl/week/${week}` },
  };
}

export const revalidate = 60;

export default async function NflWeekPage({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  const weekNum = Number(week);
  const [games, season] = await Promise.all([getGames({ week: weekNum, limit: 40 }), getSeason()]);

  const weekSchema = { "@context": "https://schema.org", "@type": "ItemList", name: `NFL Week ${weekNum}`, itemListElement: games.map((g, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "SportsEvent", name: `${g.awayTeam.name} at ${g.homeTeam.name}`, startDate: g.scheduledAt.toISOString() } })) };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(weekSchema) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: `Week ${weekNum}` }]} />
      <SeoHubShell
        title={`NFL Week ${weekNum}`}
        description={`Every NFL Week ${weekNum} game with scores, odds and community predictions.`}
        links={[
          { href: `/nfl/week/${weekNum}/predictions`, label: "Week predictions" },
          { href: `/nfl/week/${weekNum}/odds`, label: "Week odds" },
          { href: `/nfl/week/${weekNum}/schedule`, label: "Week schedule" },
          { href: `/nfl/week/${weekNum + 1}`, label: `Week ${weekNum + 1}` },
        ]}
      >
        {games.length === 0 ? (
          <EmptyState title={`No games in week ${weekNum}`} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => (
              <Link key={g.id} href={`/games/${g.id}`} className="card card-hover">
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <TeamBadge abbr={g.awayTeam.abbreviation} color={g.awayTeam.primaryColor} size="sm" />
                      <span className="scoreboard-num text-brand-text">{g.awayScore}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <TeamBadge abbr={g.homeTeam.abbreviation} color={g.homeTeam.primaryColor} size="sm" />
                      <span className="scoreboard-num text-brand-text">{g.homeScore}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-brand-muted">
                  <Badge tone={g.status === "LIVE" ? "red" : g.status === "FINAL" ? "slate" : "blue"}>{gameStatusLabel(g.status)}</Badge>
                  <span>{kickoffDisplay(g.scheduledAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {season && weekNum < (season.currentWeek ?? 4) + 1 ? (
          <p className="text-sm text-brand-muted">
            Week {weekNum} picks:{" "}
            <Link href={`/nfl/week/${weekNum}/predictions`} className="text-brand-primary hover:underline">community predictions</Link> ·{" "}
            <Link href={`/nfl/week/${weekNum}/odds`} className="text-brand-primary hover:underline">odds</Link>
          </p>
        ) : null}
      </SeoHubShell>
    </>
  );
}
