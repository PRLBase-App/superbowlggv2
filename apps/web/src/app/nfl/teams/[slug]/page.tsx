import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Badge, TeamBadge, EmptyState } from "@/components/ui";
import { getTeam } from "@/lib/data";
import { kickoffDisplay, gameStatusLabel } from "@sbgg/core";
import { gameWeekLabel } from "@/lib/season";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeam(slug);
  if (!team) return { title: "Team not found" };
  return {
    title: `${team.name} — Schedule, Stats, Predictions & Odds`,
    description: `${team.name} (${team.abbreviation}): 2026 NFL schedule, recent results, standings context and community predictions.`,
    alternates: { canonical: `/nfl/teams/${team.slug}` },
  };
}

export const revalidate = 300;

export default async function TeamPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = await getTeam(slug);
  if (!team) notFound();

  const games = [...team.homeGames, ...team.awayGames].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  const standing = team.standings[0];

  const teamSchema = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.name,
    alternateName: team.abbreviation,
    memberOf: { "@type": "SportsOrganization", name: "National Football League" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }} />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Teams", href: "/nfl/teams" }, { label: team.name }]} />
      <SeoHubShell
        title={team.name}
        description={`${team.city} · ${team.conference} ${team.division}${standing ? ` · Record ${standing.wins}-${standing.losses}${standing.ties ? `-${standing.ties}` : ""}` : ""}${team.stadium ? ` · ${team.stadium}` : ""}`}
        links={[
          { href: `/nfl/teams/${team.slug}/predictions`, label: "Team predictions" },
          { href: `/nfl/teams/${team.slug}/stats`, label: "Team stats" },
          { href: "/nfl/standings", label: "Standings" },
        ]}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="font-display mb-3 text-xl font-semibold">Games</h2>
            {games.length === 0 ? (
              <EmptyState title="No games yet" />
            ) : (
              <div className="space-y-2">
                {games.map((g) => {
                  const isHome = g.homeTeamId === team.id;
                  const opp = isHome ? g.awayTeam : g.homeTeam;
                  const ownScore = isHome ? g.homeScore : g.awayScore;
                  const oppScore = isHome ? g.awayScore : g.homeScore;
                  const won = g.status === "FINAL" && ownScore > oppScore;
                  return (
                    <Link key={g.id} href={`/games/${g.id}`} className="card card-hover flex items-center justify-between !p-3">
                      <div className="flex items-center gap-3">
                        <TeamBadge abbr={opp.abbreviation} color={opp.primaryColor} logoUrl={opp.logoUrl} size="sm" />
                        <span className="text-sm text-brand-muted">{isHome ? "vs" : "@"} {opp.name}</span>
                        <Badge tone="slate">{gameWeekLabel(g.seasonType, g.week)}</Badge>
                      </div>
                      <div className="text-right">
                        {g.status === "FINAL" || g.status === "LIVE" ? (
                          <p className={`scoreboard-num text-lg font-bold ${won ? "text-brand-success" : "text-brand-danger"}`}>{ownScore}–{oppScore}</p>
                        ) : (
                          <p className="text-xs text-brand-muted">{kickoffDisplay(g.scheduledAt)}</p>
                        )}
                        <p className="text-[11px] text-brand-muted">{gameStatusLabel(g.status)}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
          <aside className="space-y-6">
            <section>
              <h2 className="font-display mb-3 text-xl font-semibold">Players</h2>
              <div className="space-y-2">
                {team.players.slice(0, 8).map((p) => (
                  <Link key={p.id} href={`/nfl/players/${p.slug}`} className="card card-hover flex items-center justify-between !p-3 text-sm">
                    <span className="font-medium text-brand-text">{p.name}</span>
                    <span className="badge bg-brand-surface2 text-brand-muted ring-1 ring-brand-border">{p.position} · #{p.jerseyNumber}</span>
                  </Link>
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-display mb-3 text-xl font-semibold">Context</h2>
              <div className="card text-sm text-brand-muted">
                <p><span className="font-semibold text-brand-text">Stadium:</span> {team.stadium}</p>
                <p className="mt-1"><span className="font-semibold text-brand-text">Conference:</span> {team.conference} {team.division}</p>
                {standing ? (
                  <p className="mt-1"><span className="font-semibold text-brand-text">Record:</span> {standing.wins}-{standing.losses}{standing.ties ? `-${standing.ties}` : ""} · PF {standing.pointsFor} / PA {standing.pointsAgainst}</p>
                ) : null}
              </div>
            </section>
          </aside>
        </div>
      </SeoHubShell>
    </>
  );
}
