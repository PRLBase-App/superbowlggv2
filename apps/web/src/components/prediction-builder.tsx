"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, RefreshCw, Star } from "lucide-react";
import type { PredictionMarketGroupKey, PredictionOptionMarket, PredictionOptionsResult } from "@/lib/prediction-options";
import { pickReturnTo } from "@/lib/return-url";

interface GameOption {
  id: string;
  homeAbbr: string;
  awayAbbr: string;
}

type ComposerMarket = PredictionMarketGroupKey | "COMMUNITY";

function americanOdds(price: number): string {
  return price >= 2 ? `+${Math.round((price - 1) * 100)}` : `${Math.round(-100 / (price - 1))}`;
}

function errorMessage(code: string | undefined, fallback: string): string {
  if (code === "AUTH_REQUIRED") return "Your pick is saved here. Sign in to publish it.";
  if (code === "GAME_STARTED") return "Kickoff has passed, so this game is closed for new picks.";
  if (code === "ODDS_STALE") return "Those odds have expired. Refresh to load the current options.";
  if (code === "OUTCOME_NOT_FOUND" || code === "MARKET_UNAVAILABLE") return "That outcome is no longer offered. Choose another current option.";
  if (code === "PLAYER_UNVERIFIED") return "That player is no longer verified for this matchup. Choose another player.";
  return fallback;
}

function marketFamily(market: PredictionOptionMarket): string {
  return `${market.key}:${market.name}`;
}

function BookmakerCarousel({ markets, selectedId, onSelect }: {
  markets: PredictionOptionMarket[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ left: false, right: markets.length > 1 });

  function measure() {
    const node = rail.current;
    if (!node) return;
    setBounds({ left: node.scrollLeft > 1, right: node.scrollLeft + node.clientWidth < node.scrollWidth - 1 });
  }

  useEffect(() => {
    measure();
    const node = rail.current;
    if (!node) return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [markets]);

  function move(direction: -1 | 1) {
    rail.current?.scrollBy({ left: direction * Math.max(180, (rail.current?.clientWidth ?? 300) * 0.75), behavior: "smooth" });
  }

  return (
    <div className="grid min-w-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-1">
      <button type="button" className="btn-ghost h-11 !p-0" disabled={!bounds.left} onClick={() => move(-1)} aria-label="Previous bookmakers"><ChevronLeft className="h-5 w-5" /></button>
      <div
        ref={rail}
        className="scrollbar-subtle flex min-w-0 snap-x gap-2 overflow-x-auto overscroll-x-contain pb-1"
        onScroll={measure}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
          if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
        }}
        role="list"
        aria-label="Bookmakers"
        tabIndex={0}
      >
        {markets.map((market) => (
          <button
            key={market.id}
            type="button"
            role="listitem"
            onClick={() => onSelect(market.id)}
            className={`tab min-h-11 shrink-0 snap-start whitespace-nowrap border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${market.id === selectedId ? "tab-active border-brand-primary/30" : "border-brand-border bg-brand-surface"}`}
          >
            {market.bookmaker}
          </button>
        ))}
      </div>
      <button type="button" className="btn-ghost h-11 !p-0" disabled={!bounds.right} onClick={() => move(1)} aria-label="Next bookmakers"><ChevronRight className="h-5 w-5" /></button>
    </div>
  );
}

export function PredictionComposer({ game, options, authenticated, initialOutcomeId, initialMarketGroup, onClose }: {
  game: GameOption;
  options: PredictionOptionsResult;
  authenticated: boolean;
  initialOutcomeId?: string;
  initialMarketGroup?: ComposerMarket;
  onClose?: () => void;
}) {
  const router = useRouter();
  const restoredMarket = options.markets.find((candidate) => candidate.outcomes.some((outcome) => outcome.id === initialOutcomeId));
  const requestedGroup = initialMarketGroup === "COMMUNITY"
    ? (options.community.available ? initialMarketGroup : undefined)
    : options.groups.some(({ key }) => key === initialMarketGroup) ? initialMarketGroup : undefined;
  const firstGroup = restoredMarket?.group ?? requestedGroup ?? options.groups[0]?.key ?? (options.community.available ? "COMMUNITY" : "MONEYLINE");
  const [availableOptions, setAvailableOptions] = useState(options);
  const [marketGroup, setMarketGroup] = useState<ComposerMarket>(firstGroup);
  const [family, setFamily] = useState(restoredMarket ? marketFamily(restoredMarket) : "");
  const [bookmakerMarketId, setBookmakerMarketId] = useState(restoredMarket?.id ?? "");
  const [outcomeId, setOutcomeId] = useState(initialOutcomeId && restoredMarket ? initialOutcomeId : "");
  const [playerId, setPlayerId] = useState("");
  const [statKey, setStatKey] = useState(availableOptions.community.stats[0]?.key ?? "");
  const [selection, setSelection] = useState<"over" | "under">("over");
  const [line, setLine] = useState(0.5);
  const [confidence, setConfidence] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [analysis, setAnalysis] = useState("");
  const [units, setUnits] = useState(1);
  const [error, setError] = useState<string | null>(initialOutcomeId && !restoredMarket ? "Your saved outcome is no longer offered. Choose a current option." : null);
  const [errorCode, setErrorCode] = useState<string | null>(initialOutcomeId && !restoredMarket ? "OUTCOME_NOT_FOUND" : null);
  const [publishing, setPublishing] = useState(false);
  const requestId = useRef<string | null>(null);

  const group = availableOptions.groups.find(({ key }) => key === marketGroup);
  const families = useMemo(() => Array.from(new Map((group?.markets ?? []).map((market) => [marketFamily(market), { id: marketFamily(market), label: market.name }])).values()), [group]);
  const activeFamily = family || families[0]?.id || "";
  const bookmakerMarkets = (group?.markets ?? []).filter((market) => marketFamily(market) === activeFamily);
  const activeMarket = bookmakerMarkets.find(({ id }) => id === bookmakerMarketId) ?? bookmakerMarkets[0];
  const outcome = activeMarket?.outcomes.find((candidate) => candidate.id === outcomeId);
  const activeStat = availableOptions.community.stats.find(({ key }) => key === statKey);
  const communityComplete = marketGroup === "COMMUNITY" && Boolean(playerId && activeStat && line >= 0.5 && line <= activeStat.max && line % 1 === 0.5);
  const returnTo = outcome ? pickReturnTo(game.id, outcome.id) : `/predict?game=${encodeURIComponent(game.id)}`;

  function chooseGroup(next: ComposerMarket) {
    setMarketGroup(next);
    setFamily("");
    setBookmakerMarketId("");
    setOutcomeId("");
    setError(null);
    setErrorCode(null);
    requestId.current = null;
  }

  async function refreshOptions(): Promise<PredictionOptionsResult | null> {
    setError(null);
    setErrorCode(null);
    try {
      const response = await fetch(`/api/games/${encodeURIComponent(game.id)}/prediction-options`, { cache: "no-store" });
      const body = await response.json().catch(() => null) as PredictionOptionsResult | { error?: string; code?: string } | null;
      if (!response.ok || !body || !("markets" in body)) {
        setError(body && "error" in body ? body.error ?? "Current options could not be loaded." : "Current options could not be loaded.");
        return null;
      }
      setAvailableOptions(body);
      const selectedStillExists = body.markets.some((market) => market.outcomes.some((item) => item.id === outcomeId));
      if (outcomeId && !selectedStillExists) {
        setOutcomeId("");
        setError(body.availability === "AVAILABLE" ? "Your previous outcome moved or closed. Choose a current option." : body.reason);
        setErrorCode(body.availability === "STALE" ? "ODDS_STALE" : "OUTCOME_NOT_FOUND");
      }
      if (playerId && !body.community.players.some((player) => player.id === playerId)) setPlayerId("");
      return body;
    } catch {
      setError("The network did not respond. Your selections are still here—try again.");
      setErrorCode("NETWORK_ERROR");
      return null;
    }
  }

  async function publish(event: React.FormEvent) {
    event.preventDefault();
    if (marketGroup !== "COMMUNITY" && !outcome) { setError("Choose an outcome before publishing."); return; }
    if (marketGroup === "COMMUNITY" && !communityComplete) { setError("Choose one player, statistic, side and valid half-step line."); return; }
    if (!authenticated) { router.push(`/auth/sign-up?next=${encodeURIComponent(returnTo)}`); return; }

    setPublishing(true);
    setError(null);
    setErrorCode(null);
    try {
      const current = await refreshOptions();
      if (!current) { setPublishing(false); return; }
      if (marketGroup !== "COMMUNITY" && outcome && !current.markets.some((market) => market.outcomes.some((item) => item.id === outcome.id))) { setPublishing(false); return; }
      if (marketGroup === "COMMUNITY" && !current.community.players.some((player) => player.id === playerId)) { setError("That player is no longer available for this game."); setPublishing(false); return; }
      requestId.current ??= crypto.randomUUID();
      const payload = marketGroup === "COMMUNITY"
        ? { source: "COMMUNITY", clientRequestId: requestId.current, gameId: game.id, playerId, statKey, selection, line, confidence, analysis: analysis || null, virtualUnits: units }
        : { source: "PROVIDER", clientRequestId: requestId.current, gameId: game.id, marketOutcomeId: outcome?.id, confidence, analysis: analysis || null, virtualUnits: units };
      const response = await fetch("/api/predictions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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

  if (!availableOptions.groups.length && !availableOptions.community.available) {
    return <div className="card text-center"><AlertCircle className="mx-auto h-6 w-6 text-brand-warning" /><p className="mt-3 font-semibold text-brand-text">No pickable markets right now</p><p className="mt-1 text-sm text-brand-muted">Odds may be refreshing or this game may have closed.</p><button type="button" className="btn-secondary mt-4 min-h-11" onClick={() => void refreshOptions()}><RefreshCw className="h-4 w-4" /> Refresh options</button></div>;
  }

  return (
    <form onSubmit={publish} className="card min-w-0 space-y-5 overflow-hidden" aria-label={`Prediction for ${game.awayAbbr} at ${game.homeAbbr}`}>
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-primary">Virtual prediction</p><h2 className="mt-1 font-display text-xl font-semibold text-brand-text">{game.awayAbbr} @ {game.homeAbbr}</h2></div>{onClose ? <button type="button" onClick={onClose} className="btn-ghost min-h-11 !px-3">Close</button> : null}</div>

      <fieldset><legend className="label">Market</legend><div className="scrollbar-subtle flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1">{availableOptions.groups.map((item) => <button key={item.key} type="button" onClick={() => chooseGroup(item.key)} className={`tab min-h-11 shrink-0 border whitespace-nowrap ${marketGroup === item.key ? "tab-active border-brand-primary/30" : "border-brand-border bg-brand-surface"}`}>{item.label}</button>)}{availableOptions.community.available ? <button type="button" onClick={() => chooseGroup("COMMUNITY")} className={`tab min-h-11 shrink-0 border whitespace-nowrap ${marketGroup === "COMMUNITY" ? "tab-active border-brand-primary/30" : "border-brand-border bg-brand-surface"}`}>Advanced / Community Line</button> : null}</div></fieldset>

      {marketGroup === "COMMUNITY" ? (
        <div className="space-y-4 rounded-xl border border-brand-secondary/30 bg-brand-secondary/5 p-3">
          <div><p className="text-sm font-semibold text-brand-text">Create one player-stat line</p><p className="mt-1 text-xs text-brand-muted">No sportsbook odds. Lines use half steps and lock at kickoff.</p></div>
          <div><label className="label" htmlFor={`player-${game.id}`}>Player</label><select id={`player-${game.id}`} className="input" value={playerId} onChange={(event) => { setPlayerId(event.target.value); requestId.current = null; }} required><option value="">Choose a verified player</option>{availableOptions.community.players.map((player) => <option key={player.id} value={player.id}>{player.teamAbbreviation} · {player.name}{player.position ? ` (${player.position})` : ""}</option>)}</select></div>
          <div><label className="label" htmlFor={`stat-${game.id}`}>Statistic</label><select id={`stat-${game.id}`} className="input" value={statKey} onChange={(event) => { setStatKey(event.target.value); setLine(0.5); requestId.current = null; }}>{availableOptions.community.stats.map((stat) => <option key={stat.key} value={stat.key}>{stat.label}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3"><fieldset><legend className="label">Side</legend><div className="grid grid-cols-2 gap-1">{(["over", "under"] as const).map((value) => <button key={value} type="button" onClick={() => { setSelection(value); requestId.current = null; }} className={`min-h-11 rounded-lg border text-sm font-bold capitalize ${selection === value ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-brand-border text-brand-muted"}`}>{value}</button>)}</div></fieldset><div><label className="label" htmlFor={`line-${game.id}`}>Line</label><input id={`line-${game.id}`} className="input" type="number" min={0.5} max={activeStat?.max ?? 0.5} step={1} value={line} onChange={(event) => { setLine(Number(event.target.value)); requestId.current = null; }} /><p className="mt-1 text-[11px] text-brand-muted">Max {activeStat?.max ?? 0.5}</p></div></div>
        </div>
      ) : (
        <>
          {families.length > 1 ? <fieldset><legend className="label">Line</legend><div className="scrollbar-subtle flex max-w-full gap-2 overflow-x-auto pb-1">{families.map((item) => <button key={item.id} type="button" onClick={() => { setFamily(item.id); setBookmakerMarketId(""); setOutcomeId(""); }} className={`tab min-h-11 shrink-0 border whitespace-nowrap ${activeFamily === item.id ? "tab-active border-brand-primary/30" : "border-brand-border bg-brand-surface"}`}>{item.label}</button>)}</div></fieldset> : null}
          <fieldset><legend className="label">Bookmaker</legend><BookmakerCarousel markets={bookmakerMarkets} selectedId={activeMarket?.id ?? ""} onSelect={(id) => { setBookmakerMarketId(id); setOutcomeId(""); requestId.current = null; }} /></fieldset>
          <fieldset><legend className="label">Outcome · {activeMarket?.name}</legend><div className="grid gap-2 sm:grid-cols-2">{activeMarket?.outcomes.map((item) => <button key={item.id} type="button" onClick={() => { setOutcomeId(item.id); setError(null); setErrorCode(null); requestId.current = null; }} className={`min-h-14 rounded-xl border p-3 text-left transition ${item.id === outcomeId ? "border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/20" : "border-brand-border bg-brand-surface2 hover:border-brand-primary/50"}`}><span className="flex items-center justify-between gap-2"><span className="text-sm font-semibold text-brand-text">{item.name}{item.description ? ` · ${item.description}` : ""}</span><span className="scoreboard-num text-brand-primary">{americanOdds(item.price)}</span></span><span className="mt-1 flex items-center justify-between gap-2 text-xs text-brand-muted"><span>{item.point != null ? `Line ${item.point > 0 ? "+" : ""}${item.point}` : activeMarket.bookmaker}</span>{item.isBestOdds ? <span className="inline-flex items-center gap-1 font-semibold text-brand-success"><Star className="h-3 w-3" /> Best</span> : null}</span></button>)}</div></fieldset>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2"><fieldset><legend className="label">Confidence</legend><div className="grid grid-cols-3 gap-1 rounded-xl bg-brand-surface2 p-1">{(["LOW", "MEDIUM", "HIGH"] as const).map((value) => <button key={value} type="button" onClick={() => setConfidence(value)} className={`min-h-11 rounded-lg px-2 text-xs font-bold ${confidence === value ? "bg-brand-surface text-brand-primary shadow-sm" : "text-brand-muted hover:text-brand-text"}`}>{value === "MEDIUM" ? "Medium" : value === "LOW" ? "Low" : "High"}</button>)}</div></fieldset><fieldset><legend className="label">Virtual units</legend><div className="grid grid-cols-5 gap-1">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setUnits(value)} className={`min-h-11 rounded-lg border text-sm font-bold ${units === value ? "border-brand-primary bg-brand-primary/10 text-brand-primary" : "border-brand-border text-brand-muted"}`}>{value}</button>)}</div></fieldset></div>
      <div><label className="label" htmlFor={`analysis-${game.id}`}>Analysis (optional)</label><textarea id={`analysis-${game.id}`} className="input min-h-20" placeholder="What makes this your pick?" value={analysis} onChange={(event) => setAnalysis(event.target.value)} maxLength={2_000} /></div>
      {(outcome || communityComplete) ? <div className="rounded-xl border border-brand-border bg-brand-surface2 p-3 text-sm" aria-live="polite"><span className="flex items-center gap-2 font-semibold text-brand-text"><CheckCircle2 className="h-4 w-4 text-brand-success" />{marketGroup === "COMMUNITY" ? `${activeStat?.label}: ${selection} ${line}` : `${activeMarket?.name}: ${outcome?.name}`}</span><span className="mt-1 block text-xs text-brand-muted">{units} virtual unit{units === 1 ? "" : "s"} · {marketGroup === "COMMUNITY" ? "Community line · no sportsbook odds" : activeMarket?.bookmaker} · no monetary value</span></div> : null}
      {error ? <div className="rounded-xl border border-brand-danger/30 bg-brand-danger/10 p-3 text-sm text-brand-danger" role="alert"><p>{error}</p>{["ODDS_STALE", "NETWORK_ERROR", "OUTCOME_NOT_FOUND"].includes(errorCode ?? "") ? <button type="button" className="mt-2 inline-flex min-h-11 items-center gap-2 font-bold underline" onClick={() => void refreshOptions()}><RefreshCw className="h-4 w-4" /> Refresh current options</button> : null}</div> : null}
      <button type="submit" disabled={(!outcome && !communityComplete) || publishing} className="btn-primary min-h-12 w-full">{publishing ? "Checking and publishing…" : authenticated ? "Publish prediction" : "Join free to publish"}</button>
      {!authenticated && (outcome || communityComplete) ? <p className="text-center text-xs text-brand-muted">Already have an account? <Link href={`/auth/sign-in?next=${encodeURIComponent(returnTo)}`} className="font-bold text-brand-primary hover:underline">Sign in and return to this pick</Link>.</p> : null}
    </form>
  );
}

export const PredictionBuilder = PredictionComposer;
