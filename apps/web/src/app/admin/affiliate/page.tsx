import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Admin · Affiliate" };

export const revalidate = 15;

export default async function AdminAffiliatePage() {
  const [clicks, conversions, offers] = await Promise.all([
    prisma.affiliateClick.findMany({ include: { offer: true, partner: true }, orderBy: { createdAt: "desc" }, take: 60 }),
    prisma.affiliateConversion.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.affiliateOffer.findMany({ include: { partner: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold text-brand-text">Affiliate</h1>
      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">Offers</h2>
        <div className="overflow-x-auto rounded-xl border border-brand-border">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface"><tr><th className="table-head px-4 py-2.5">Offer</th><th className="table-head px-4 py-2.5">Partner</th><th className="table-head px-4 py-2.5">Category</th><th className="table-head px-4 py-2.5">Status</th></tr></thead>
            <tbody className="divide-y divide-brand-border">
              {offers.map((o) => (
                <tr key={o.id} className="hover:bg-brand-surface">
                  <td className="px-4 py-2.5 font-medium text-brand-text">{o.title}</td>
                  <td className="px-4 py-2.5 text-brand-muted">{o.partner?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-brand-muted">{o.category}</td>
                  <td className="px-4 py-2.5"><Badge tone={o.status === "ACTIVE" ? "green" : "slate"}>{o.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">Recent clicks ({clicks.length})</h2>
        <div className="overflow-x-auto rounded-xl border border-brand-border">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface"><tr><th className="table-head px-4 py-2.5">Offer</th><th className="table-head px-4 py-2.5">Country</th><th className="table-head px-4 py-2.5">Device</th><th className="table-head px-4 py-2.5">UTM</th><th className="table-head px-4 py-2.5 text-right">When</th></tr></thead>
            <tbody className="divide-y divide-brand-border">
              {clicks.map((c) => (
                <tr key={c.id} className="hover:bg-brand-surface">
                  <td className="px-4 py-2.5 text-brand-muted">{c.offer?.title ?? c.partner?.name ?? "—"}</td>
                  <td className="px-4 py-2.5 text-brand-muted">{c.country ?? "—"}</td>
                  <td className="px-4 py-2.5 text-brand-muted">{c.device ?? "—"}</td>
                  <td className="px-4 py-2.5 text-brand-muted">{c.utmCampaign ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right text-brand-muted">{c.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="font-display mb-3 text-lg font-semibold">Conversions ({conversions.length})</h2>
        <div className="overflow-x-auto rounded-xl border border-brand-border">
          <table className="w-full text-sm">
            <thead className="bg-brand-surface"><tr><th className="table-head px-4 py-2.5">Status</th><th className="table-head px-4 py-2.5">Source</th><th className="table-head px-4 py-2.5 text-right">Amount</th><th className="table-head px-4 py-2.5 text-right">When</th></tr></thead>
            <tbody className="divide-y divide-brand-border">
              {conversions.map((c) => (
                <tr key={c.id} className="hover:bg-brand-surface">
                  <td className="px-4 py-2.5"><Badge tone={c.status === "CONFIRMED" ? "green" : c.status === "REJECTED" ? "red" : "gold"}>{c.status}</Badge></td>
                  <td className="px-4 py-2.5 text-brand-muted">{c.source}</td>
                  <td className="scoreboard-num px-4 py-2.5 text-right">{c.amount ? `${c.currency ?? "USD"} ${c.amount}` : "—"}</td>
                  <td className="px-4 py-2.5 text-right text-brand-muted">{c.createdAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
