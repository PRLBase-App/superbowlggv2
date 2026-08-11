import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card, EmptyState } from "@/components/ui";
import { SUPER_BOWLS } from "@/lib/super-bowl-data";
import { prisma } from "@sbgg/db";

export const metadata: Metadata = {
  title: "Super Bowl LXI Odds, Spread & Lines (2027)",
  description: "Provider-sourced 2027 Super Bowl LXI moneyline, spread and total lines when markets become available. Superbowl.gg never takes bets.",
};

export const revalidate = 60;

export default async function SuperBowlOddsPage() {
  const upcoming = SUPER_BOWLS[SUPER_BOWLS.length - 1]!;
  const previous = SUPER_BOWLS[SUPER_BOWLS.length - 2]!;
  const game = await prisma.game.findFirst({
    where: {
      stage: { contains: "super bowl", mode: "insensitive" },
      scheduledAt: { gte: new Date(`${upcoming.year}-01-01T00:00:00Z`), lt: new Date(`${upcoming.year + 1}-01-01T00:00:00Z`) },
    },
    include: {
      homeTeam: true,
      awayTeam: true,
      markets: { where: { key: { in: ["h2h", "spreads", "totals"] }, active: true }, include: { bookmaker: true, outcomes: true } },
    },
  });

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Super Bowl", href: "/super-bowl" }, { label: "Odds" }]} />
      <SeoHubShell title={`Super Bowl ${upcoming.number} Odds, Spreads & Lines`} description="Provider-sourced Super Bowl moneyline, point spread and total lines appear here without fabricated fallbacks.">
        <Card>
          <p className="text-xs uppercase tracking-wide text-brand-muted">Super Bowl {upcoming.number} · {upcoming.year}</p>
          <p className="mt-1 text-lg font-semibold text-brand-text">{game ? `${game.awayTeam.name} vs ${game.homeTeam.name}` : "Matchup not set"}</p>
          <p className="mt-1 text-sm text-brand-muted">{upcoming.venue}, {upcoming.city}</p>
        </Card>

        {game?.markets.length ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {game.markets.map((market) => (
              <Card key={market.id}>
                <p className="text-xs uppercase tracking-wide text-brand-muted">{market.bookmaker?.name ?? "Sportsbook"}</p>
                <h2 className="mt-1 font-display text-lg font-semibold text-brand-text">{market.name}</h2>
                <div className="mt-3 space-y-1 text-sm">
                  {market.outcomes.map((outcome) => (
                    <div key={outcome.id} className="flex justify-between gap-3">
                      <span className="text-brand-muted">{outcome.description ? `${outcome.description} · ` : ""}{outcome.name}{outcome.point != null ? ` ${outcome.point > 0 ? "+" : ""}${outcome.point}` : ""}</span>
                      <span className="scoreboard-num text-brand-primary">{outcome.price}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : <EmptyState title="No verified Super Bowl odds yet" body="Odds appear only after a real provider publishes a matched event." />}

        <Card>
          <p className="text-xs uppercase tracking-wide text-brand-muted">Previous — SB {previous.number} ({previous.year})</p>
          <p className="mt-1 text-lg font-semibold text-brand-text">{previous.winner} def. {previous.loser} {previous.score}</p>
          <p className="mt-1 text-sm text-brand-muted">MVP: {previous.mvp}</p>
        </Card>
        <p className="text-sm text-brand-muted">
          Current weekly lines: <Link href="/nfl/odds" className="text-brand-primary hover:underline">NFL odds</Link> · <Link href="/responsible-gaming" className="text-brand-primary hover:underline">responsible gaming</Link>.
        </p>
      </SeoHubShell>
    </>
  );
}
