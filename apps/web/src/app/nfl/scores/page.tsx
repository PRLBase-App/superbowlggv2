import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Badge, TeamBadge, EmptyState } from "@/components/ui";
import { getGames, getSeason } from "@/lib/data";
import { kickoffDisplay } from "@sbgg/core";
import { isHistoricalNflSeason, nflSeasonLabel, gameWeekLabel } from "@/lib/season";

export async function generateMetadata(): Promise<Metadata> {
  const season = await getSeason();
  const label = season ? nflSeasonLabel(season.year) : "NFL";
  const historical = season ? isHistoricalNflSeason(season.year) : false;
  return {
    title: historical ? `${label} Scores — Final Results` : "NFL Scores Today — Live & Final Results",
    description: historical ? `Final scores from the archived ${season?.year} NFL provider dataset.` : "NFL scores: live scores, final results and upcoming games.",
  };
}

export const revalidate = 30;

export default async function NflScoresPage() {
  const [finalGames, liveGames, upcoming, season] = await Promise.all([
    getGames({ status: "FINAL", limit: 30 }),
    getGames({ status: "LIVE", limit: 5 }),
    getGames({ status: "SCHEDULED", limit: 12 }),
    getSeason(),
  ]);
  const label = season ? nflSeasonLabel(season.year) : "NFL";
  const historical = season ? isHistoricalNflSeason(season.year) : false;

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Scores" }]} />
      <SeoHubShell title={`${label} Scores`} description={historical ? "Final scores from the archived provider season." : "Live and final NFL scores from the current season, plus what's coming up next."}>
        {liveGames.length ? (
          <section className="mb-8">
            <h2 className="font-display mb-3 text-xl font-semibold text-brand-danger">● Live now</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {liveGames.map((g) => (
                <Link key={g.id} href={`/games/${g.id}`} className="card card-hover">
                  <div className="flex items-center justify-between">
                    <TeamBadge abbr={g.awayTeam.abbreviation} color={g.awayTeam.primaryColor} logoUrl={g.awayTeam.logoUrl} size="sm" />
                    <span className="scoreboard-num text-2xl text-brand-text">{g.awayScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <TeamBadge abbr={g.homeTeam.abbreviation} color={g.homeTeam.primaryColor} logoUrl={g.homeTeam.logoUrl} size="sm" />
                    <span className="scoreboard-num text-2xl text-brand-text">{g.homeScore}</span>
                  </div>
                  <p className="mt-2 text-xs text-brand-muted">{g.quarter}Q · {g.clock}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-8">
          <h2 className="font-display mb-3 text-xl font-semibold">Final scores</h2>
          {finalGames.length === 0 ? (
            <EmptyState title="No finished games yet" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {finalGames.map((g) => (
                <Link key={g.id} href={`/games/${g.id}`} className="card card-hover">
                  <div className="flex items-center justify-between">
                    <TeamBadge abbr={g.awayTeam.abbreviation} color={g.awayTeam.primaryColor} logoUrl={g.awayTeam.logoUrl} size="sm" />
                    <span className="scoreboard-num text-xl text-brand-text">{g.awayScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <TeamBadge abbr={g.homeTeam.abbreviation} color={g.homeTeam.primaryColor} logoUrl={g.homeTeam.logoUrl} size="sm" />
                    <span className="scoreboard-num text-xl text-brand-text">{g.homeScore}</span>
                  </div>
                  <p className="mt-2 flex items-center justify-between text-xs text-brand-muted">
                    <Badge tone="slate">Final</Badge>
                    <span>{gameWeekLabel(g.seasonType, g.week)}</span>
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display mb-3 text-xl font-semibold">Up next</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((g) => (
              <Link key={g.id} href={`/games/${g.id}`} className="card card-hover">
                <div className="flex items-center justify-between text-sm">
                  <TeamBadge abbr={g.awayTeam.abbreviation} color={g.awayTeam.primaryColor} logoUrl={g.awayTeam.logoUrl} size="sm" />
                  <span className="text-brand-muted">@</span>
                  <TeamBadge abbr={g.homeTeam.abbreviation} color={g.homeTeam.primaryColor} logoUrl={g.homeTeam.logoUrl} size="sm" />
                </div>
                <p className="mt-2 text-xs text-brand-muted">{kickoffDisplay(g.scheduledAt)}</p>
              </Link>
            ))}
          </div>
        </section>
      </SeoHubShell>
    </>
  );
}
