import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@sbgg/db";
import { requireAdmin } from "@/lib/session";

const offerSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  description: z.string().trim().max(2_000).optional(),
  coinPrice: z.coerce.number().positive().max(10_000_000),
  categoryId: z.string().min(1).optional(),
  promoCode: z.string().trim().min(1).max(200).optional(),
  destinationUrl: z.string().url().max(2_000).optional(),
  inventory: z.coerce.number().int().positive().max(1_000_000).optional(),
}).strict().refine((value) => Boolean(value.promoCode || value.destinationUrl), {
  message: "A real promo code or reward URL is required",
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  const parsed = offerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid offer" }, { status: 400 });
  const input = parsed.data;
  const exists = await prisma.marketplaceOffer.findUnique({ where: { slug: input.slug } });
  if (exists) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
  const offer = await prisma.marketplaceOffer.create({
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      coinPrice: input.coinPrice,
      categoryId: input.categoryId,
      promoCode: input.promoCode,
      destinationUrl: input.destinationUrl,
      inventory: input.inventory,
      status: "DRAFT",
    },
  });
  await prisma.adminAuditLog.create({
    data: { adminId: session.user.id, action: "marketplace.create", entityType: "MarketplaceOffer", entityId: offer.id },
  });
  return NextResponse.json({ ok: true, id: offer.id }, { status: 201 });
}
