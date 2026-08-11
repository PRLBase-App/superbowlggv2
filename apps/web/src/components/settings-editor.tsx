"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";

export function SettingsEditor({ settings }: { settings: { key: string; value: string; group: string }[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(settings.map((s) => [s.key, s.value])));
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    let saved = 0;
    for (const s of settings) {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setting.set", key: s.key, value: values[s.key] ?? "", group: s.group }),
      });
      if (res.ok) saved++;
    }
    setMsg(`Saved ${saved}/${settings.length} settings`);
    router.refresh();
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
        <button className="btn-primary" onClick={save}>Save all</button>
        {msg ? <span className="text-sm text-brand-success">{msg}</span> : null}
      </div>
    </div>
  );
}
