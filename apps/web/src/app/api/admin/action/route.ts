import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma, type UserRole } from "@sbgg/db";
import { grantXpAndCoins } from "@sbgg/gamification";
import { requireAdmin } from "@/lib/session";

const baseSchema = z.object({ action: z.string().min(1), requestId: z.string().uuid() }).passthrough();

export async function POST(request: Request) {
  const session = await requireAdmin();
  const raw = await request.json().catch(() => null);
  const base = baseSchema.safeParse(raw);
  if (!base.success) return NextResponse.json({ error: "Invalid admin action" }, { status: 400 });
  const { action, requestId } = base.data;
  const ipAddress = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const audit = (entityType: string | null, entityId: string | null, details: object) => prisma.adminAuditLog.create({
    data: { adminId: session.user.id, action, entityType, entityId, details: { ...details, requestId }, ipAddress },
  });

  switch (action) {
    case "user.setRole": {
      const parsed = z.object({ userId: z.string().min(1), role: z.enum(["USER", "MODERATOR", "EDITOR", "ADMIN", "SUPER_ADMIN"]) }).safeParse(raw);
      if (!parsed.success) return NextResponse.json({ error: "Invalid params" }, { status: 400 });
      const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
      if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
      const privilegedChange = [target.role, parsed.data.role].some((role) => role === "ADMIN" || role === "SUPER_ADMIN");
      if (privilegedChange && session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super-admin role required" }, { status: 403 });
      if (target.role === "SUPER_ADMIN" && parsed.data.role !== "SUPER_ADMIN") {
        const superAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN", status: "ACTIVE" } });
        if (superAdmins <= 1) return NextResponse.json({ error: "The last active super admin cannot be demoted" }, { status: 409 });
      }
      await prisma.user.update({
        where: { id: target.id },
        data: { role: parsed.data.role as UserRole, isAdmin: parsed.data.role === "ADMIN" || parsed.data.role === "SUPER_ADMIN" },
      });
      await audit("User", target.id, { role: parsed.data.role });
      return NextResponse.json({ ok: true });
    }
    case "user.setStatus": {
      const parsed = z.object({ userId: z.string().min(1), status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]) }).safeParse(raw);
      if (!parsed.success) return NextResponse.json({ error: "Invalid params" }, { status: 400 });
      if (parsed.data.userId === session.user.id && parsed.data.status !== "ACTIVE") return NextResponse.json({ error: "You cannot suspend your own account" }, { status: 409 });
      const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
      if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (parsed.data.status === "ACTIVE" && !target.emailVerified) return NextResponse.json({ error: "Unverified users cannot be activated" }, { status: 409 });
      await prisma.user.update({ where: { id: target.id }, data: { status: parsed.data.status } });
      if (parsed.data.status !== "ACTIVE") await prisma.session.deleteMany({ where: { userId: target.id } });
      await audit("User", target.id, { status: parsed.data.status });
      return NextResponse.json({ ok: true });
    }
    case "user.adjustWallet": {
      const parsed = z.object({
        userId: z.string().min(1),
        amount: z.number().finite().min(-1_000_000).max(1_000_000).refine((value) => value !== 0),
        reason: z.string().trim().min(3).max(500),
      }).safeParse(raw);
      if (!parsed.success) return NextResponse.json({ error: "Invalid wallet adjustment" }, { status: 400 });
      try {
        await grantXpAndCoins(
          parsed.data.userId,
          0,
          parsed.data.amount,
          "ADMIN_ADJUSTMENT",
          parsed.data.reason,
          { type: "admin-wallet-adjustment", id: requestId },
        );
      } catch (error) {
        if (error instanceof Error && error.message === "Insufficient coins") return NextResponse.json({ error: error.message }, { status: 409 });
        throw error;
      }
      await audit("Wallet", parsed.data.userId, { amount: parsed.data.amount, reason: parsed.data.reason });
      return NextResponse.json({ ok: true });
    }
    case "game.setStatus": {
      const parsed = z.object({ gameId: z.string().min(1), status: z.enum(["SCHEDULED", "LIVE", "FINAL", "POSTPONED", "CANCELLED", "SUSPENDED"]) }).safeParse(raw);
      if (!parsed.success) return NextResponse.json({ error: "Invalid params" }, { status: 400 });
      await prisma.game.update({ where: { id: parsed.data.gameId }, data: { status: parsed.data.status } });
      await audit("Game", parsed.data.gameId, { status: parsed.data.status });
      return NextResponse.json({ ok: true });
    }
    case "prediction.void": {
      const parsed = z.object({ predictionId: z.string().min(1), reason: z.string().trim().min(5).max(1_000) }).safeParse(raw);
      if (!parsed.success) return NextResponse.json({ error: "A specific void reason is required" }, { status: 400 });
      const now = new Date();
      await prisma.$transaction([
        prisma.prediction.update({ where: { id: parsed.data.predictionId }, data: { status: "VOIDED", result: "VOID", settledAt: now } }),
        prisma.predictionSettlement.upsert({
          where: { predictionId: parsed.data.predictionId },
          update: { result: "VOID", settlementReason: parsed.data.reason, settlementSource: `admin:${session.user.id}`, settlementVersion: { increment: 1 }, settledAt: now },
          create: { predictionId: parsed.data.predictionId, result: "VOID", settlementReason: parsed.data.reason, settlementSource: `admin:${session.user.id}`, settlementVersion: 1, settledAt: now },
        }),
      ]);
      await audit("Prediction", parsed.data.predictionId, { reason: parsed.data.reason });
      return NextResponse.json({ ok: true });
    }
    case "offer.toggle": {
      const parsed = z.object({ offerId: z.string().min(1), status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "EXPIRED", "ARCHIVED"]) }).safeParse(raw);
      if (!parsed.success) return NextResponse.json({ error: "Invalid params" }, { status: 400 });
      const offer = await prisma.marketplaceOffer.findUnique({ where: { id: parsed.data.offerId } });
      if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 });
      if (parsed.data.status === "ACTIVE" && !offer.promoCode && !offer.destinationUrl) {
        return NextResponse.json({ error: "Configure a real promo code or reward URL before activation" }, { status: 409 });
      }
      await prisma.marketplaceOffer.update({ where: { id: offer.id }, data: { status: parsed.data.status } });
      await audit("MarketplaceOffer", offer.id, { status: parsed.data.status });
      return NextResponse.json({ ok: true });
    }
    case "setting.set": {
      const parsed = z.object({ key: z.string().regex(/^[a-zA-Z0-9._-]+$/).max(100), value: z.string().max(10_000), group: z.string().max(100).optional() }).safeParse(raw);
      if (!parsed.success) return NextResponse.json({ error: "Invalid setting" }, { status: 400 });
      await prisma.appSetting.upsert({
        where: { key: parsed.data.key },
        update: { value: parsed.data.value },
        create: { key: parsed.data.key, value: parsed.data.value, group: parsed.data.group ?? "general" },
      });
      await audit("AppSetting", parsed.data.key, { group: parsed.data.group });
      return NextResponse.json({ ok: true });
    }
    case "sync.request": {
      const parsed = z.object({ jobType: z.enum([
        "SYNC_SCHEDULE", "SYNC_TEAMS", "SYNC_PLAYERS", "SYNC_STANDINGS", "SYNC_INJURIES", "SYNC_ODDS", "SYNC_LIVE_GAMES", "SYNC_NEWS", "SETTLE_PREDICTIONS",
      ]) }).safeParse(raw);
      if (!parsed.success) return NextResponse.json({ error: "Invalid sync job" }, { status: 400 });
      const existing = await prisma.integrationSyncLog.findFirst({
        where: { jobType: parsed.data.jobType, status: { in: ["PENDING", "RUNNING"] }, startedAt: { gte: new Date(Date.now() - 60 * 60 * 1_000) } },
        select: { id: true },
      });
      if (existing) return NextResponse.json({ error: "This sync is already queued or running" }, { status: 409 });
      const provider = parsed.data.jobType === "SYNC_ODDS" ? "the-odds-api" : parsed.data.jobType === "SYNC_NEWS" ? "espn-rss" : "nflverse";
      const queued = await prisma.integrationSyncLog.create({
        data: { jobType: parsed.data.jobType, status: "PENDING", provider, metadata: { requestedBy: session.user.id, requestId } },
      });
      await audit("IntegrationSyncLog", queued.id, { jobType: parsed.data.jobType });
      return NextResponse.json({ ok: true, queued: true });
    }
    default:
      return NextResponse.json({ error: `Unknown action ${action}` }, { status: 400 });
  }
}
