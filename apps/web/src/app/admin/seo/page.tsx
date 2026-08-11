import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Admin · SEO" };

export const revalidate = 60;

export default async function AdminSeoPage() {
  const [keywords, opportunities, pages, runs] = await Promise.all([
    prisma.seoKeyword.findMany({ orderBy: { searchVolume: "desc" }, take: 200 }),
    prisma.seoOpportunity.findMany({ include: { keyword: true }, orderBy: { score: "desc" }, take: 100 }),
    prisma.seoPage.count(),
    prisma.seoResearchRun.findMany({ orderBy: { startedAt: "desc" }, take: 10 }),
  ]);

  const p0 = keywords.filter((k) => k.priority === "P0");
  const p1 = keywords.filter((k) => k.priority === "P1");
  const ranking = keywords.filter((k) => k.status === "RANKING");
  const avgScore = opportunities.length ? opportunities.reduce((a, o) => a + o.score, 0) / opportunities.length : 0;

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-brand-text">SEO</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Keywords in research DB", value: keywords.length },
          { label: "Ranking keywords (SEMrush)", value: ranking.length },
          { label: "P0 (protect) / P1 (immediate)", value: `${p0.length} / ${p1.length}` },
          { label: "Tracked pages", value: pages },
          { label: "Open opportunities", value: opportunities.length },
          { label: "Avg opportunity score", value: avgScore.toFixed(1) },
        ].map((c) => (
          <div key={c.label} className="card">
            <p className="text-xs uppercase tracking-wide text-brand-muted">{c.label}</p>
            <p className="scoreboard-num mt-1 text-2xl font-bold text-brand-text">{c.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">Top opportunities</h2>
        <div className="overflow-x-auto rounded-xl border border-brand-border">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface"><tr><th className="table-head px-4 py-2.5">Keyword</th><th className="table-head px-4 py-2.5">Cluster</th><th className="table-head px-4 py-2.5">Intent</th><th className="table-head px-4 py-2.5 text-right">Vol</th><th className="table-head px-4 py-2.5 text-right">Diff</th><th className="table-head px-4 py-2.5 text-right">Score</th><th className="table-head px-4 py-2.5">Bucket</th><th className="table-head px-4 py-2.5">Target URL</th></tr></thead>
            <tbody className="divide-y divide-brand-border">
              {opportunities.slice(0, 40).map((o) => (
                <tr key={o.id} className="hover:bg-brand-surface">
                  <td className="px-4 py-2.5 font-medium text-brand-text">{o.keyword.keyword}</td>
                  <td className="px-4 py-2.5 text-brand-muted">{o.keyword.cluster}</td>
                  <td className="px-4 py-2.5 text-brand-muted">{o.keyword.intent}</td>
                  <td className="scoreboard-num px-4 py-2.5 text-right">{o.keyword.searchVolume ?? "—"}</td>
                  <td className="scoreboard-num px-4 py-2.5 text-right">{o.keyword.difficulty ?? "—"}</td>
                  <td className="scoreboard-num px-4 py-2.5 text-right font-bold text-brand-primary">{o.score}</td>
                  <td className="px-4 py-2.5"><Badge tone={o.keyword.priority === "P1" ? "green" : o.keyword.priority === "P2" ? "blue" : "slate"}>{o.keyword.priority}</Badge></td>
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-muted">{o.targetUrl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">Research runs</h2>
        {runs.length === 0 ? (
          <p className="text-sm text-brand-muted">No research runs yet — run <code className="rounded bg-brand-surface2 px-1.5 py-0.5">pnpm seo:research</code>.</p>
        ) : (
          <div className="space-y-1.5">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm">
                <span className="text-brand-text">{r.runType}</span>
                <span className="text-brand-muted">{r.status} · {r.keywordsFound} keywords · {r.unitsUsed} units · {r.startedAt.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
