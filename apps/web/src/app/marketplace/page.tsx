import type { Metadata } from "next";
import Link from "next/link";
import { getMarketplaceOffers, getAffiliateOffers } from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { Badge, SectionTitle, EmptyState } from "@/components/ui";
import { prisma } from "@sbgg/db";

export const metadata: Metadata = {
  title: "Rewards Store — Spend Coins on Rewards",
  description: "Exchange your Superbowl.gg coins for partner offers, promo codes and merchandise.",
};

export const revalidate = 60;

export default async function MarketplacePage() {
  const [offers, affiliateOffers, user] = await Promise.all([getMarketplaceOffers(), getAffiliateOffers(), getSessionUser()]);
  const redemptions = user ? await prisma.marketplaceRedemption.findMany({
    where: { userId: user.id },
    include: { offer: true },
    orderBy: { createdAt: "desc" },
  }) : [];

  return (
    <div className="space-y-8">
      <SectionTitle sub="Admin- and partner-curated rewards for virtual coins">
        <span className="text-brand-text">Rewards Store</span>
      </SectionTitle>
      <div className="card border-brand-primary/20 bg-brand-primary/5 text-sm leading-6 text-brand-muted">
        Rewards are listed only by Superbowl.gg or verified partners. Coins have no cash value, and users cannot list, sell or transfer offers.
        <a href="mailto:support@superbowl.gg?subject=Offer%20a%20reward" className="ml-2 font-semibold text-brand-primary hover:underline">Offer a reward</a>
      </div>
      {user ? (
        <p className="text-sm text-brand-muted">
          Your balance: <span className="scoreboard-num font-bold text-brand-gold">◎ {user.coins.toLocaleString()}</span>
        </p>
      ) : null}

      {user ? (
        <section id="my-rewards">
          <SectionTitle sub="Your redemption history stays available here">My Rewards</SectionTitle>
          {redemptions.length ? <div className="grid gap-3 sm:grid-cols-2">{redemptions.map((redemption) => (
            <div key={redemption.id} className="card">
              <div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-brand-text">{redemption.offer.title}</p><p className="mt-1 text-xs text-brand-muted">{redemption.offer.partnerName ?? "Superbowl.gg"} · {redemption.createdAt.toLocaleDateString()}</p></div><Badge tone={redemption.status === "FULFILLED" ? "green" : redemption.status === "REJECTED" ? "red" : "slate"}>{redemption.status}</Badge></div>
              <p className="scoreboard-num mt-3 text-sm text-brand-gold">◎ {redemption.coinsSpent.toLocaleString()}</p>
              {redemption.promoCode ? <p className="mt-3 rounded-lg bg-brand-surface2 p-3 text-sm text-brand-text">Promo code: <strong className="font-mono select-all">{redemption.promoCode}</strong></p> : null}
              {redemption.offer.destinationUrl ? <a href={redemption.offer.destinationUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-3 w-full">Open partner reward</a> : null}
            </div>
          ))}</div> : <EmptyState title="No rewards redeemed yet" body="Redeemed promo codes and partner links will remain available here." />}
        </section>
      ) : null}

      {offers.length === 0 && affiliateOffers.length === 0 ? (
        <EmptyState title="No offers right now" body="New offers land here regularly." />
      ) : null}

      {offers.length ? (
        <section>
          <SectionTitle sub="Coin offers — redeem with your virtual balance">Coin Offers</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((o) => (
              <Link key={o.id} href={`/marketplace/${o.slug}`} className="card card-hover">
                <div className="flex items-center justify-between">
                  <Badge tone="gold">{o.category?.name ?? "Offer"}</Badge>
                  <span className="scoreboard-num text-lg font-bold text-brand-gold">{o.coinPrice.toLocaleString()} ◎</span>
                </div>
                <p className="mt-2 font-semibold text-brand-text">{o.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-brand-muted">{o.description}</p>
                <p className="mt-3 text-xs text-brand-muted">by {o.partnerName ?? "Superbowl.gg"}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {affiliateOffers.length ? (
        <section>
          <SectionTitle sub="Partner offers · 21+ · you leave Superbowl.gg to claim">Sponsored Offers</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {affiliateOffers.map((o) => (
              <Link key={o.id} href={`/go/${o.slug}`} className="card card-hover">
                <Badge tone="blue">Sponsored · {o.partner?.name}</Badge>
                <p className="mt-2 font-semibold text-brand-text">{o.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-brand-muted">{o.description}</p>
                <p className="mt-3 text-xs text-brand-muted">Terms & geo restrictions apply. Never a real-money wager on Superbowl.gg.</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
