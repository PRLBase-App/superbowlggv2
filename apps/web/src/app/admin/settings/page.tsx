import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge } from "@/components/ui";

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
        <div className="overflow-x-auto rounded-xl border border-brand-border">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface"><tr><th className="table-head px-4 py-2.5">Key</th><th className="table-head px-4 py-2.5">Value</th><th className="table-head px-4 py-2.5">Group</th></tr></thead>
            <tbody className="divide-y divide-brand-border">
              {settings.map((s) => (
                <tr key={s.id} className="hover:bg-brand-surface">
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-text">{s.key}</td>
                  <td className="px-4 py-2.5 text-brand-muted">{s.value}</td>
                  <td className="px-4 py-2.5"><Badge tone="slate">{s.group}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
