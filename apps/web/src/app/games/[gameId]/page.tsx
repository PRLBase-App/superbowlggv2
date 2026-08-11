import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameWithOdds, getGame, getInjuries } from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { Badge, Card, SectionTitle, TeamBadge, OddsCell, EmptyState } from "@/components/ui";
import { PredictionBuilder } from "@/components/prediction-builder";
import { LiveGamePoller } from "@/components/live-game-poller";
import { kickoffDisplay, gameStatusLabel } from "@sbgg/core";

export async function generateMetadata({ params }: { params: Promise<{ gameId: string }> }): Promise<Metadata> {
  const { gameId } = await params;
  const g = await getGameWithOdds(gameId);
  if (!g) return { title: "Game not found" };
  return {
    title: `${g.awayTeam.name} vs ${g.homeTeam.name} Predictions, Odds & Picks`,
    description: `NFL Week ${g.week}: ${g.awayTeam.name} at ${g.homeTeam.name}. Community predictions, odds, stats and injury report.`,
    alternates: { canonical: `/games/${g.id}` },
    openGraph: { title: `${g.awayTeam.abbreviation} @ ${g.homeTeam.abbreviation} — Game Center`, description: `NFL Week ${g.week} matchup, odds and community picks on Superbowl.gg` },
  };
}

export const revalidate = 30;

function normalizedName(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function schemaEventStatus(status: string): string {
  if (status === "LIVE") return "https://schema.org/EventInProgress";
  if (status === "FINAL") return "https://schema.org/EventCompleted";
  if (status === "CANCELLED") return "https://schema.org/EventCancelled";
  if (status === "POSTPONED" || status === "SUSPENDED") return "https://schema.org/EventPostponed";
  return "https://schema.org/EventScheduled";
}

export default async function GameCenterPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const [game, full, user, injuries] = await Promise.all([getGameWithOdds(gameId), getGame(gameId), getSessionUser(), getInjuries()]);
  if (!game || !full) notFound();

  const gameInjuries = injuries.filter((i) => i.player?.teamId === game.homeTeamId || i.player?.teamId === game.awayTeamId);
  const markets = (game.markets ?? [])
    .filter((market) => market.bookmaker && market.outcomes.length > 0)
    .map((market) => ({
      id: market.id,
      key: market.key,
      name: market.name,
      bookmaker: market.bookmaker?.name ?? "Sportsbook",
      outcomes: market.outcomes.map((outcome) => ({
        id: outcome.id,
        name: outcome.name,
        description: outcome.description,
        price: outcome.price,
        point: outcome.point,
      })),
    }));
  const h2h = markets.find((m) => m.key === "h2h");
  const spreads = markets.find((m) => m.key === "spreads");
  const totals = markets.find((m) => m.key === "totals");

  const locationName = game.venue || game.homeTeam.stadium;
  const meta = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${game.awayTeam.name} at ${game.homeTeam.name}`,
    startDate: game.scheduledAt.toISOString(),
    ...(locationName ? { location: { "@type": "StadiumOrArena", name: locationName } } : {}),
    homeTeam: { "@type": "SportsTeam", name: game.homeTeam.name },
    awayTeam: { "@type": "SportsTeam", name: game.awayTeam.name },
    eventStatus: schemaEventStatus(game.status),
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(meta) }} />

      {/* scoreboard */}
      <section className="card yardlines relative overflow-hidden">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="text-center">
              <TeamBadge abbr={game.awayTeam.abbreviation} color={game.awayTeam.primaryColor} logoUrl={game.awayTeam.logoUrl} size="lg" />
              <p className="mt-2 max-w-28 text-sm font-medium text-brand-text">{game.awayTeam.name}</p>
            </div>
            <span className="scoreboard-num text-4xl text-brand-text sm:text-5xl">
              {game.status === "FINAL" || game.status === "LIVE" ? game.awayScore : "—"}
            </span>
            <span className="font-display text-lg text-brand-muted">@</span>
            <span className="scoreboard-num text-4xl text-brand-text sm:text-5xl">
              {game.status === "FINAL" || game.status === "LIVE" ? game.homeScore : "—"}
            </span>
            <div className="text-center">
              <TeamBadge abbr={game.homeTeam.abbreviation} color={game.homeTeam.primaryColor} logoUrl={game.homeTeam.logoUrl} size="lg" />
              <p className="mt-2 max-w-28 text-sm font-medium text-brand-text">{game.homeTeam.name}</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <Badge tone={game.status === "LIVE" ? "red" : game.status === "FINAL" ? "slate" : "blue"}>{gameStatusLabel(game.status)}</Badge>
            <p className="text-sm text-brand-muted">NFL Week {game.week} · {kickoffDisplay(game.scheduledAt)}</p>
            <p className="text-xs text-brand-muted">{game.venue || game.homeTeam.stadium}{game.broadcast ? ` · ${game.broadcast}` : ""}</p>
            <LiveGamePoller gameId={game.id} />
          </div>
        </div>

        {/* quick odds */}
        {(h2h || spreads || totals) ? (
          <div className="mt-6 grid gap-2 border-t border-brand-border pt-4 sm:grid-cols-3">
            {h2h ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Moneyline · {h2h.bookmaker}</p>
                <div className="flex gap-1.5">
                  <OddsCell price={h2h.outcomes.find((o) => normalizedName(o.name) === normalizedName(game.awayTeam.name))?.price} label={game.awayTeam.abbreviation} />
                  <OddsCell price={h2h.outcomes.find((o) => normalizedName(o.name) === normalizedName(game.homeTeam.name))?.price} label={game.homeTeam.abbreviation} />
                </div>
              </div>
            ) : null}
            {spreads ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Spread · {spreads.bookmaker}</p>
                <div className="flex gap-1.5">
                  <OddsCell price={spreads.outcomes.find((o) => normalizedName(o.name) === normalizedName(game.awayTeam.name))?.price} point={spreads.outcomes.find((o) => normalizedName(o.name) === normalizedName(game.awayTeam.name))?.point} label={game.awayTeam.abbreviation} />
                  <OddsCell price={spreads.outcomes.find((o) => normalizedName(o.name) === normalizedName(game.homeTeam.name))?.price} point={spreads.outcomes.find((o) => normalizedName(o.name) === normalizedName(game.homeTeam.name))?.point} label={game.homeTeam.abbreviation} />
                </div>
              </div>
            ) : null}
            {totals ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Total · {totals.bookmaker}</p>
                <div className="flex gap-1.5">
                  <OddsCell price={totals.outcomes.find((o) => o.name === "Over")?.price} point={totals.outcomes.find((o) => o.name === "Over")?.point} label="Over" />
                  <OddsCell price={totals.outcomes.find((o) => o.name === "Under")?.price} point={totals.outcomes.find((o) => o.name === "Under")?.point} label="Under" />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* predictions tab */}
          <section>
            <SectionTitle sub="Community picks on this game">Predictions</SectionTitle>
            {full.predictions.length === 0 ? (
              <EmptyState title="No predictions yet" body="Be the first to publish a pick on this game." />
            ) : (
              <div className="space-y-3">
                {full.predictions.map((p) => (
                  <Link key={p.id} href={`/predictions/${p.id}`} className="card card-hover block">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-brand-text">@{p.user.profile?.username ?? "predictor"}</span>
                        <Badge tone={p.status === "SETTLED" ? (p.result === "WIN" ? "green" : p.result === "LOSS" ? "red" : "slate") : "blue"}>
                          {p.status === "SETTLED" ? p.result : "Pending"}
                        </Badge>
                      </div>
                      <span className="scoreboard-num text-sm text-brand-primary">{p.oddsAtCreation}</span>
                    </div>
                    <p className="mt-2 text-sm text-brand-text">
                      {p.marketType === "MONEYLINE" ? "Moneyline" : p.marketType === "SPREAD" ? "Spread" : p.marketType === "TOTAL" ? "Total" : "Player prop"}:{" "}
                      <strong>
                        {p.selection === "home" ? game.homeTeam.abbreviation : p.selection === "away" ? game.awayTeam.abbreviation : p.selection}
                        {p.line != null ? ` ${p.line > 0 ? "+" : ""}${p.line}` : ""}
                      </strong>
                      {p.player ? ` · ${p.player.name}` : ""}
                    </p>
                    {p.analysis ? <p className="mt-1 line-clamp-2 text-xs text-brand-muted">{p.analysis}</p> : null}
                    <p className="mt-2 text-xs text-brand-muted">{p.virtualUnits} unit{p.virtualUnits !== 1 ? "s" : ""} · {p.confidence} confidence · {p.publishedAt.toLocaleDateString()}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* stats */}
          <section>
            <SectionTitle sub="Team performance in this game">Stats</SectionTitle>
            {full.teamStats.length === 0 ? (
              <EmptyState title="Stats appear after the final whistle" body="Full box score lands when the game settles." />
            ) : (
              <div className="overflow-hidden rounded-xl border border-brand-border">
                <table className="w-full text-sm">
                  <thead className="bg-brand-surface">
                    <tr>
                      <th className="table-head px-4 py-2.5">Team</th>
                      <th className="table-head px-4 py-2.5">Total Yds</th>
                      <th className="table-head px-4 py-2.5">Pass</th>
                      <th className="table-head px-4 py-2.5">Rush</th>
                      <th className="table-head px-4 py-2.5">TO</th>
                      <th className="table-head px-4 py-2.5">1st D</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-border">
                    {full.teamStats.map((ts) => {
                      const team = ts.teamId === game.homeTeamId ? game.homeTeam : game.awayTeam;
                      return (
                        <tr key={ts.id}>
                          <td className="px-4 py-2.5 font-medium text-brand-text">{team.abbreviation}</td>
                          <td className="scoreboard-num px-4 py-2.5">{ts.totalYards}</td>
                          <td className="scoreboard-num px-4 py-2.5">{ts.passYards}</td>
                          <td className="scoreboard-num px-4 py-2.5">{ts.rushYards}</td>
                          <td className="scoreboard-num px-4 py-2.5">{ts.turnovers}</td>
                          <td className="scoreboard-num px-4 py-2.5">{ts.firstDowns}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* players */}
          <section>
            <SectionTitle sub="Key player game stats">Players</SectionTitle>
            {full.playerStats.length === 0 ? (
              <EmptyState title="No player stats yet" />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {full.playerStats.map((ps) => (
                  <Card key={ps.id}>
                    <p className="text-sm font-semibold text-brand-text">{ps.player.name} <span className="text-brand-muted">· {ps.player.position}</span></p>
                    <div className="mt-1.5 grid grid-cols-2 gap-1 text-xs text-brand-muted">
                      <span>Pass: <strong className="text-brand-text">{ps.passingYards} yds / {ps.passingTds} TD</strong></span>
                      <span>INT: <strong className="text-brand-text">{ps.interceptions}</strong></span>
                      <span>Rush: <strong className="text-brand-text">{ps.rushingYards} yds</strong></span>
                      <span>Rec: <strong className="text-brand-text">{ps.receptions} / {ps.receivingYards} yds</strong></span>
                    </div>
                    <p className="mt-1.5 text-xs text-brand-gold">Fantasy: {ps.fantasyPoints} pts</p>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* sidebar */}
        <aside className="space-y-6">
          {user ? (
            <section>
              <SectionTitle sub="Locked at kickoff">Make a Prediction</SectionTitle>
              <PredictionBuilder game={{ id: game.id, homeAbbr: game.homeTeam.abbreviation, awayAbbr: game.awayTeam.abbreviation }} markets={markets} />
            </section>
          ) : (
            <Card>
              <p className="font-display text-lg text-brand-text">Join free to predict</p>
              <p className="mt-1 text-sm text-brand-muted">Publish picks, earn XP and coins, climb the leaderboard.</p>
              <div className="mt-4 flex gap-2">
                <Link href="/auth/sign-up" className="btn-primary">Join Free</Link>
                <Link href="/auth/sign-in" className="btn-secondary">Log in</Link>
              </div>
            </Card>
          )}

          {gameInjuries.length ? (
            <section>
              <SectionTitle sub="Both sides">Injury Report</SectionTitle>
              <div className="space-y-2">
                {gameInjuries.map((i) => (
                  <Card key={i.id} className="!p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-brand-text">{i.player.name}</span>
                      <Badge tone={i.status === "OUT" ? "red" : "gold"}>{i.status}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-brand-muted">{i.player.team?.abbreviation} · {i.bodyPart || "—"}</p>
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <SectionTitle sub="Context">Links</SectionTitle>
            <div className="space-y-1 text-sm">
              <Link href={`/nfl/teams/${game.homeTeam.slug}`} className="block text-brand-primary hover:underline">{game.homeTeam.name} — schedule & stats</Link>
              <Link href={`/nfl/teams/${game.awayTeam.slug}`} className="block text-brand-primary hover:underline">{game.awayTeam.name} — schedule & stats</Link>
              <Link href={`/nfl/week/${game.week}`} className="block text-brand-primary hover:underline">NFL Week {game.week} — all games</Link>
              <Link href={`/nfl/week/${game.week}/predictions`} className="block text-brand-primary hover:underline">Week {game.week} predictions</Link>
              <Link href="/nfl/standings" className="block text-brand-primary hover:underline">NFL standings</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
