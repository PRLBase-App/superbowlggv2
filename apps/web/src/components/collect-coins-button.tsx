"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CollectCoinsButton({ canCollect }: { canCollect: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <button
        className="btn-success w-full"
        disabled={!canCollect || busy}
        onClick={async () => {
          setBusy(true);
          setMsg(null);
          const res = await fetch("/api/wallet/collect", { method: "POST" });
          const body = await res.json().catch(() => ({}));
          if (res.ok) {
            setMsg(`Collected! Streak day ${body.streak}${body.coins > 0 ? ` · +${body.coins} coins` : ""}${body.newLevel ? ` · Level up: ${body.newLevel.title}!` : ""}`);
            router.refresh();
          } else {
            setMsg(body.error ?? "Collection failed");
          }
          setBusy(false);
        }}
      >
        {busy ? "Collecting…" : canCollect ? "Collect today's coins" : "Collected today — come back tomorrow"}
      </button>
      {msg ? <p className="text-sm text-brand-muted">{msg}</p> : null}
    </div>
  );
}
