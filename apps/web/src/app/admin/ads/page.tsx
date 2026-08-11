import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Admin · Ads" };

export const revalidate = 15;

export default async function AdminAdsPage() {
  const [campaigns, impressions, clicks] = await Promise.all([
    prisma.adCampaign.findMany({ include: { creatives: true }, orderBy: { createdAt: "desc" } }),
    prisma.adImpression.count(),
    prisma.adClick.count(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Advertising</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card"><p className="text-xs uppercase tracking-wide text-brand-muted">Campaigns</p><p className="scoreboard-num mt-1 text-2xl font-bold text-brand-text">{campaigns.length}</p></div>
        <div className="card"><p className="text-xs uppercase tracking-wide text-brand-muted">Impressions / Clicks</p><p className="scoreboard-num mt-1 text-2xl font-bold text-brand-text">{impressions} / {clicks}</p></div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface"><tr><th className="table-head px-4 py-2.5">Campaign</th><th className="table-head px-4 py-2.5">Advertiser</th><th className="table-head px-4 py-2.5">Creatives</th><th className="table-head px-4 py-2.5">Status</th></tr></thead>
          <tbody className="divide-y divide-brand-border">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-brand-surface">
                <td className="px-4 py-2.5 font-medium text-brand-text">{c.name}</td>
                <td className="px-4 py-2.5 text-brand-muted">{c.advertiser}</td>
                <td className="px-4 py-2.5 text-brand-muted">{c.creatives.length}</td>
                <td className="px-4 py-2.5"><Badge tone={c.status === "ACTIVE" ? "green" : "slate"}>{c.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-brand-muted">Ad placements render from active campaigns on HOME, GAME_PAGE, PREDICTION_FEED, LEADERBOARD and MARKETPLACE.</p>
    </div>
  );
}
