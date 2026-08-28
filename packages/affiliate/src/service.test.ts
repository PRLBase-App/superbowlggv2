import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  class KnownRequestError extends Error {
    code: string;
    constructor(code: string) {
      super(code);
      this.code = code;
    }
  }
  return { prisma: {} as any, KnownRequestError };
});

vi.mock("@sbgg/db", () => ({
  prisma: mocks.prisma,
  Prisma: {
    PrismaClientKnownRequestError: mocks.KnownRequestError,
    TransactionIsolationLevel: { Serializable: "Serializable" },
  },
}));

import { redeemMarketplaceOffer } from "./service";

type State = {
  offer: any;
  balance: number;
  redemptions: any[];
  walletTransactions: any[];
};

function installStore(overrides: Partial<State> = {}) {
  const state: State = {
    offer: {
      id: "offer-1",
      slug: "test-reward",
      title: "Test reward",
      status: "ACTIVE",
      coinPrice: 50,
      inventory: 1,
      promoCode: "PROMO",
      destinationUrl: "https://partner.example/reward",
      startAt: null,
      endAt: null,
    },
    balance: 100,
    redemptions: [],
    walletTransactions: [],
    ...overrides,
  };
  const tx = {
    marketplaceOffer: {
      findUnique: vi.fn(async () => state.offer),
      updateMany: vi.fn(async () => {
        if (state.offer.inventory == null || state.offer.inventory <= 0) return { count: 0 };
        state.offer.inventory -= 1;
        return { count: 1 };
      }),
    },
    marketplaceRedemption: {
      findUnique: vi.fn(async ({ where }: any) => state.redemptions.find(item => item.userId === where.userId_offerId.userId && item.offerId === where.userId_offerId.offerId) ?? null),
      create: vi.fn(async ({ data }: any) => {
        const redemption = { id: `redemption-${state.redemptions.length + 1}`, ...data };
        state.redemptions.push(redemption);
        return redemption;
      }),
    },
    wallet: {
      findUnique: vi.fn(async ({ where }: any) => where.userId ? { id: `wallet-${where.userId}`, userId: where.userId, balance: state.balance } : null),
      update: vi.fn(async ({ data }: any) => { state.balance = data.balance; return { balance: state.balance }; }),
    },
    walletTransaction: {
      create: vi.fn(async ({ data }: any) => { state.walletTransactions.push(data); return data; }),
    },
  };
  mocks.prisma.$transaction = vi.fn(async (operation: (client: typeof tx) => Promise<unknown>) => operation(tx));
  mocks.prisma.marketplaceRedemption = {
    findFirst: vi.fn(async () => state.redemptions[0] ? { ...state.redemptions[0], offer: state.offer } : null),
  };
  return state;
}

beforeEach(() => {
  for (const key of Object.keys(mocks.prisma)) delete mocks.prisma[key];
});

describe("rewards store redemption", () => {
  it("allows only one parallel redemption of the last inventory item", async () => {
    const state = installStore();
    const results = await Promise.all([
      redeemMarketplaceOffer("user-1", "test-reward"),
      redeemMarketplaceOffer("user-2", "test-reward"),
    ]);
    expect(results.filter(result => result.ok)).toHaveLength(1);
    expect(results.filter(result => result.error === "Sold out")).toHaveLength(1);
    expect(state.balance).toBe(50);
    expect(state.redemptions).toHaveLength(1);
    expect(state.walletTransactions).toHaveLength(1);
  });

  it("does not debit coins for a sold-out reward", async () => {
    const state = installStore({ offer: { ...installStore().offer, inventory: 0 } });
    await expect(redeemMarketplaceOffer("user-1", "test-reward")).resolves.toEqual({ ok: false, error: "Sold out" });
    expect(state.balance).toBe(100);
    expect(state.redemptions).toHaveLength(0);
    expect(state.walletTransactions).toHaveLength(0);
  });

  it("returns an existing reward after the offer is archived", async () => {
    const prior = { id: "redemption-1", userId: "user-1", offerId: "offer-1", promoCode: "PROMO", coinsSpent: 50 };
    const base = installStore();
    const state = installStore({ offer: { ...base.offer, status: "ARCHIVED", inventory: 0 }, redemptions: [prior] });
    await expect(redeemMarketplaceOffer("user-1", "test-reward")).resolves.toEqual({
      ok: true,
      promoCode: "PROMO",
      destinationUrl: "https://partner.example/reward",
      duplicate: true,
    });
    expect(state.balance).toBe(100);
  });

  it("turns a concurrent unique-key race into the prior successful redemption", async () => {
    const state = installStore({ redemptions: [{ id: "redemption-1", userId: "user-1", offerId: "offer-1", promoCode: "PROMO" }] });
    mocks.prisma.$transaction = vi.fn(async () => { throw new mocks.KnownRequestError("P2002"); });
    await expect(redeemMarketplaceOffer("user-1", "test-reward")).resolves.toMatchObject({ ok: true, duplicate: true, promoCode: "PROMO" });
    expect(mocks.prisma.marketplaceRedemption.findFirst).toHaveBeenCalledOnce();
    expect(state.balance).toBe(100);
  });
});
