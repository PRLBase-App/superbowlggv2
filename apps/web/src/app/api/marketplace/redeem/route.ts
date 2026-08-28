import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { getSession } from "@/lib/session";
import { redeemMarketplaceOffer } from "@sbgg/affiliate";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { slug } = body as { slug?: unknown };
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) {
    return NextResponse.json({ error: "Invalid offer" }, { status: 400 });
  }

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
      link: "/marketplace#my-rewards",
      dedupeKey: `marketplace-redemption:${session.user.id}:${slug}`,
    },
  });
  return NextResponse.json({ ok: true, promoCode: result.promoCode, destinationUrl: result.destinationUrl, duplicate: result.duplicate });
}
