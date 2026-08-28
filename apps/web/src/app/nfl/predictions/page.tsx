import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { EmptyState } from "@/components/ui";
import { getPredictionFeed } from "@/lib/data";
import { timeAgo } from "@sbgg/core";
import { gameWeekLabel } from "@/lib/season";

export const metadata: Metadata = {
  title: "NFL Predictions & Picks — Community Picks for Every Game",
  description: "Community NFL predictions and picks. Follow top predictors, see consensus and build your own record.",
};

export const revalidate = 30;

export default async function NflPredictionsPage() {
  const preds = await getPredictionFeed({ filter: "trending", limit: 24 });

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: "Predictions" }]} />
      <SeoHubShell title="NFL Predictions & Picks" description="The best community NFL picks, ranked by a deterministic trending score. Every pick settles automatically when the game ends.">
        {preds.length === 0 ? (
          <EmptyState title="No predictions yet" body="Publish the first pick of the season." action={{ href: "/predict", label: "Open the pick board" }} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {preds.map((p) => (
              <article key={p.id} className="card card-hover">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-text">@{p.user.profile?.username ?? "predictor"}</span>
                  <span className="scoreboard-num text-brand-primary">{p.oddsAtCreation}</span>
                </div>
                <Link href={`/games/${p.gameId}`} className="mt-1 block text-sm text-brand-muted hover:text-brand-primary">
                  {p.game.awayTeam.abbreviation} @ {p.game.homeTeam.abbreviation} · {gameWeekLabel(p.game.seasonType, p.game.week)}
                </Link>
                <Link href={`/predictions/${p.id}`} className="mt-2 block text-sm font-semibold text-brand-text hover:text-brand-primary">
                  {p.marketType === "MONEYLINE" ? "ML" : p.marketType === "SPREAD" ? "Spread" : p.marketType === "TOTAL" ? "Total" : "Prop"}: {p.selection === "home" ? p.game.homeTeam.abbreviation : p.selection === "away" ? p.game.awayTeam.abbreviation : p.selection}{p.line != null ? ` (${p.line})` : ""}
                </Link>
                <p className="mt-1 text-xs text-brand-muted">{p.confidence} · {timeAgo(p.publishedAt)}</p>
              </article>
            ))}
          </div>
        )}
      </SeoHubShell>
    </>
  );
}
