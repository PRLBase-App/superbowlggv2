import Link from "next/link";
import type { Metadata } from "next";
import { getSessionUser } from "@/lib/session";
import { getGames, getLeaderboard, getMarketplaceOffers, getAffiliateOffers, getStandings, getPredictionFeed, getSeason } from "@/lib/data";
import { Card, Badge, SectionTitle, TeamBadge, EmptyState } from "@/components/ui";
import { kickoffDisplay, gameStatusLabel } from "@sbgg/core";
import { prisma } from "@sbgg/db";
import { SUPER_BOWLS } from "@/lib/super-bowl-data";
import { nflSeasonLabel } from "@/lib/season";

export const metadata: Metadata = {
  title: "Superbowl.gg — NFL Predictions, Super Bowl Odds & Picks",
  description: "Provider-sourced NFL and Super Bowl odds, spreads and totals alongside community predictions, standings, player stats and transparent leaderboards.",
};

export const revalidate = 60;

export default async function HomePage() {
  const [user, games, trending, leaderboard, offers, affiliateOffers, standings, season] = await Promise.all([
    getSessionUser(),
    getGames({ status: "SCHEDULED", limit: 8 }),
    getPredictionFeed({ filter: "trending", limit: 6 }),
    getLeaderboard("allTime", 5),
    getMarketplaceOffers(),
    getAffiliateOffers(),
    getStandings(),
    getSeason(),
  ]);

  const liveGames = await getGames({ status: "LIVE", limit: 4 });
  const todayGames = games.filter((g) => new Date(g.scheduledAt).toDateString() === new Date().toDateString());
  const showGames = liveGames.length ? liveGames : todayGames.length ? todayGames : games;
  const consensusRows = showGames.length ? await prisma.prediction.groupBy({
    by: ["gameId", "selection"],
    where: {
      gameId: { in: showGames.map((game) => game.id) },
      marketType: "MONEYLINE",
      selection: { in: ["home", "away"] },
      isPublic: true,
    },
    _count: { _all: true },
  }) : [];

  const topDivisions = standings.slice(0, 8);
  const seasonContext = showGames[0];
  const nextSuperBowl = SUPER_BOWLS[SUPER_BOWLS.length - 1]!;

  return (
    <div className="space-y-12">
      {/* ── Hero ── */}
      <section className="yardlines relative overflow-hidden rounded-2xl border border-brand-border bg-gradient-to-b from-brand-surface2 via-brand-surface to-brand-bg px-6 py-14 sm:px-12">
        <div className="grid-field pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative max-w-2xl">
          <Badge tone="blue" className="mb-4">{seasonContext ? `${nflSeasonLabel(seasonContext.season.year)} · Week ${seasonContext.week}` : "NFL predictions & analytics"}</Badge>
          {user ? (
            <p className="mb-2 text-sm text-brand-muted">Welcome back, {user.name?.split(" ")[0] ?? user.username}</p>
          ) : null}
          <h1 className="font-display text-4xl font-bold leading-tight text-brand-text sm:text-5xl">
            Predict football.
            <br />
            <span className="text-brand-primary">Build your record.</span>
            <br />
            Beat the crowd.
          </h1>
          <p className="mt-4 max-w-lg text-brand-muted">
            Community NFL predictions with real settlement, odds, XP and coins. Follow the best predictors, climb the leaderboard and prove your football IQ.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/games" className="btn-primary">
              Explore Games
            </Link>
            <Link href={user ? "/games" : "/auth/sign-up"} className="btn-secondary">
              {user ? "Make a Prediction" : "Join Free — 1000 Coins"}
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="yardlines">
          <Badge tone="gold">Super Bowl {nextSuperBowl.number} · {nextSuperBowl.year}</Badge>
          <h2 className="font-display mt-3 text-2xl font-bold text-brand-text">Super Bowl odds, spreads and predictions</h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-muted">
            Follow the road to {nextSuperBowl.venue} in {nextSuperBowl.city}. Verified moneyline, spread and total lines appear only when the configured odds provider publishes a matched Super Bowl event.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/super-bowl" className="btn-primary">Super Bowl Hub</Link>
            <Link href="/super-bowl/odds" className="btn-secondary">Odds & Lines</Link>
            <Link href="/super-bowl/predictions" className="btn-secondary">Predictions</Link>
          </div>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wide text-brand-muted">Event facts</p>
          <dl className="mt-3 space-y-3 text-sm">
            <div><dt className="text-brand-muted">Venue</dt><dd className="font-semibold text-brand-text">{nextSuperBowl.venue}</dd></div>
            <div><dt className="text-brand-muted">Host city</dt><dd className="font-semibold text-brand-text">{nextSuperBowl.city}</dd></div>
            <div><dt className="text-brand-muted">Matchup</dt><dd className="font-semibold text-brand-text">To be determined through the NFL playoffs</dd></div>
          </dl>
          <p className="mt-4 text-xs text-brand-muted">Superbowl.gg provides information and community predictions; it does not accept wagers.</p>
        </Card>
      </section>

      {/* ── Today's / upcoming games ── */}
      <section>
        <SectionTitle sub="Real games, real odds, real settlement">{liveGames.length ? "LIVE NOW" : todayGames.length ? "TODAY'S GAMES" : "NEXT UP"}</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {showGames.slice(0, 8).map((g) => (
            <Link key={g.id} href={`/games/${g.id}`} className="card card-hover group">
              <div className="mb-2 flex items-center justify-between">
                <Badge tone={g.status === "LIVE" ? "red" : "slate"}>{gameStatusLabel(g.status)}</Badge>
                <span className="text-xs text-brand-muted">W{g.week}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <TeamBadge abbr={g.awayTeam.abbreviation} color={g.awayTeam.primaryColor} size="sm" />
                  <span className="scoreboard-num text-lg text-brand-text">{g.status === "LIVE" || g.status === "FINAL" ? g.awayScore : "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <TeamBadge abbr={g.homeTeam.abbreviation} color={g.homeTeam.primaryColor} size="sm" />
                  <span className="scoreboard-num text-lg text-brand-text">{g.status === "LIVE" || g.status === "FINAL" ? g.homeScore : "—"}</span>
                </div>
              </div>
              <div className="mt-3 border-t border-brand-border pt-2 text-xs text-brand-muted">
                {g.status === "LIVE" ? `${g.quarter}Q · ${g.clock}` : kickoffDisplay(g.scheduledAt)}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trending predictions ── */}
      <section>
        <SectionTitle sub="Deterministic ranking by engagement + recency">
          <Link href="/predictions" className="text-brand-primary hover:underline">Trending Predictions</Link>
        </SectionTitle>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {trending.map((p) => (
            <Link key={p.id} href={`/predictions/${p.id}`} className="card card-hover">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-brand-text">@{p.user.profile?.username ?? "predictor"}</span>
                <Badge tone={p.status === "SETTLED" ? (p.result === "WIN" ? "green" : p.result === "LOSS" ? "red" : "slate") : "blue"}>
                  {p.status === "SETTLED" ? p.result : p.status}
                </Badge>
              </div>
              <p className="text-sm text-brand-muted">
                {p.game.awayTeam.abbreviation} @ {p.game.homeTeam.abbreviation} · W{p.game.week}
              </p>
              <p className="mt-2 text-sm font-semibold text-brand-text">
                {p.marketType === "MONEYLINE" ? "Moneyline" : p.marketType === "SPREAD" ? "Spread" : p.marketType === "TOTAL" ? "Total" : "Prop"}:{" "}
                {p.selection === "home" ? p.game.homeTeam.abbreviation : p.selection === "away" ? p.game.awayTeam.abbreviation : p.selection}
                {p.line != null ? ` (${p.line})` : ""}
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-brand-muted">
                <span>Odds {p.oddsAtCreation}</span>
                <span>Confidence {p.confidence}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Community consensus + top predictors ── */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <SectionTitle sub="What the community thinks">Community Consensus</SectionTitle>
          <div className="space-y-3">
            {showGames.slice(0, 5).map((g) => {
              const homePicks = consensusRows.find((row) => row.gameId === g.id && row.selection === "home")?._count._all ?? 0;
              const awayPicks = consensusRows.find((row) => row.gameId === g.id && row.selection === "away")?._count._all ?? 0;
              const totalPicks = homePicks + awayPicks;
              const homePct = totalPicks ? Math.round((homePicks / totalPicks) * 100) : null;
              return (
                <Card key={g.id}>
                  <div className="flex items-center justify-between text-sm">
                    <TeamBadge abbr={g.awayTeam.abbreviation} color={g.awayTeam.primaryColor} size="sm" />
                    <span className="text-xs text-brand-muted">vs</span>
                    <TeamBadge abbr={g.homeTeam.abbreviation} color={g.homeTeam.primaryColor} size="sm" />
                  </div>
                  {homePct == null ? <p className="mt-2 text-xs text-brand-muted">No public moneyline picks yet.</p> : (
                    <>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-surface2">
                        <div className="h-full rounded-full bg-brand-primary" style={{ width: `${homePct}%` }} />
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-brand-muted">
                        <span>{100 - homePct}% away</span>
                        <span>{homePct}% home · {totalPicks} picks</span>
                      </div>
                    </>
                  )}
                </Card>
              );
            })}
          </div>
          {showGames.length === 0 ? <EmptyState title="No games are available yet" body="The schedule appears after the next provider sync." /> : null}
        </div>
        <div>
          <SectionTitle sub="Best records this season">
            <Link href="/leaderboard" className="text-brand-primary hover:underline">Top Predictors</Link>
          </SectionTitle>
          <div className="space-y-2">
            {leaderboard.map((row, i) => (
              <Link key={row.user.id} href={`/users/${row.user.profile?.username ?? row.user.email}`} className="card card-hover flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`font-display text-lg font-bold ${i === 0 ? "text-brand-gold" : i < 3 ? "text-brand-primary" : "text-brand-muted"}`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-brand-text">{row.user.profile?.displayName ?? row.user.name}</p>
                    <p className="text-xs text-brand-muted">@{row.user.profile?.username ?? "predictor"}</p>
                  </div>
                </div>
                <div className="text-right text-xs text-brand-muted">
                  <p className="scoreboard-num text-sm font-bold text-brand-text">{Math.round(row.accuracy * 100)}%</p>
                  <p>{row.settled} picks</p>
                </div>
              </Link>
            ))}
            {leaderboard.length === 0 ? <EmptyState title="No settled predictions yet" body="Predictions settle automatically when games finish." /> : null}
          </div>
        </div>
      </section>

      {/* ── Standings snapshot ── */}
      <section>
        <SectionTitle sub="NFL season context">
          <Link href="/nfl/standings" className="text-brand-primary hover:underline">{season ? nflSeasonLabel(season.year) : "NFL"} Standings</Link>
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topDivisions.map((s) => (
            <Card key={s.id}>
              <TeamBadge abbr={s.team.abbreviation} color={s.team.primaryColor} size="sm" link={`/nfl/teams/${s.team.slug}`} />
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-brand-muted">{s.wins}-{s.losses}{s.ties ? `-${s.ties}` : ""}</span>
                <span className="badge bg-brand-success/15 text-brand-success">{s.streak}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Partner offers (affiliate, visibly marked) ── */}
      {(offers.length || affiliateOffers.length) ? (
        <section>
          <SectionTitle sub="Partner offers · 21+ · affiliate links">Marketplace & Offers</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {offers.slice(0, 3).map((o) => (
              <Link key={o.id} href={`/marketplace/${o.slug}`} className="card card-hover">
                <div className="mb-2 flex items-center justify-between">
                  <Badge tone="gold">{o.category?.name}</Badge>
                  <span className="scoreboard-num text-lg text-brand-gold">{o.coinPrice.toLocaleString()} ◎</span>
                </div>
                <p className="text-sm font-semibold text-brand-text">{o.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-brand-muted">{o.description}</p>
              </Link>
            ))}
            {affiliateOffers.slice(0, 3).map((o) => (
              <Link key={o.id} href={`/go/${o.slug}`} className="card card-hover">
                <Badge tone="blue">Sponsored</Badge>
                <p className="mt-2 text-sm font-semibold text-brand-text">{o.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-brand-muted">{o.description} · Partner offer</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
