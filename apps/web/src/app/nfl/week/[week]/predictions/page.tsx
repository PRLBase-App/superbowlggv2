import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Badge, EmptyState } from "@/components/ui";
import { getPredictionFeed } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ week: string }> }): Promise<Metadata> {
  const { week } = await params;
  return { title: `NFL Week ${week} Predictions & Picks`, description: `Community NFL Week ${week} predictions and picks on Superbowl.gg.` };
}

export const revalidate = 30;

export default async function WeekPredictionsPage({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  const weekNum = Number(week);
  const games = await (await import("@/lib/data")).getGames({ week: weekNum, limit: 40 });
  const gameIds = games.map((g) => g.id);
  const preds = await getPredictionFeed({ limit: 40 });
  const weekPreds = preds.filter((p) => gameIds.includes(p.gameId));

  if (games.length === 0) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "NFL", href: "/nfl" }, { label: `Week ${weekNum}`, href: `/nfl/week/${weekNum}` }, { label: "Predictions" }]} />
      <SeoHubShell title={`NFL Week ${weekNum} Predictions`} description={`The community's picks for NFL Week ${weekNum}.`}>
        {weekPreds.length === 0 ? (
          <EmptyState title="No picks published for this week yet" body="Predictions appear here as the community publishes them." action={{ href: "/predict", label: "Make a pick" }} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {weekPreds.map((p) => (
              <Link key={p.id} href={`/predictions/${p.id}`} className="card card-hover">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-text">@{p.user.profile?.username ?? "predictor"}</span>
                  <Badge tone={p.status === "SETTLED" ? (p.result === "WIN" ? "green" : p.result === "LOSS" ? "red" : "slate") : "blue"}>{p.status === "SETTLED" ? p.result : p.status}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold text-brand-text">
                  {p.selection === "home" ? p.game.homeTeam.abbreviation : p.selection === "away" ? p.game.awayTeam.abbreviation : p.selection}{p.line != null ? ` (${p.line})` : ""} · {p.oddsAtCreation ?? "Community line"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </SeoHubShell>
    </>
  );
}
