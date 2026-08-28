import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@sbgg/db";
import { getSessionUser } from "@/lib/session";
import { Card, Badge } from "@/components/ui";
import { RedeemButton } from "@/components/redeem-button";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const offer = await prisma.marketplaceOffer.findUnique({ where: { slug } });
  if (!offer) return { title: "Offer not found" };
  return { title: offer.title, description: offer.description?.slice(0, 160) };
}

export const revalidate = 30;

export default async function MarketplaceOfferPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const now = new Date();
  const user = await getSessionUser();
  const offer = await prisma.marketplaceOffer.findUnique({
    where: { slug },
    include: { category: true, redemptions: { where: { userId: user?.id ?? "" }, take: 1 } },
  });
  const prior = offer?.redemptions[0];
  const available = offer?.status === "ACTIVE"
    && (!offer.startAt || offer.startAt <= now)
    && (!offer.endAt || offer.endAt >= now)
    && (offer.inventory == null || offer.inventory > 0);
  if (!offer || (!available && !prior)) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Badge tone="gold">{offer.category?.name ?? "Offer"}</Badge>
            <h1 className="mt-2 font-display text-2xl font-semibold text-brand-text">{offer.title}</h1>
            <p className="mt-1 text-sm text-brand-muted">by {offer.partnerName ?? "Superbowl.gg"}</p>
            <p className="mt-3 text-sm leading-relaxed text-brand-muted">{offer.description}</p>
            {offer.promoCode ? (
              <p className="mt-3 text-xs text-brand-muted">
                Includes promo code — revealed after redemption.
              </p>
            ) : null}
          </div>
          <div className="shrink-0 rounded-xl border border-brand-border bg-brand-surface2 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-brand-muted">Price</p>
            <p className="scoreboard-num mt-1 text-3xl font-bold text-brand-gold">◎ {offer.coinPrice.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-6 border-t border-brand-border pt-4">
          <RedeemButton slug={offer.slug} coinPrice={offer.coinPrice} enoughCoins={(user?.coins ?? 0) >= offer.coinPrice} loggedIn={!!user} existingReward={prior ? { promoCode: prior.promoCode ?? undefined, destinationUrl: offer.destinationUrl ?? undefined } : undefined} />
        </div>
        <p className="mt-4 text-xs text-brand-muted">
          Coins are virtual and have no cash value. Only Superbowl.gg and verified partners list rewards; users cannot sell offers. Redemptions are fulfilled by partners; promo codes are shared as-is.
        </p>
      </Card>
    </div>
  );
}
