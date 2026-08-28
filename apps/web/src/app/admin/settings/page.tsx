import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge } from "@/components/ui";
import { SettingsEditor } from "@/components/settings-editor";

export const metadata: Metadata = { title: "Admin · Settings" };

export const revalidate = 15;

export default async function AdminSettingsPage() {
  const [flags, settings] = await Promise.all([
    prisma.featureFlag.findMany({ orderBy: { key: "asc" } }),
    prisma.appSetting.findMany({ orderBy: { key: "asc" } }),
  ]);
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-brand-text">Settings</h1>
      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">App settings</h2>
        <SettingsEditor settings={settings.map(({ key, value, group }) => ({ key, value, group }))} />
      </section>
      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">Feature flags</h2>
        {flags.length === 0 ? (
          <p className="text-sm text-brand-muted">No feature flags configured.</p>
        ) : (
          <div className="space-y-1.5">
            {flags.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm">
                <span className="font-mono text-xs text-brand-text">{f.key}</span>
                <Badge tone={f.enabled ? "green" : "slate"}>{f.enabled ? "On" : "Off"}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
