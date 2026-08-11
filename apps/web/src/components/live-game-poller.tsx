"use client";

import { useEffect, useState } from "react";

/** Polls the live game endpoint every 30s — simplest reliable real-time. */
export function LiveGamePoller({ gameId }: { gameId: string }) {
  const [clock, setClock] = useState<{ quarter: number | null; clock: string | null; home: number; away: number; status: string } | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/games/${gameId}/live`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (alive) setClock(data);
        }
      } catch {
        /* transient — keep polling */
      }
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [gameId]);

  if (!clock || (clock.status !== "LIVE" && clock.status !== "FINAL")) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand-danger/40 bg-brand-danger/10 px-3 py-2 text-sm font-semibold text-brand-danger">
      {clock.status === "LIVE" ? (
        <>
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-danger" aria-hidden />
          {clock.quarter}Q · {clock.clock} · {clock.away}–{clock.home}
        </>
      ) : (
        <>Final · {clock.away}–{clock.home}</>
      )}
    </div>
  );
}
