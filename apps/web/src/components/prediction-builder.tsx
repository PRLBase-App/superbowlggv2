"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface GameOption {
  id: string;
  homeAbbr: string;
  awayAbbr: string;
}

interface MarketOutcome {
  id: string;
  name: string;
  description: string | null;
  price: number;
  point: number | null;
}

interface MarketOption {
  id: string;
  key: string;
  name: string;
  bookmaker: string;
  outcomes: MarketOutcome[];
}

export function PredictionBuilder({ game, markets }: { game: GameOption; markets: MarketOption[] }) {
  const router = useRouter();
  const requestId = useRef<string | null>(null);
  const [step, setStep] = useState(0); // 0 market, 1 outcome, 2 confidence, 3 review
  const [market, setMarket] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<MarketOutcome | null>(null);
  const [confidence, setConfidence] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [analysis, setAnalysis] = useState("");
  const [units, setUnits] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const activeMarket = markets.find((m) => m.id === market);

  const steps = ["Market", "Outcome", "Confidence", "Review"];

  function reset() {
    setStep(0);
    setMarket(null);
    setOutcome(null);
    setConfidence("MEDIUM");
    setAnalysis("");
    setUnits(1);
    requestId.current = null;
  }

  async function publish() {
    if (!market || !outcome) return;
    setPublishing(true);
    setError(null);
    requestId.current ??= crypto.randomUUID();

    const res = await fetch("/api/predictions", {
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
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(body.error ?? "Publish failed");
      setPublishing(false);
      return;
    }
    router.push(`/predictions/${body.id}`);
    router.refresh();
  }

  return (
    <div className="card">
      {/* stepper */}
      <ol className="mb-4 flex items-center gap-1 text-xs">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-1">
            <button type="button" onClick={() => i < step && setStep(i)} className={`rounded-full px-2 py-0.5 font-semibold ${i === step ? "bg-brand-primary text-slate-950" : i < step ? "bg-brand-success/20 text-brand-success" : "bg-brand-surface2 text-brand-muted"}`}>
              {i < step ? "✓" : i + 1} {s}
            </button>
            {i < steps.length - 1 ? <span className="text-brand-muted/50">→</span> : null}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {markets.map((m) => (
            <button key={m.id} type="button" onClick={() => { setMarket(m.id); setStep(1); }} className="card card-hover text-left">
              <p className="text-sm font-semibold text-brand-text">{m.name}</p>
              <p className="mt-1 text-xs text-brand-muted">{m.bookmaker} · {m.outcomes.length} options</p>
            </button>
          ))}
        </div>
      )}

      {step === 1 && activeMarket && (
        <div className="grid gap-2 sm:grid-cols-2">
          {activeMarket.outcomes.map((o) => (
            <button key={o.id} type="button" onClick={() => { setOutcome(o); setStep(2); }} className="card card-hover flex items-center justify-between">
              <span className="text-sm font-semibold text-brand-text">
                {o.name}
                {o.description ? <span className="ml-1 text-brand-muted">· {o.description}</span> : null}
                {o.point != null ? <span className="ml-1 text-brand-muted">{o.point > 0 ? "+" : ""}{o.point}</span> : null}
              </span>
              <span className="scoreboard-num text-brand-primary">{o.price >= 2 ? `+${Math.round((o.price - 1) * 100)}` : Math.round(-100 / (o.price - 1))}</span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {(["LOW", "MEDIUM", "HIGH"] as const).map((c) => (
              <button key={c} type="button" onClick={() => setConfidence(c)} className={`card card-hover text-center ${confidence === c ? "ring-2 ring-brand-primary" : ""}`}>
                <p className="text-sm font-semibold text-brand-text">{c === "LOW" ? "Low" : c === "MEDIUM" ? "Medium" : "High"}</p>
                <p className="text-xs text-brand-muted">{c === "LOW" ? "Casual read" : c === "MEDIUM" ? "Solid lean" : "Strong conviction"}</p>
              </button>
            ))}
          </div>
          <div>
            <label className="label" htmlFor="units">Virtual units ({units})</label>
            <input id="units" type="range" min={1} max={5} step={1} value={units} onChange={(e) => setUnits(Number(e.target.value))} className="w-full accent-brand-primary" />
          </div>
          <div>
            <label className="label" htmlFor="analysis">Analysis (optional)</label>
            <textarea id="analysis" className="input min-h-20" placeholder="Why are you taking this side? (public)" value={analysis} onChange={(e) => setAnalysis(e.target.value)} maxLength={2000} />
          </div>
          <button type="button" className="btn-primary" onClick={() => setStep(3)}>Review prediction</button>
        </div>
      )}

      {step === 3 && market && outcome && (
        <div className="space-y-4">
          <div className="rounded-lg border border-brand-border bg-brand-surface2 p-4 text-sm">
            <div className="flex justify-between"><span className="text-brand-muted">Game</span><span className="font-medium text-brand-text">{game.awayAbbr} @ {game.homeAbbr}</span></div>
            <div className="mt-1 flex justify-between"><span className="text-brand-muted">Market</span><span className="font-medium text-brand-text">{activeMarket?.name}</span></div>
            <div className="mt-1 flex justify-between"><span className="text-brand-muted">Pick</span><span className="font-medium text-brand-text">{outcome.name}{outcome.point != null ? ` ${outcome.point > 0 ? "+" : ""}${outcome.point}` : ""}</span></div>
            <div className="mt-1 flex justify-between"><span className="text-brand-muted">Odds (snapshot)</span><span className="scoreboard-num text-brand-primary">{outcome.price}</span></div>
            <div className="mt-1 flex justify-between"><span className="text-brand-muted">Confidence</span><span className="font-medium text-brand-text">{confidence}</span></div>
            <div className="mt-1 flex justify-between"><span className="text-brand-muted">Units</span><span className="font-medium text-brand-text">{units}</span></div>
          </div>
          <p className="text-xs text-brand-muted">
            Your pick locks when the game starts and settles automatically. Prediction history is permanent.
          </p>
          {error ? <p className="text-sm text-brand-danger">{error}</p> : null}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={reset}>Edit</button>
            <button type="button" className="btn-primary flex-1" disabled={publishing} onClick={publish}>
              {publishing ? "Publishing…" : "Publish prediction"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
