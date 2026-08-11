import type { Metadata } from "next";
import Link from "next/link";
import { getMarketplaceOffers, getAffiliateOffers } from "@/lib/data";
import { getSessionUser } from "@/lib/session";
import { Badge, SectionTitle, EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Marketplace — Spend Coins on Real Rewards",
  description: "Exchange your Superbowl.gg coins for partner offers, promo codes and merchandise.",
};

export const revalidate = 60;

export default async function MarketplacePage() {
  const [offers, affiliateOffers, user] = await Promise.all([getMarketplaceOffers(), getAffiliateOffers(), getSessionUser()]);

  return (
    <div className="space-y-8">
      <SectionTitle sub="Your virtual coins unlock partner deals, codes and rewards">
        <span className="text-brand-text">Marketplace</span>
      </SectionTitle>
      {user ? (
        <p className="text-sm text-brand-muted">
          Your balance: <span className="scoreboard-num font-bold text-brand-gold">◎ {user.coins.toLocaleString()}</span>
        </p>
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
