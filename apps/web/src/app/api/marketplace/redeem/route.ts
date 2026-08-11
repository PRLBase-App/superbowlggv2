import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { getSession } from "@/lib/session";
import { redeemMarketplaceOffer } from "@sbgg/affiliate";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { slug } = body as { slug?: string };
  if (!slug) return NextResponse.json({ error: "Missing offer" }, { status: 400 });

  const result = await redeemMarketplaceOffer(session.user.id, slug);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  await prisma.notification.upsert({
    where: { dedupeKey: `marketplace-redemption:${session.user.id}:${slug}` },
    update: {},
    create: {
      userId: session.user.id,
      type: "MARKETPLACE_PURCHASE",
      title: "Redemption confirmed",
      body: "Your configured reward is ready.",
      dedupeKey: `marketplace-redemption:${session.user.id}:${slug}`,
    },
  });
  return NextResponse.json({ ok: true, promoCode: result.promoCode, destinationUrl: result.destinationUrl, duplicate: result.duplicate });
}
