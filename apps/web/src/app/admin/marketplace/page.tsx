import type { Metadata } from "next";
import { prisma } from "@sbgg/db";
import { Badge } from "@/components/ui";
import { AdminTableActions } from "@/components/admin-table-actions";
import { AdminOfferForm } from "@/components/admin-offer-form";

export const metadata: Metadata = { title: "Admin · Rewards Store" };

export const revalidate = 15;

export default async function AdminMarketplacePage() {
  const offers = await prisma.marketplaceOffer.findMany({ include: { category: true, _count: { select: { redemptions: true } } }, orderBy: { createdAt: "desc" } });
  const categories = await prisma.marketplaceCategory.findMany();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-text">Rewards Store</h1>
      <AdminOfferForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface">
            <tr>
              <th className="table-head px-4 py-2.5">Offer</th>
              <th className="table-head px-4 py-2.5">Category</th>
              <th className="table-head px-4 py-2.5 text-right">Price</th>
              <th className="table-head px-4 py-2.5 text-right">Redemptions</th>
              <th className="table-head px-4 py-2.5">Status</th>
              <th className="table-head px-4 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {offers.map((o) => (
              <tr key={o.id} className="hover:bg-brand-surface">
                <td className="px-4 py-2.5 font-medium text-brand-text">{o.title}</td>
                <td className="px-4 py-2.5 text-brand-muted">{o.category?.name ?? "—"}</td>
                <td className="scoreboard-num px-4 py-2.5 text-right text-brand-gold">{o.coinPrice}</td>
                <td className="scoreboard-num px-4 py-2.5 text-right">{o._count.redemptions}</td>
                <td className="px-4 py-2.5"><Badge tone={o.status === "ACTIVE" ? "green" : o.status === "PAUSED" ? "gold" : "slate"}>{o.status}</Badge></td>
                <td className="px-4 py-2.5">
                  <AdminTableActions
                    actions={[
                      ...(o.status === "ACTIVE" ? [{ label: "Pause", action: "offer.toggle", payload: { offerId: o.id, status: "PAUSED" } }] : [{ label: "Activate", action: "offer.toggle", payload: { offerId: o.id, status: "ACTIVE" } }]),
                      { label: "Archive", action: "offer.toggle", payload: { offerId: o.id, status: "ARCHIVED" } },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
