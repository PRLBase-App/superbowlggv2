import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrediction } from "@/lib/data";
import { Badge, Card, TeamBadge } from "@/components/ui";
import { kickoffDisplay } from "@sbgg/core";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = await getPrediction(id);
  if (!p) return { title: "Prediction not found" };
  return {
    title: `@${p.user.profile?.username ?? "predictor"} predicts ${p.selection}${p.oddsAtCreation == null ? " — community line" : ` (${p.oddsAtCreation})`}`,
    description: `${p.user.profile?.username ?? "Predictor"}'s ${p.marketType} prediction on ${p.game.awayTeam.name} @ ${p.game.homeTeam.name}.`,
    alternates: { canonical: `/predictions/${p.id}` },
  };
}

export const revalidate = 30;

export default async function PredictionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await getPrediction(id);
  if (!p) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <div className="flex items-center justify-between">
          <Link href={`/users/${p.user.profile?.username ?? "me"}`} className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-secondary/30 text-sm font-bold text-brand-secondary">
              {(p.user.profile?.displayName ?? p.user.name ?? "?")[0]?.toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-brand-text">{p.user.profile?.displayName ?? p.user.name}</p>
              <p className="text-xs text-brand-muted">@{p.user.profile?.username ?? "predictor"}</p>
            </div>
          </Link>
          <Badge tone={p.status === "SETTLED" ? (p.result === "WIN" ? "green" : p.result === "LOSS" ? "red" : "slate") : p.status === "LOCKED" ? "gold" : "blue"}>
            {p.status === "SETTLED" ? `Settled: ${p.result}` : p.status}
          </Badge>
        </div>

        <div className="mt-6 rounded-xl border border-brand-border bg-brand-surface2 p-5">
          <Link href={`/games/${p.gameId}`} className="flex items-center justify-between">
            <TeamBadge abbr={p.game.awayTeam.abbreviation} color={p.game.awayTeam.primaryColor} logoUrl={p.game.awayTeam.logoUrl} size="md" name={p.game.awayTeam.name} />
            <span className="scoreboard-num text-xl text-brand-muted">@</span>
            <TeamBadge abbr={p.game.homeTeam.abbreviation} color={p.game.homeTeam.primaryColor} logoUrl={p.game.homeTeam.logoUrl} size="md" name={p.game.homeTeam.name} />
          </Link>
          <p className="mt-3 text-center text-xs text-brand-muted">{kickoffDisplay(p.game.scheduledAt)} · NFL Week {p.game.week}</p>
        </div>

        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="card !p-3"><dt className="text-xs text-brand-muted">Market</dt><dd className="mt-0.5 text-sm font-semibold text-brand-text">{p.marketType === "MONEYLINE" ? "Moneyline" : p.marketType === "SPREAD" ? "Spread" : p.marketType === "TOTAL" ? "Total" : "Player prop"}</dd></div>
          <div className="card !p-3"><dt className="text-xs text-brand-muted">Selection</dt><dd className="mt-0.5 text-sm font-semibold text-brand-text">{p.selection === "home" ? p.game.homeTeam.name : p.selection === "away" ? p.game.awayTeam.name : p.selection}{p.player ? ` — ${p.player.name}` : ""}{p.line != null ? ` ${p.line > 0 ? "+" : ""}${p.line}` : ""}</dd></div>
          <div className="card !p-3"><dt className="text-xs text-brand-muted">Pricing source</dt><dd className="mt-0.5 text-sm font-semibold text-brand-primary">{p.oddsAtCreation == null ? "No sportsbook odds / Community line" : `Odds at creation ${p.oddsAtCreation}`}</dd></div>
          <div className="card !p-3"><dt className="text-xs text-brand-muted">Confidence</dt><dd className="mt-0.5 text-sm font-semibold text-brand-text">{p.confidence}</dd></div>
          <div className="card !p-3"><dt className="text-xs text-brand-muted">Units</dt><dd className="mt-0.5 text-sm font-semibold text-brand-text">{p.virtualUnits}</dd></div>
          <div className="card !p-3"><dt className="text-xs text-brand-muted">Published</dt><dd className="mt-0.5 text-sm font-semibold text-brand-text">{p.publishedAt.toLocaleString()}</dd></div>
        </dl>

        {p.analysis ? (
          <div className="mt-4">
            <p className="label">Analysis</p>
            <p className="text-sm leading-relaxed text-brand-muted">{p.analysis}</p>
          </div>
        ) : null}

        {p.settlement ? (
          <div className="mt-4 rounded-lg border border-brand-border bg-brand-surface2 p-4 text-sm">
            <p className="font-semibold text-brand-text">Settlement: <span className={p.settlement.result === "WIN" ? "text-brand-success" : p.settlement.result === "LOSS" ? "text-brand-danger" : "text-brand-muted"}>{p.settlement.result}</span></p>
            <p className="mt-1 text-xs text-brand-muted">{p.settlement.settlementReason} · {p.settlement.settlementSource} v{p.settlement.settlementVersion} · {p.settlement.settledAt.toLocaleString()}</p>
          </div>
        ) : p.status === "PENDING" ? (
          <p className="mt-4 text-xs text-brand-muted">This prediction locks at kickoff and settles automatically when the game ends.</p>
        ) : null}
      </Card>

      <div className="flex gap-2 text-sm">
        <Link href={`/games/${p.gameId}`} className="text-brand-primary hover:underline">← Back to game center</Link>
        <Link href={`/users/${p.user.profile?.username ?? "me"}`} className="text-brand-primary hover:underline">View predictor profile →</Link>
      </div>
    </div>
  );
}
