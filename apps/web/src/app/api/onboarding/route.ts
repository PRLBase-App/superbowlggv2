import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, prisma } from "@sbgg/db";
import { coinDefaults, xpDefaults } from "@sbgg/core";
import { checkAchievements } from "@sbgg/gamification";
import { getSession } from "@/lib/session";

const onboardingSchema = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/).optional(),
  ref: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_-]+$/).optional(),
}).strict();

function normalizedUsername(value: string, fallback: string): string {
  const clean = value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);
  return clean.length >= 3 ? clean : `user_${fallback.slice(-8).toLowerCase()}`;
}

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

/** Create every account-owned record atomically and exactly once after email verification. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated or email not verified" }, { status: 401 });
  const parsed = onboardingSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid onboarding data" }, { status: 400 });

  const userId = session.user.id;
  const requestedName = parsed.data.username ?? session.user.name ?? session.user.email.split("@")[0] ?? "user";
  const username = normalizedUsername(requestedName, userId);
  const referralCode = `${username.slice(0, 12)}-${userId.slice(-8)}`.toUpperCase();

  try {
    const result = await serializable(() => prisma.$transaction(async (tx) => {
      const existingProfile = await tx.profile.findUnique({ where: { userId } });
      if (!existingProfile) {
        const nameOwner = await tx.profile.findUnique({ where: { username } });
        if (nameOwner && nameOwner.userId !== userId) throw new Error("USERNAME_TAKEN");
      }
      const profile = existingProfile ?? await tx.profile.create({
        data: { userId, username, displayName: session.user.name, referralCode },
      });
      await tx.referral.upsert({
        where: { userId },
        update: {},
        create: { userId, code: referralCode },
      });
      await tx.notificationPreference.upsert({ where: { userId }, update: {}, create: { userId } });
      await tx.dailyStreak.upsert({
        where: { userId },
        update: {},
        create: { userId, currentStreak: 0, longestStreak: 0 },
      });

      const registrationEvent = await tx.gamificationEvent.findFirst({
        where: { userId, refType: "account", refId: userId },
        select: { id: true },
      });
      if (!registrationEvent) {
        await tx.userXP.upsert({
          where: { userId },
          update: { totalXp: { increment: xpDefaults.accountCreated } },
          create: { userId, totalXp: xpDefaults.accountCreated },
        });
        const wallet = await tx.wallet.upsert({ where: { userId }, update: {}, create: { userId, balance: 0 } });
        const balanceAfter = wallet.balance + coinDefaults.signupBonus;
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: balanceAfter } });
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "SIGNUP_BONUS",
            amount: coinDefaults.signupBonus,
            balanceAfter,
            description: "Welcome bonus",
            refType: "account",
            refId: userId,
          },
        });
        await tx.gamificationEvent.create({
          data: {
            userId,
            type: "USER_REGISTERED",
            xpAwarded: xpDefaults.accountCreated,
            coinsAwarded: coinDefaults.signupBonus,
            refType: "account",
            refId: userId,
          },
        });
      }

      if (parsed.data.ref) {
        const referral = await tx.referral.findUnique({ where: { code: parsed.data.ref.toUpperCase() } });
        if (referral && referral.userId !== userId) {
          await tx.referralEvent.upsert({
            where: { referralId_referredUserId_type: { referralId: referral.id, referredUserId: userId, type: "SIGNUP" } },
            update: {},
            create: { referralId: referral.id, referredUserId: userId, type: "SIGNUP" },
          });
          await tx.referralEvent.upsert({
            where: { referralId_referredUserId_type: { referralId: referral.id, referredUserId: userId, type: "EMAIL_VERIFIED" } },
            update: {},
            create: { referralId: referral.id, referredUserId: userId, type: "EMAIL_VERIFIED" },
          });
        }
      }
      const wallet = await tx.wallet.findUnique({ where: { userId }, select: { balance: true } });
      return { username: profile.username, coins: wallet?.balance ?? 0, already: Boolean(existingProfile) };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }));
    await checkAchievements(userId);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_TAKEN") {
      return NextResponse.json({ error: "Username is already in use" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Username is already in use" }, { status: 409 });
    }
    throw error;
  }
}
