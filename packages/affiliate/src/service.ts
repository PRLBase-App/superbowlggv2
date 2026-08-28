import { Prisma, prisma } from "@sbgg/db";
import type { VisitorContext } from "./geo";
import { isOfferAllowed, parseGeoRestrictions } from "./geo";

async function serializable<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034") throw error;
    }
  }
  throw lastError;
}

/** Track a permitted affiliate click before returning the real partner destination. */
export async function recordAffiliateClick(opts: {
  offerSlug: string;
  visitor: VisitorContext;
  userId?: string;
  sessionId?: string;
  referrer?: string;
  utm?: { source?: string; medium?: string; campaign?: string };
  device?: string;
  placementKey?: string;
}): Promise<{ destinationUrl: string; allowed: boolean; reason?: string } | null> {
  const offer = await prisma.affiliateOffer.findUnique({ where: { slug: opts.offerSlug }, include: { partner: true } });
  const now = new Date();
  if (!offer || !offer.partner.active || offer.status !== "ACTIVE") return null;
  if ((offer.startAt && offer.startAt > now) || (offer.endAt && offer.endAt < now)) return null;

  const storedRule = parseGeoRestrictions(offer.geoRestrictions);
  const geoRule = { ...(storedRule ?? {}), minimumAge: offer.minimumAge ?? storedRule?.minimumAge };
  const check = isOfferAllowed(geoRule, opts.visitor);
  if (!check.allowed) return { destinationUrl: offer.destinationUrl, allowed: false, reason: check.reason };

  await prisma.affiliateClick.create({
    data: {
      offerId: offer.id,
      partnerId: offer.partnerId,
      userId: opts.userId,
      sessionId: opts.sessionId,
      referrer: opts.referrer,
      country: opts.visitor.country?.toUpperCase(),
      campaign: opts.utm?.campaign,
      utmSource: opts.utm?.source,
      utmMedium: opts.utm?.medium,
      utmCampaign: opts.utm?.campaign,
      device: opts.device,
      placementKey: opts.placementKey,
    },
  });
  return { destinationUrl: offer.destinationUrl, allowed: true };
}

/** Record conversions idempotently when an external provider reference is available. */
export async function recordAffiliateConversion(opts: {
  clickId?: string;
  offerSlug?: string;
  userId?: string;
  status?: "PENDING" | "CONFIRMED" | "REJECTED";
  amount?: number;
  currency?: string;
  source: "WEBHOOK" | "CSV" | "MANUAL";
  externalRef?: string;
}): Promise<void> {
  if (opts.source !== "MANUAL" && !opts.externalRef) throw new Error("External conversion reference is required");
  const [offer, click] = await Promise.all([
    opts.offerSlug ? prisma.affiliateOffer.findUnique({ where: { slug: opts.offerSlug } }) : null,
    opts.clickId ? prisma.affiliateClick.findUnique({ where: { id: opts.clickId } }) : null,
  ]);
  const data = {
    clickId: click?.id,
    offerId: offer?.id ?? click?.offerId,
    partnerId: offer?.partnerId ?? click?.partnerId,
    userId: opts.userId ?? click?.userId,
    status: opts.status ?? "PENDING",
    amount: opts.amount,
    currency: opts.currency ?? "USD",
    source: opts.source,
    externalRef: opts.externalRef,
  };
  if (opts.externalRef) {
    await prisma.affiliateConversion.upsert({ where: { externalRef: opts.externalRef }, update: data, create: data });
  } else {
    await prisma.affiliateConversion.create({ data });
  }
}

export interface RedemptionResult {
  ok: boolean;
  error?: string;
  promoCode?: string;
  destinationUrl?: string;
  duplicate?: boolean;
}

/** Debit coins, decrement inventory and create fulfillment in one serializable transaction. */
export async function redeemMarketplaceOffer(userId: string, offerSlug: string): Promise<RedemptionResult> {
  try {
    return await serializable(() => prisma.$transaction(async (tx) => {
      const offer = await tx.marketplaceOffer.findUnique({ where: { slug: offerSlug } });
      if (!offer) return { ok: false, error: "Offer not available" };
      const prior = await tx.marketplaceRedemption.findUnique({ where: { userId_offerId: { userId, offerId: offer.id } } });
      if (prior) {
        return {
          ok: true,
          promoCode: prior.promoCode ?? undefined,
          destinationUrl: offer.destinationUrl ?? undefined,
          duplicate: true,
        };
      }
      const now = new Date();
      if (offer.status !== "ACTIVE") return { ok: false, error: "Offer not available" };
      if ((offer.startAt && offer.startAt > now) || (offer.endAt && offer.endAt < now)) return { ok: false, error: "Offer not available" };
      if (!offer.promoCode && !offer.destinationUrl) return { ok: false, error: "Offer fulfillment is not configured" };
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet || wallet.balance < offer.coinPrice) return { ok: false, error: "Not enough coins" };
      if (offer.inventory != null) {
        const inventory = await tx.marketplaceOffer.updateMany({
          where: { id: offer.id, inventory: { gt: 0 } },
          data: { inventory: { decrement: 1 } },
        });
        if (inventory.count !== 1) return { ok: false, error: "Sold out" };
      }
      const balanceAfter = wallet.balance - offer.coinPrice;
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: balanceAfter } });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "MARKETPLACE_PURCHASE",
          amount: -offer.coinPrice,
          balanceAfter,
          description: `Marketplace: ${offer.title}`,
          refType: "marketplace-offer",
          refId: offer.id,
        },
      });
      await tx.marketplaceRedemption.create({
        data: {
          userId,
          offerId: offer.id,
          coinsSpent: offer.coinPrice,
          promoCode: offer.promoCode,
          status: "FULFILLED",
        },
      });
      return {
        ok: true,
        promoCode: offer.promoCode ?? undefined,
        destinationUrl: offer.destinationUrl ?? undefined,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const prior = await prisma.marketplaceRedemption.findFirst({
        where: { userId, offer: { slug: offerSlug } },
        include: { offer: true },
      });
      if (prior) return {
        ok: true,
        promoCode: prior.promoCode ?? undefined,
        destinationUrl: prior.offer.destinationUrl ?? undefined,
        duplicate: true,
      };
      return { ok: false, error: "Offer was already redeemed" };
    }
    throw error;
  }
}
