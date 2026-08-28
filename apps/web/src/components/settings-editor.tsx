"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";

export function SettingsEditor({ settings }: { settings: { key: string; value: string; group: string }[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(settings.map((s) => [s.key, s.value])));
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (busy) return;
    setBusy(true); setMsg(null); setError(null);
    let saved = 0;
    const failures: string[] = [];
    for (const s of settings) {
      try {
        const res = await fetch("/api/admin/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "setting.set", requestId: crypto.randomUUID(), key: s.key, value: values[s.key] ?? "", group: s.group }),
        });
        if (res.ok) saved++;
        else {
          const body = await res.json().catch(() => ({})) as { error?: string };
          failures.push(`${s.key}: ${body.error ?? `HTTP ${res.status}`}`);
        }
      } catch {
        failures.push(`${s.key}: network error`);
      }
    }
    if (failures.length) setError(`Saved ${saved}/${settings.length}. Failed: ${failures.join("; ")}`);
    else { setMsg(`Saved all ${saved} settings`); router.refresh(); }
    setBusy(false);
  }

  if (settings.length === 0) return <Card><p className="text-sm text-brand-muted">No gamification settings yet.</p></Card>;

  return (
    <div className="space-y-3">
      {settings.map((s) => (
        <div key={s.key} className="card flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="w-64 text-sm font-medium text-brand-text">{s.key}</label>
          <input className="input" value={values[s.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))} />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button className="btn-primary" onClick={() => void save()} disabled={busy}>{busy ? "Saving…" : "Save all"}</button>
        {msg ? <span className="text-sm text-brand-success">{msg}</span> : null}
        {error ? <span className="text-sm text-brand-danger" role="alert">{error}</span> : null}
      </div>
    </div>
  );
}
