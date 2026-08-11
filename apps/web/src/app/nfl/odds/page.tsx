import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { OddsCell, TeamBadge, EmptyState } from "@/components/ui";
import { getGames } from "@/lib/data";
import { prisma } from "@sbgg/db";

export const metadata: Metadata = {
  title: "NFL Odds — Moneyline, Spreads, Totals & Player Props",
  description: "Compare current NFL moneylines, point spreads, totals and available player props from configured sportsbook data providers.",
  alternates: { canonical: "/nfl/odds" },
};

export const revalidate = 60;

function normalizedName(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

export default async function NflOddsPage() {
  const games = await getGames({ status: "SCHEDULED", limit: 16 });
  const markets = games.length ? await prisma.market.findMany({
    where: { gameId: { in: games.map((game) => game.id) }, active: true, bookmaker: { active: true } },
    include: { outcomes: true, bookmaker: true },
    orderBy: [{ gameId: "asc" }, { bookmaker: { name: "asc" } }, { key: "asc" }],
  }) : [];
  const marketsByGame = new Map<string, typeof markets>();
  for (const market of markets) marketsByGame.set(market.gameId, [...(marketsByGame.get(market.gameId) ?? []), market]);

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Odds" }]} />
      <SeoHubShell title="NFL Odds" description="Compare real provider moneylines, spreads, totals and available player props. Superbowl.gg never accepts wagers.">
        {markets.length === 0 ? (
          <EmptyState title="No provider odds available right now" body="Odds appear only after a configured provider returns a current market for an upcoming NFL game." />
        ) : (
          <div className="space-y-4">
            {games.map((game) => {
              const gameMarkets = marketsByGame.get(game.id) ?? [];
              if (!gameMarkets.length) return null;
              const bookmakerKeys = [...new Set(gameMarkets.map((market) => market.bookmakerId))];
              return (
                <article key={game.id} className="card space-y-4">
                  <Link href={`/games/${game.id}`} className="flex flex-wrap items-center justify-between gap-3">
                    <span className="flex items-center gap-3">
                      <TeamBadge abbr={game.awayTeam.abbreviation} color={game.awayTeam.primaryColor} size="sm" />
                      <span className="text-brand-muted">@</span>
                      <TeamBadge abbr={game.homeTeam.abbreviation} color={game.homeTeam.primaryColor} size="sm" />
                    </span>
                    <span className="text-xs text-brand-primary">Open Game Center →</span>
                  </Link>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-sm">
                      <thead><tr><th className="table-head py-2 text-left">Sportsbook</th><th className="table-head py-2 text-left">Moneyline</th><th className="table-head py-2 text-left">Spread</th><th className="table-head py-2 text-left">Total</th><th className="table-head py-2 text-left">Props</th></tr></thead>
                      <tbody className="divide-y divide-brand-border">
                        {bookmakerKeys.map((bookmakerId) => {
                          const offered = gameMarkets.filter((market) => market.bookmakerId === bookmakerId);
                          const bookmaker = offered[0]?.bookmaker;
                          const moneyline = offered.find((market) => market.key === "h2h");
                          const spread = offered.find((market) => market.key === "spreads");
                          const total = offered.find((market) => market.key === "totals");
                          const awayMoneyline = moneyline?.outcomes.find((outcome) => normalizedName(outcome.name) === normalizedName(game.awayTeam.name));
                          const homeMoneyline = moneyline?.outcomes.find((outcome) => normalizedName(outcome.name) === normalizedName(game.homeTeam.name));
                          const awaySpread = spread?.outcomes.find((outcome) => normalizedName(outcome.name) === normalizedName(game.awayTeam.name));
                          const homeSpread = spread?.outcomes.find((outcome) => normalizedName(outcome.name) === normalizedName(game.homeTeam.name));
                          const over = total?.outcomes.find((outcome) => outcome.name.toLowerCase() === "over");
                          const under = total?.outcomes.find((outcome) => outcome.name.toLowerCase() === "under");
                          const propCount = offered.filter((market) => market.key.startsWith("player_")).reduce((sum, market) => sum + market.outcomes.length, 0);
                          return (
                            <tr key={bookmakerId}>
                              <td className="py-2.5 pr-3 font-medium text-brand-text">{bookmaker?.name ?? "Sportsbook"}</td>
                              <td className="py-2.5 pr-3"><span className="flex gap-1"><OddsCell label={game.awayTeam.abbreviation} price={awayMoneyline?.price} /><OddsCell label={game.homeTeam.abbreviation} price={homeMoneyline?.price} /></span></td>
                              <td className="py-2.5 pr-3"><span className="flex gap-1"><OddsCell label={game.awayTeam.abbreviation} price={awaySpread?.price} point={awaySpread?.point} /><OddsCell label={game.homeTeam.abbreviation} price={homeSpread?.price} point={homeSpread?.point} /></span></td>
                              <td className="py-2.5 pr-3"><span className="flex gap-1"><OddsCell label="O" price={over?.price} point={over?.point} /><OddsCell label="U" price={under?.price} point={under?.point} /></span></td>
                              <td className="py-2.5 text-brand-muted">{propCount ? `${propCount} outcomes` : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="text-xs text-brand-muted">Odds are informational and may change. Every movement is retained as a timestamped snapshot. Review our <Link href="/affiliate-disclosure" className="text-brand-primary hover:underline">affiliate disclosure</Link> and <Link href="/responsible-gaming" className="text-brand-primary hover:underline">responsible gaming guidance</Link>.</p>
      </SeoHubShell>
    </>
  );
}
