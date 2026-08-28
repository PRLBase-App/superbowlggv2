"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import type { PredictionOptionMarket, PredictionOptionsResult } from "@/lib/prediction-options";
import { pickReturnTo } from "@/lib/return-url";

interface GameOption {
  id: string;
  homeAbbr: string;
  awayAbbr: string;
}

function americanOdds(price: number): string {
  return price >= 2 ? `+${Math.round((price - 1) * 100)}` : `${Math.round(-100 / (price - 1))}`;
}

function errorMessage(code: string | undefined, fallback: string): string {
  if (code === "AUTH_REQUIRED") return "Your pick is saved here. Sign in to publish it.";
  if (code === "GAME_STARTED") return "Kickoff has passed, so this game is closed for new picks.";
  if (code === "ODDS_STALE") return "Those odds have expired. Refresh to load the current options.";
  if (code === "OUTCOME_NOT_FOUND" || code === "MARKET_UNAVAILABLE") return "That outcome is no longer offered. Choose another current option.";
  return fallback;
}

export function PredictionComposer({
  game,
  markets,
  authenticated,
  initialOutcomeId,
  onClose,
}: {
  game: GameOption;
  markets: PredictionOptionMarket[];
  authenticated: boolean;
  initialOutcomeId?: string;
  onClose?: () => void;
}) {
  const router = useRouter();
  const restoredMarket = markets.find((candidate) => candidate.outcomes.some((outcome) => outcome.id === initialOutcomeId));
  const initialMarket = restoredMarket ?? markets[0];
  const [availableMarkets, setAvailableMarkets] = useState(markets);
  const [marketId, setMarketId] = useState(initialMarket?.id ?? "");
  const [outcomeId, setOutcomeId] = useState(initialOutcomeId && initialMarket?.outcomes.some((item) => item.id === initialOutcomeId) ? initialOutcomeId : "");
  const [confidence, setConfidence] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [analysis, setAnalysis] = useState("");
  const [units, setUnits] = useState(1);
  const [error, setError] = useState<string | null>(initialOutcomeId && !restoredMarket ? "Your saved outcome is no longer offered. Choose a current option." : null);
  const [errorCode, setErrorCode] = useState<string | null>(initialOutcomeId && !restoredMarket ? "OUTCOME_NOT_FOUND" : null);
  const [publishing, setPublishing] = useState(false);
  const requestId = useRef<string | null>(null);

  const activeMarket = availableMarkets.find((candidate) => candidate.id === marketId);
  const outcome = activeMarket?.outcomes.find((candidate) => candidate.id === outcomeId);
  const returnTo = outcome ? pickReturnTo(game.id, outcome.id) : `/predict?game=${encodeURIComponent(game.id)}`;
  const marketLabel = useMemo(() => activeMarket?.name ?? "Choose a market", [activeMarket]);

  async function refreshOptions(): Promise<PredictionOptionsResult | null> {
    setError(null);
    setErrorCode(null);
    try {
      const response = await fetch(`/api/games/${encodeURIComponent(game.id)}/prediction-options`, { cache: "no-store" });
      const body = await response.json().catch(() => null) as PredictionOptionsResult | { error?: string; code?: string } | null;
      if (!response.ok || !body || !("markets" in body)) {
        setError(body && "error" in body ? body.error ?? "Current odds could not be loaded." : "Current odds could not be loaded.");
        return null;
      }
      setAvailableMarkets(body.markets);
      if (!body.markets.some((market) => market.id === marketId)) setMarketId(body.markets[0]?.id ?? "");
      const selectedStillExists = body.markets.some((market) => market.outcomes.some((item) => item.id === outcomeId));
      if (outcomeId && !selectedStillExists) {
        setOutcomeId("");
        setMarketId(body.markets[0]?.id ?? "");
        setError(body.availability === "AVAILABLE" ? "Your previous outcome moved or closed. Choose a current option." : body.reason);
        setErrorCode(body.availability === "STALE" ? "ODDS_STALE" : "OUTCOME_NOT_FOUND");
      }
      return body;
    } catch {
      setError("The network did not respond. Your selections are still here—try again.");
      setErrorCode("NETWORK_ERROR");
      return null;
    }
  }

  async function publish(event: React.FormEvent) {
    event.preventDefault();
    if (!outcome) {
      setError("Choose an outcome before publishing.");
      return;
    }
    if (!authenticated) {
      router.push(`/auth/sign-up?next=${encodeURIComponent(returnTo)}`);
      return;
    }

    setPublishing(true);
    setError(null);
    setErrorCode(null);
    try {
      const current = await refreshOptions();
      if (!current?.markets.some((market) => market.outcomes.some((item) => item.id === outcome.id))) {
        setPublishing(false);
        return;
      }
      requestId.current ??= crypto.randomUUID();
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientRequestId: requestId.current,
          gameId: game.id,
          marketOutcomeId: outcome.id,
          confidence,
          analysis: analysis || null,
          virtualUnits: units,
        }),
      });
      const body = await response.json().catch(() => ({})) as { error?: string; code?: string; id?: string };
      if (!response.ok || !body.id) {
        setErrorCode(body.code ?? "PUBLISH_FAILED");
        setError(errorMessage(body.code, body.error ?? "The pick could not be published. Try again."));
        setPublishing(false);
        return;
      }
      router.push(`/predictions/${body.id}`);
      router.refresh();
    } catch {
      setErrorCode("NETWORK_ERROR");
      setError("The network did not respond. Your selections are still here—try again.");
      setPublishing(false);
    }
  }

  if (!availableMarkets.length) {
    return (
      <div className="card text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-brand-warning" />
        <p className="mt-3 font-semibold text-brand-text">No pickable markets right now</p>
        <p className="mt-1 text-sm text-brand-muted">Odds may be refreshing or this game may have closed.</p>
        <button type="button" className="btn-secondary mt-4 min-h-11" onClick={() => void refreshOptions()}><RefreshCw className="h-4 w-4" /> Refresh odds</button>
      </div>
    );
  }

  return (
    <form onSubmit={publish} className="card space-y-5" aria-label={`Prediction for ${game.awayAbbr} at ${game.homeAbbr}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">Quick pick</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-brand-text">{game.awayAbbr} @ {game.homeAbbr}</h2>
        </div>
        {onClose ? <button type="button" onClick={onClose} className="btn-ghost min-h-11 !px-3" aria-label="Close prediction composer">Close</button> : null}
      </div>

      <fieldset>
        <legend className="label">Market</legend>
        <div className="scrollbar-subtle flex gap-2 overflow-x-auto pb-1">
          {availableMarkets.map((market) => (
            <button
              key={market.id}
              type="button"
              onClick={() => { setMarketId(market.id); setOutcomeId(""); setError(null); }}
              className={`tab min-h-11 shrink-0 border ${market.id === marketId ? "tab-active border-brand-primary/30" : "border-brand-border bg-brand-surface"}`}
            >
              {market.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Outcome · {marketLabel}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {activeMarket?.outcomes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => { setOutcomeId(item.id); setError(null); setErrorCode(null); requestId.current = null; }}
              className={`min-h-14 rounded-xl border p-3 text-left transition ${item.id === outcomeId ? "border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/20" : "border-brand-border bg-brand-surface2 hover:border-brand-primary/50"}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-brand-text">{item.name}{item.description ? ` · ${item.description}` : ""}</span>
                <span className="scoreboard-num text-brand-primary">{americanOdds(item.price)}</span>
              </span>
              {item.point != null ? <span className="mt-1 block text-xs text-brand-muted">Line {item.point > 0 ? "+" : ""}{item.point}</span> : null}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset>
          <legend className="label">Confidence</legend>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-brand-surface2 p-1">
            {(["LOW", "MEDIUM", "HIGH"] as const).map((value) => (
              <button key={value} type="button" onClick={() => setConfidence(value)} className={`min-h-11 rounded-lg px-2 text-xs font-bold ${confidence === value ? "bg-brand-surface text-brand-primary shadow-sm" : "text-brand-muted hover:text-brand-text"}`}>{value === "MEDIUM" ? "Medium" : value === "LOW" ? "Low" : "High"}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label">Virtual units</legend>
          <div className="grid grid-cols-5 gap-1">
            {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setUnits(value)} className={`min-h-11 rounded-lg border text-sm font-bold ${units === value ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-brand-border text-brand-muted"}`}>{value}</button>)}
          </div>
        </fieldset>
      </div>

      <div>
        <label className="label" htmlFor={`analysis-${game.id}`}>Analysis (optional)</label>
        <textarea id={`analysis-${game.id}`} className="input min-h-20" placeholder="What makes this your pick?" value={analysis} onChange={(event) => setAnalysis(event.target.value)} maxLength={2_000} />
      </div>

      {outcome ? (
        <div className="rounded-xl border border-brand-border bg-brand-surface2 p-3 text-sm" aria-live="polite">
          <span className="flex items-center gap-2 font-semibold text-brand-text"><CheckCircle2 className="h-4 w-4 text-brand-success" /> {activeMarket?.name}: {outcome.name}</span>
          <span className="mt-1 block text-xs text-brand-muted">{units} virtual unit{units === 1 ? "" : "s"} · no monetary value</span>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-brand-danger/30 bg-brand-danger/10 p-3 text-sm text-brand-danger" role="alert">
          <p>{error}</p>
          {errorCode === "ODDS_STALE" || errorCode === "NETWORK_ERROR" || errorCode === "OUTCOME_NOT_FOUND" ? <button type="button" className="mt-2 inline-flex min-h-11 items-center gap-2 font-bold underline" onClick={() => void refreshOptions()}><RefreshCw className="h-4 w-4" /> Refresh current odds</button> : null}
        </div>
      ) : null}

      <button type="submit" disabled={!outcome || publishing} className="btn-primary min-h-12 w-full">
        {publishing ? "Checking and publishing…" : authenticated ? "Publish prediction" : "Join free to publish"}
      </button>
      {!authenticated && outcome ? <p className="text-center text-xs text-brand-muted">Already have an account? <Link href={`/auth/sign-in?next=${encodeURIComponent(returnTo)}`} className="font-bold text-brand-primary hover:underline">Sign in and return to this pick</Link>.</p> : null}
    </form>
  );
}

export const PredictionBuilder = PredictionComposer;
