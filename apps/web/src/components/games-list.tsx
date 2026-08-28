import Link from "next/link";
import { Badge, TeamBadge, EmptyState } from "@/components/ui";
import { kickoffDisplay, gameStatusLabel } from "@sbgg/core";
import { gameWeekLabel } from "@/lib/season";
import type { PredictionOptionsResult } from "@/lib/prediction-options";

type GameRow = {
  id: string;
  week: number;
  seasonType: string;
  scheduledAt: Date;
  status: string;
  venue: string | null;
  awayScore: number;
  homeScore: number;
  awayTeam: { abbreviation: string; name: string; primaryColor: string | null; logoUrl: string | null; slug: string };
  homeTeam: { abbreviation: string; name: string; primaryColor: string | null; logoUrl: string | null; slug: string };
};

function statusTone(status: string): "red" | "slate" | "blue" {
  return status === "LIVE" ? "red" : status === "FINAL" ? "slate" : "blue";
}

function weekBadgeTone(seasonType: string): "indigo" | "slate" {
  return seasonType === "PRE" ? "indigo" : "slate";
}

function scoreOrDash(game: GameRow): string {
  return game.status === "FINAL" || game.status === "LIVE" ? `${game.awayScore} – ${game.homeScore}` : "—";
}

/**
 * Responsive game list: stacked cards on mobile (no horizontal scroll),
 * a dense table from the sm breakpoint up.
 */
function americanOdds(price: number): string {
  return price >= 2 ? `+${Math.round((price - 1) * 100)}` : `${Math.round(-100 / (price - 1))}`;
}

function QuickPickOdds({ gameId, options }: { gameId: string; options?: PredictionOptionsResult }) {
  const outcomes = options?.markets[0]?.outcomes.slice(0, 2) ?? [];
  if (!outcomes.length) return <span className="text-xs text-brand-muted">{options?.availability === "STALE" ? "Odds refreshing" : "Not available"}</span>;
  return (
    <div className="flex gap-1.5">
      {outcomes.map((outcome) => (
        <Link key={outcome.id} href={`/predict?game=${encodeURIComponent(gameId)}&outcome=${encodeURIComponent(outcome.id)}`} className="min-h-11 min-w-20 rounded-lg border border-brand-border bg-brand-surface2 px-2 py-1.5 text-left transition hover:border-brand-primary">
          <span className="block truncate text-[10px] font-semibold text-brand-muted">{outcome.name}</span>
          <span className="scoreboard-num text-xs text-brand-primary">{americanOdds(outcome.price)}</span>
        </Link>
      ))}
    </div>
  );
}

export function GamesList({ games, showVenue = false, pickOptions = {} }: { games: GameRow[]; showVenue?: boolean; pickOptions?: Record<string, PredictionOptionsResult> }) {
  if (games.length === 0) return <EmptyState title="No games here yet" body="Games sync automatically from the sports provider." />;

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="space-y-3 sm:hidden">
        {games.map((game) => (
          <article key={game.id} className="card card-hover block">
            <div className="flex items-center justify-between gap-2">
              <Badge tone={weekBadgeTone(game.seasonType)}>{gameWeekLabel(game.seasonType, game.week)}</Badge>
              <Badge tone={statusTone(game.status)}>{gameStatusLabel(game.status)}</Badge>
            </div>
            <Link href={`/games/${game.id}`} className="mt-3 flex items-center gap-3">
              <TeamBadge abbr={game.awayTeam.abbreviation} color={game.awayTeam.primaryColor} logoUrl={game.awayTeam.logoUrl} />
              <div className="min-w-0 flex-1 text-center">
                <p className="truncate text-sm font-semibold text-brand-text">{game.awayTeam.name} @ {game.homeTeam.name}</p>
                <p className="scoreboard-num text-lg text-brand-text">{scoreOrDash(game)}</p>
              </div>
              <TeamBadge abbr={game.homeTeam.abbreviation} color={game.homeTeam.primaryColor} logoUrl={game.homeTeam.logoUrl} />
            </Link>
            <div className="mt-2 flex items-center justify-between gap-2 text-xs text-brand-muted">
              <span>{kickoffDisplay(game.scheduledAt)}</span>
              {showVenue && game.venue ? <span className="truncate">{game.venue}</span> : null}
            </div>
            {game.status === "SCHEDULED" ? <div className="mt-3 border-t border-brand-border pt-3"><p className="label">Quick pick</p><QuickPickOdds gameId={game.id} options={pickOptions[game.id]} /></div> : null}
          </article>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-brand-border sm:block">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-brand-surface">
            <tr>
              <th className="table-head px-4 py-3">Matchup</th>
              <th className="table-head hidden px-4 py-3 md:table-cell">Kickoff</th>
              {showVenue ? <th className="table-head hidden px-4 py-3 lg:table-cell">Venue</th> : null}
              <th className="table-head px-4 py-3">Score</th>
              <th className="table-head px-4 py-3">Status</th>
              <th className="table-head px-4 py-3">Quick pick</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {games.map((game) => (
              <tr key={game.id} className="transition-colors hover:bg-brand-surface">
                <td className="px-4 py-3">
                  <Link href={`/games/${game.id}`} className="flex items-center gap-3">
                    <TeamBadge abbr={game.awayTeam.abbreviation} color={game.awayTeam.primaryColor} logoUrl={game.awayTeam.logoUrl} />
                    <span className="text-brand-muted">@</span>
                    <TeamBadge abbr={game.homeTeam.abbreviation} color={game.homeTeam.primaryColor} logoUrl={game.homeTeam.logoUrl} />
                    <Badge tone={weekBadgeTone(game.seasonType)} className="ml-2">{gameWeekLabel(game.seasonType, game.week)}</Badge>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-brand-muted md:table-cell">{kickoffDisplay(game.scheduledAt)}</td>
                {showVenue ? <td className="hidden px-4 py-3 text-brand-muted lg:table-cell">{game.venue}</td> : null}
                <td className="scoreboard-num px-4 py-3 text-brand-text">{scoreOrDash(game)}</td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone(game.status)}>{gameStatusLabel(game.status)}</Badge>
                </td>
                <td className="px-4 py-3">{game.status === "SCHEDULED" ? <QuickPickOdds gameId={game.id} options={pickOptions[game.id]} /> : <span className="text-xs text-brand-muted">Closed</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
