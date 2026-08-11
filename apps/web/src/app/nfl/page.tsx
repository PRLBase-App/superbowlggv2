import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card, TeamBadge, Badge, EmptyState } from "@/components/ui";
import { getGames, getStandings, getSeason, getInjuries } from "@/lib/data";
import { kickoffDisplay } from "@sbgg/core";
import { currentNflSeasonYear, nflSeasonLabel } from "@/lib/season";

export const metadata: Metadata = {
  title: "NFL — Schedule, Scores, Standings, Odds & Predictions",
  description: "Complete NFL hub: schedule, scores, standings, odds, predictions, team pages, player stats and injury reports.",
};

export const revalidate = 60;

export default async function NflHubPage() {
  const [games, standings, season, injuries] = await Promise.all([getGames({ status: "SCHEDULED", limit: 12 }), getStandings(), getSeason(), getInjuries()]);
  const week = season?.currentWeek ?? 1;
  const label = season ? nflSeasonLabel(season.year) : `${currentNflSeasonYear()} NFL season`;

  const links = [
    { href: "/nfl/schedule", label: "Schedule" },
    { href: "/nfl/scores", label: "Scores" },
    { href: "/nfl/news", label: "News" },
    { href: "/blog", label: "Analysis" },
    { href: "/nfl/standings", label: "Standings" },
    { href: "/nfl/predictions", label: "Predictions" },
    { href: "/nfl/odds", label: "Odds" },
    { href: "/nfl/stats", label: "Stats" },
    { href: "/nfl/teams", label: "Teams" },
    { href: "/nfl/players", label: "Players" },
    { href: "/nfl/injuries", label: "Injuries" },
    { href: "/nfl/week/1", label: "Weeks" },
    { href: "/nfl/playoffs", label: "Playoffs" },
    { href: "/nfl/power-rankings", label: "Power Rankings" },
  ];

  const nflSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "NFL Hub",
    about: { "@type": "SportsOrganization", name: "National Football League" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(nflSchema) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL" }]} />
      <SeoHubShell title={`${currentNflSeasonYear()} NFL`} description={`The complete ${label.toLowerCase()}: current news, schedules, scores, standings, odds, community predictions and analytics in one place. Week ${week} is featured below.`} links={links}>
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="font-display mb-3 text-xl font-semibold">Upcoming games (Week {week})</h2>
            {games.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {games.map((g) => (
                  <Link key={g.id} href={`/games/${g.id}`} className="card card-hover">
                    <div className="flex items-center justify-between text-sm">
                      <TeamBadge abbr={g.awayTeam.abbreviation} color={g.awayTeam.primaryColor} logoUrl={g.awayTeam.logoUrl} size="sm" />
                      <span className="text-xs text-brand-muted">@</span>
                      <TeamBadge abbr={g.homeTeam.abbreviation} color={g.homeTeam.primaryColor} logoUrl={g.homeTeam.logoUrl} size="sm" />
                    </div>
                    <p className="mt-2 text-xs text-brand-muted">{kickoffDisplay(g.scheduledAt)}</p>
                  </Link>
                ))}
              </div>
            ) : <EmptyState title="The 2026 schedule is synchronizing" body="Historical games are not substituted for the current season." />}
            <h2 className="font-display mb-3 mt-8 text-xl font-semibold">2026 injury watch</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {injuries.slice(0, 6).map((i) => (
                <Card key={i.id} className="!p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-brand-text">{i.player.name}</span>
                    <Badge tone={i.status === "OUT" ? "red" : "gold"}>{i.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-brand-muted">{i.player.team?.abbreviation} · {i.bodyPart}</p>
                </Card>
              ))}
              {!injuries.length ? <div className="sm:col-span-2"><EmptyState title="No current injury feed is available" body="The site will not display historical reports as current injuries." /></div> : null}
            </div>
          </section>
          <aside>
            <h2 className="font-display mb-3 text-xl font-semibold">Standings snapshot</h2>
            <div className="space-y-2">
              {standings.slice(0, 10).map((s) => (
                <Link key={s.id} href={`/nfl/teams/${s.team.slug}`} className="card card-hover flex items-center justify-between !p-3 text-sm">
                  <TeamBadge abbr={s.team.abbreviation} color={s.team.primaryColor} logoUrl={s.team.logoUrl} size="sm" />
                  <span className="scoreboard-num text-brand-text">{s.wins}-{s.losses}{s.ties ? `-${s.ties}` : ""}</span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm text-brand-muted">
              Community predictions settle automatically — check the <Link href="/leaderboard" className="text-brand-primary hover:underline">leaderboard</Link> for the best predictors.
            </p>
          </aside>
        </div>
      </SeoHubShell>
    </>
  );
}
