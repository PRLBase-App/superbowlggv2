"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Clock3, LockKeyhole, RefreshCw, X } from "lucide-react";
import { kickoffDisplay } from "@sbgg/core";
import { Badge, TeamBadge } from "@/components/ui";
import { PredictionComposer } from "@/components/prediction-builder";
import type { PredictionMarketGroupKey, PredictionOptionsResult } from "@/lib/prediction-options";

interface PickBoardGame {
  id: string;
  week: number;
  seasonType: string;
  scheduledAt: string;
  venue: string | null;
  homeTeam: { name: string; abbreviation: string; logoUrl: string | null; primaryColor: string | null };
  awayTeam: { name: string; abbreviation: string; logoUrl: string | null; primaryColor: string | null };
  options: PredictionOptionsResult;
}

export function PickBoard({ games, authenticated, initialGameId, initialOutcomeId }: {
  games: PickBoardGame[];
  authenticated: boolean;
  initialGameId?: string;
  initialOutcomeId?: string;
}) {
  const initialGame = games.find((game) => game.id === initialGameId);
  const [selection, setSelection] = useState<{ game: PickBoardGame; outcomeId?: string; marketGroup?: PredictionMarketGroupKey | "COMMUNITY" } | null>(initialGame ? { game: initialGame, outcomeId: initialOutcomeId } : null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selection) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelection(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selection]);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => {
          const entries = [
            ...game.options.groups.map((group) => ({
              key: group.key,
              label: group.label,
              detail: `${new Set(group.markets.map(({ bookmakerKey }) => bookmakerKey)).size} bookmaker${new Set(group.markets.map(({ bookmakerKey }) => bookmakerKey)).size === 1 ? "" : "s"}`,
            })),
            ...(game.options.community.available ? [{ key: "COMMUNITY", label: "Community Line", detail: "No sportsbook odds" }] : []),
          ];
          return (
            <article key={game.id} className="card overflow-hidden !p-0">
              <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
                <Badge tone={game.seasonType === "PRE" ? "indigo" : "blue"}>{game.seasonType === "PRE" ? `Preseason ${game.week}` : `Week ${game.week}`}</Badge>
                <span className="flex items-center gap-1 text-xs font-semibold text-brand-muted"><Clock3 className="h-3.5 w-3.5" /> {kickoffDisplay(new Date(game.scheduledAt))}</span>
              </div>
              <Link href={`/games/${game.id}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4 hover:bg-brand-surface2">
                <span className="text-center"><TeamBadge abbr={game.awayTeam.abbreviation} color={game.awayTeam.primaryColor} logoUrl={game.awayTeam.logoUrl} size="lg" /><span className="mt-2 block text-xs font-bold text-brand-text">{game.awayTeam.abbreviation}</span></span>
                <span className="font-display text-sm text-brand-muted">AT</span>
                <span className="text-center"><TeamBadge abbr={game.homeTeam.abbreviation} color={game.homeTeam.primaryColor} logoUrl={game.homeTeam.logoUrl} size="lg" /><span className="mt-2 block text-xs font-bold text-brand-text">{game.homeTeam.abbreviation}</span></span>
              </Link>

              {entries.length ? (
                <div className="space-y-3 border-t border-brand-border bg-brand-surface2/70 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-muted">Choose a market</p>
                  <div className="grid grid-cols-2 gap-2">
                    {entries.map((entry) => (
                      <button key={entry.key} type="button" onClick={() => setSelection({ game, marketGroup: entry.key as PredictionMarketGroupKey | "COMMUNITY" })} className="min-h-14 rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-left transition hover:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">
                        <span className="block text-xs font-semibold text-brand-text">{entry.label}</span>
                        <span className="mt-1 block text-[10px] text-brand-muted">{entry.detail}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t border-brand-border p-4">
                  <div className="rounded-xl border border-dashed border-brand-border bg-brand-surface2 p-4 text-center">
                    {game.options.availability === "STALE" ? <RefreshCw className="mx-auto h-5 w-5 text-brand-warning" /> : <LockKeyhole className="mx-auto h-5 w-5 text-brand-muted" />}
                    <p className="mt-2 text-sm font-semibold text-brand-text">{game.options.availability === "STALE" ? "Odds refreshing" : "Picks not open yet"}</p>
                    <p className="mt-1 text-xs leading-5 text-brand-muted">{game.options.reason}</p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {selection ? (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Make a prediction">
          <button type="button" className="absolute inset-0 bg-brand-nav/60 backdrop-blur-sm" onClick={() => setSelection(null)} aria-label="Close prediction composer" />
          <aside className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[28px] border border-brand-border bg-brand-bg p-3 shadow-2xl lg:inset-y-0 lg:left-auto lg:w-[500px] lg:max-h-none lg:rounded-none lg:p-5">
            <button ref={closeButton} type="button" onClick={() => setSelection(null)} className="ml-auto flex h-11 w-11 items-center justify-center rounded-xl text-brand-muted hover:bg-brand-surface2 hover:text-brand-text" aria-label="Close prediction composer"><X className="h-5 w-5" /></button>
            <PredictionComposer
              key={`${selection.game.id}:${selection.outcomeId ?? "none"}:${selection.marketGroup ?? "default"}`}
              game={{ id: selection.game.id, awayAbbr: selection.game.awayTeam.abbreviation, homeAbbr: selection.game.homeTeam.abbreviation }}
              options={selection.game.options}
              authenticated={authenticated}
              initialOutcomeId={selection.outcomeId}
              initialMarketGroup={selection.marketGroup}
              onClose={() => setSelection(null)}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
