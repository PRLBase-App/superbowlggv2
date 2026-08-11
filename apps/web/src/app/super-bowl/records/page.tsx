import type { Metadata } from "next";
import { SeoHubShell, Breadcrumbs } from "@/components/seo-shell";
import { Card } from "@/components/ui";
import { SUPER_BOWLS } from "@/lib/super-bowl-data";

export const metadata: Metadata = {
  title: "Super Bowl Records — Points, Margins & History",
  description: "Super Bowl records: biggest blowouts, highest scores, most championships and MVP records.",
};

export const revalidate = 3600;

export default async function SuperBowlRecordsPage() {
  const finished = SUPER_BOWLS.filter((sb) => sb.winner !== "TBD" && sb.score !== "—");
  const parsed = finished
    .map((sb) => {
      const [w, l] = sb.score.split("–").map(Number);
      return { ...sb, winScore: w ?? 0, lossScore: l ?? 0 };
    })
    .filter((sb) => sb.winScore > 0);
  const biggestMargin = [...parsed].sort((a, b) => (a.winScore - a.lossScore) - (b.winScore - b.lossScore)).at(-1);
  const highestTotal = [...parsed].sort((a, b) => (a.winScore + a.lossScore) - (b.winScore + b.lossScore)).at(-1);
  const lowestTotal = [...parsed].sort((a, b) => (a.winScore + a.lossScore) - (b.winScore + b.lossScore))[0];

  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Super Bowl", href: "/super-bowl" }, { label: "Records" }]} />
      <SeoHubShell title="Super Bowl Records" description="The biggest wins, highest-scoring games and other Super Bowl superlatives.">
        <div className="grid gap-4 sm:grid-cols-3">
          {biggestMargin ? (
            <Card>
              <p className="text-xs uppercase tracking-wide text-brand-muted">Biggest blowout</p>
              <p className="mt-1 font-display text-xl font-semibold text-brand-text">{biggestMargin.winner} {biggestMargin.score}</p>
              <p className="text-xs text-brand-muted">SB {biggestMargin.number} · {biggestMargin.year} · margin {biggestMargin.winScore - biggestMargin.lossScore}</p>
            </Card>
          ) : null}
          {highestTotal ? (
            <Card>
              <p className="text-xs uppercase tracking-wide text-brand-muted">Most total points</p>
              <p className="mt-1 font-display text-xl font-semibold text-brand-text">{highestTotal.winScore + highestTotal.lossScore} pts</p>
              <p className="text-xs text-brand-muted">SB {highestTotal.number} · {highestTotal.year} · {highestTotal.score}</p>
            </Card>
          ) : null}
          {lowestTotal ? (
            <Card>
              <p className="text-xs uppercase tracking-wide text-brand-muted">Fewest total points</p>
              <p className="mt-1 font-display text-xl font-semibold text-brand-text">{lowestTotal.winScore + lowestTotal.lossScore} pts</p>
              <p className="text-xs text-brand-muted">SB {lowestTotal.number} · {lowestTotal.year} · {lowestTotal.score}</p>
            </Card>
          ) : null}
        </div>
        <p className="text-sm text-brand-muted">
          Full game-by-game data on the <a className="text-brand-primary hover:underline" href="/super-bowl/history">history page</a>. Records are computed from the factual game results above.
        </p>
      </SeoHubShell>
    </>
  );
}
