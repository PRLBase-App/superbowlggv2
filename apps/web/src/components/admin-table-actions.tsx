"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminAction {
  label: string;
  action: string;
  payload: Record<string, unknown>;
}

export function AdminTableActions({ actions }: { actions: AdminAction[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run(a: AdminAction) {
    const payload = { ...a.payload };
    if (a.action === "prediction.void") {
      const reason = window.prompt("Reason for voiding this prediction:", "Incorrect or unavailable provider result");
      if (!reason) return;
      payload.reason = reason;
    }
    setBusy(a.label);
    setErr(null);
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: a.action, requestId: crypto.randomUUID(), ...payload }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) setErr(body.error ?? "Action failed");
    else router.refresh();
    setBusy(null);
  }

  return (
    <div className="flex flex-wrap gap-1">
      {actions.map((a) => (
        <button key={a.label} className="rounded-md border border-brand-border bg-brand-surface2 px-2 py-1 text-xs text-brand-muted hover:text-brand-text" disabled={busy !== null} onClick={() => run(a)}>
          {busy === a.label ? "…" : a.label}
        </button>
      ))}
      {err ? <span className="text-xs text-brand-danger">{err}</span> : null}
    </div>
  );
}
