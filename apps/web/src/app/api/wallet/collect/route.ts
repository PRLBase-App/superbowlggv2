import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { recordDailyActivity, checkAchievements } from "@sbgg/gamification";
import { getSession } from "@/lib/session";

/** Daily coin collect — one per day, ladder grows with streak. */
export async function POST() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const result = await recordDailyActivity(session.user.id);
  if (result.duplicate) return NextResponse.json({ error: "Already collected today" }, { status: 409 });
  await checkAchievements(session.user.id);

  const freshStreak = await prisma.dailyStreak.findUnique({ where: { userId: session.user.id } });
  const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });

  return NextResponse.json({
    ok: true,
    streak: freshStreak?.currentStreak ?? 1,
    xp: result.xp,
    coins: result.coins,
    balance: wallet?.balance ?? 0,
    newLevel: result.newLevel,
  });
}
