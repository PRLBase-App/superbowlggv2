"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkAllReadButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div><button
        className="btn-ghost"
        disabled={busy}
        onClick={async () => {
          if (busy) return;
          setBusy(true); setError(null);
          try {
            const response = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
            if (!response.ok) throw new Error("Could not mark notifications as read.");
            router.refresh();
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "The network did not respond.");
          } finally { setBusy(false); }
        }}
      >{busy ? "Marking…" : "Mark all as read"}</button>{error ? <p className="mt-2 text-xs text-brand-danger" role="alert">{error}</p> : null}</div>
  );
}
