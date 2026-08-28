"use client";

import { useLayoutEffect, useState } from "react";
import { Laptop, Moon, Sun } from "lucide-react";
import type { ThemePreferenceValue } from "@/lib/theme";

const THEMES = [
  { value: "LIGHT" as const, label: "Light", description: "Always use the light theme", icon: Sun },
  { value: "DARK" as const, label: "Dark", description: "Always use the dark theme", icon: Moon },
  { value: "SYSTEM" as const, label: "System", description: "Match this device automatically", icon: Laptop },
];

export function ThemeSelector({ initialTheme }: { initialTheme: ThemePreferenceValue }) {
  const [theme, setTheme] = useState(initialTheme);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  async function choose(nextTheme: ThemePreferenceValue) {
    const previous = theme;
    setTheme(nextTheme);
    setMessage(null);
    setSaving(true);
    try {
      const response = await fetch("/api/settings/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: nextTheme }),
      });
      if (!response.ok) throw new Error("save failed");
      setMessage("Theme saved");
    } catch {
      setTheme(previous);
      setMessage("Theme could not be saved. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card" aria-labelledby="theme-heading">
      <div className="flex items-start justify-between gap-3">
        <div><h2 id="theme-heading" className="font-display text-lg font-semibold text-brand-text">Appearance</h2><p className="mt-1 text-sm text-brand-muted">Applied immediately across Superbowl.gg.</p></div>
        {saving ? <span className="text-xs text-brand-muted" aria-live="polite">Saving…</span> : null}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {THEMES.map((item) => {
          const Icon = item.icon;
          const active = theme === item.value;
          return (
            <button key={item.value} type="button" aria-pressed={active} onClick={() => void choose(item.value)} className={`min-h-20 rounded-xl border p-3 text-left transition ${active ? "border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/20" : "border-brand-border bg-brand-surface2 hover:border-brand-primary/50"}`}>
              <span className="flex items-center gap-2 font-semibold text-brand-text"><Icon className="h-4 w-4 text-brand-primary" /> {item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-brand-muted">{item.description}</span>
            </button>
          );
        })}
      </div>
      {message ? <p className={`mt-3 text-sm ${message === "Theme saved" ? "text-brand-success" : "text-brand-danger"}`} role="status">{message}</p> : null}
    </section>
  );
}
