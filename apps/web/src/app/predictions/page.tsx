import type { Metadata } from "next";
import Link from "next/link";
import { getPredictionFeed } from "@/lib/data";
import { Badge, SectionTitle, EmptyState } from "@/components/ui";
import { timeAgo } from "@sbgg/core";
import { gameWeekLabel } from "@/lib/season";
import type { PredictionMarket } from "@sbgg/db";

export const metadata: Metadata = {
  title: "NFL Predictions & Community Picks",
  description: "Browse the latest NFL predictions from the Superbowl.gg community. Filter by market, game and confidence.",
};

export const revalidate = 30;

export default async function PredictionsPage({ searchParams }: { searchParams: Promise<{ filter?: string; market?: string }> }) {
  const sp = await searchParams;
  const filter = sp.filter ?? "newest";
  const markets: PredictionMarket[] = ["MONEYLINE", "SPREAD", "TOTAL", "PLAYER_PROP"];
  const market = markets.find((candidate) => candidate === sp.market);
  const preds = await getPredictionFeed({ filter, market, limit: 60 });

  return (
    <div className="space-y-6">
      <SectionTitle sub="Community picks, settled automatically">Predictions</SectionTitle>

      <div className="flex flex-wrap gap-2">
        <Link href="/predictions" className={`tab ${filter === "newest" ? "tab-active" : ""}`}>Newest</Link>
        <Link href="/predictions?filter=trending" className={`tab ${filter === "trending" ? "tab-active" : ""}`}>Trending</Link>
        <Link href="/predictions?filter=top" className={`tab ${filter === "top" ? "tab-active" : ""}`}>Top</Link>
        <span className="mx-1 w-px bg-brand-border" aria-hidden />
        {["MONEYLINE", "SPREAD", "TOTAL", "PLAYER_PROP"].map((m) => (
          <Link key={m} href={`/predictions${market === m ? "" : `?market=${m}`}`} className={`tab ${market === m ? "tab-active" : ""}`}>{m === "MONEYLINE" ? "Moneyline" : m === "SPREAD" ? "Spread" : m === "TOTAL" ? "Total" : "Props"}</Link>
        ))}
      </div>

      {preds.length === 0 ? (
        <EmptyState title="No predictions yet" body="Publish the first pick and start building your record." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {preds.map((p) => (
            <Link key={p.id} href={`/predictions/${p.id}`} className="card card-hover">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-secondary/30 text-xs font-bold text-brand-secondary">
                    {(p.user.profile?.displayName ?? p.user.name ?? "?")[0]?.toUpperCase()}
                  </span>
                  <span className="font-medium text-brand-text">@{p.user.profile?.username ?? "predictor"}</span>
                </div>
                <Badge tone={p.status === "SETTLED" ? (p.result === "WIN" ? "green" : p.result === "LOSS" ? "red" : "slate") : "blue"}>
                  {p.status === "SETTLED" ? p.result : p.status}
                </Badge>
              </div>
              <span className="text-sm text-brand-muted">
                {p.game.awayTeam.abbreviation} @ {p.game.homeTeam.abbreviation} · {gameWeekLabel(p.game.seasonType, p.game.week)}
              </span>
              <p className="mt-2 text-sm font-semibold text-brand-text">
                {p.marketType === "MONEYLINE" ? "ML" : p.marketType === "SPREAD" ? "SPR" : p.marketType === "TOTAL" ? "TOT" : "PROP"}:
                {" "}{p.selection === "home" ? p.game.homeTeam.abbreviation : p.selection === "away" ? p.game.awayTeam.abbreviation : p.selection}
                {p.line != null ? ` (${p.line > 0 ? "+" : ""}${p.line})` : ""}
                {p.player ? ` · ${p.player.name}` : ""}
              </p>
              {p.analysis ? <p className="mt-1 line-clamp-2 text-xs text-brand-muted">{p.analysis}</p> : null}
              <div className="mt-3 flex items-center justify-between border-t border-brand-border pt-2 text-xs text-brand-muted">
                <span className="scoreboard-num text-brand-primary">{p.oddsAtCreation}</span>
                <span>{p.confidence} · {timeAgo(p.publishedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
