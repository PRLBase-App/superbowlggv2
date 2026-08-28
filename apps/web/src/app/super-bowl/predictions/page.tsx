import type { Metadata } from "next";
import Link from "next/link";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card, EmptyState } from "@/components/ui";
import { getPredictionFeed } from "@/lib/data";
import { SUPER_BOWLS } from "@/lib/super-bowl-data";
import { prisma } from "@sbgg/db";

export const metadata: Metadata = {
  title: "Super Bowl Predictions & Picks",
  description: "Community Super Bowl predictions and picks. When the matchup is set, the community weighs in.",
};

export const revalidate = 30;

export default async function SuperBowlPredictionsPage() {
  const latest = SUPER_BOWLS[SUPER_BOWLS.length - 1]!;
  const superBowlGame = await prisma.game.findFirst({
    where: {
      stage: { contains: "super bowl", mode: "insensitive" },
      scheduledAt: { gte: new Date(`${latest.year}-01-01T00:00:00Z`), lt: new Date(`${latest.year + 1}-01-01T00:00:00Z`) },
    },
    include: { homeTeam: true, awayTeam: true },
  });
  const preds = superBowlGame ? await getPredictionFeed({ filter: "trending", gameId: superBowlGame.id, limit: 12 }) : [];

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Super Bowl", href: "/super-bowl" }, { label: "Predictions" }]} />
      <SeoHubShell title="Super Bowl Predictions" description={`Super Bowl ${latest.number} (${latest.year}) predictions from the Superbowl.gg community.`}>
        <Card className="yardlines">
          <h2 className="font-display text-xl font-semibold text-brand-text">Super Bowl {latest.number} — {latest.year}</h2>
          <p className="mt-2 text-sm text-brand-muted">
            {superBowlGame
              ? `${superBowlGame.awayTeam.name} vs ${superBowlGame.homeTeam.name} at ${latest.venue}.`
              : "The matchup is decided in the playoffs. Until then, build your record on regular-season games."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={superBowlGame ? `/games/${superBowlGame.id}` : "/games"} className="btn-primary">{superBowlGame ? "Open Super Bowl game" : "Predict NFL games"}</Link>
            <Link href="/leaderboard" className="btn-secondary">Top predictors</Link>
          </div>
        </Card>
        {preds.length ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {preds.map((p) => (
              <Link key={p.id} href={`/predictions/${p.id}`} className="card card-hover">
                <p className="text-sm font-medium text-brand-text">@{p.user.profile?.username ?? "predictor"}</p>
                <p className="mt-1 text-sm text-brand-muted">{p.game.awayTeam.abbreviation} @ {p.game.homeTeam.abbreviation}</p>
                <p className="mt-2 text-sm font-semibold text-brand-text">{p.selection === "home" ? p.game.homeTeam.abbreviation : p.selection === "away" ? p.game.awayTeam.abbreviation : p.selection} · {p.oddsAtCreation}</p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No predictions yet" body="The community publishes picks here once the slate is live." action={{ href: "/predict", label: "Open the pick board" }} />
        )}
      </SeoHubShell>
    </>
  );
}
