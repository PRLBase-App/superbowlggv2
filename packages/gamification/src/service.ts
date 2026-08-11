import { Prisma, prisma, type WalletTransactionType } from "@sbgg/db";
import { levelForXp, nextStreak, streakMilestoneReward } from "./engine";

export interface GrantResult {
  xp: number;
  coins: number;
  duplicate?: boolean;
  newLevel?: { level: number; title: string };
  unlockedAchievements: string[];
}

interface GrantReference {
  type: string;
  id: string;
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

/** Grant XP and coins once for a stable domain reference. */
export async function grantXpAndCoins(
  userId: string,
  xp: number,
  coins: number,
  type: WalletTransactionType,
  description: string,
  reference?: GrantReference,
): Promise<GrantResult> {
  return serializable(() =>
    prisma.$transaction(async (tx) => {
      if (reference) {
        const existing = await tx.gamificationEvent.findFirst({
          where: { userId, refType: reference.type, refId: reference.id },
          select: { id: true },
        });
        if (existing) return { xp: 0, coins: 0, duplicate: true, unlockedAchievements: [] };
      }

      const xpRow = await tx.userXP.upsert({
        where: { userId },
        update: { totalXp: { increment: xp } },
        create: { userId, totalXp: xp },
      });
      const level = levelForXp(xpRow.totalXp);
      const levelChanged = xpRow.currentLevel !== level.level;
      if (levelChanged) {
        await tx.userXP.update({ where: { userId }, data: { currentLevel: level.level, levelTitle: level.title } });
      }

      if (coins !== 0) {
        const wallet = await tx.wallet.upsert({ where: { userId }, update: {}, create: { userId, balance: 0 } });
        const balanceAfter = wallet.balance + coins;
        if (balanceAfter < 0) throw new Error("Insufficient coins");
        await tx.wallet.update({ where: { id: wallet.id }, data: { balance: balanceAfter } });
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type,
            amount: coins,
            balanceAfter,
            description,
            refType: reference?.type,
            refId: reference?.id,
          },
        });
      }

      await tx.gamificationEvent.create({
        data: {
          userId,
          type: description,
          xpAwarded: xp,
          coinsAwarded: coins,
          refType: reference?.type,
          refId: reference?.id,
        },
      });

      return {
        xp,
        coins,
        newLevel: levelChanged ? { level: level.level, title: level.title } : undefined,
        unlockedAchievements: [],
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }),
  );
}

/** Record at most one activity reward for a user and UTC calendar day. */
export async function recordDailyActivity(userId: string, now = new Date()): Promise<GrantResult> {
  const dayKey = now.toISOString().slice(0, 10);
  const streakResult = await serializable(() =>
    prisma.$transaction(async (tx) => {
      const streak = await tx.dailyStreak.upsert({
        where: { userId },
        update: {},
        create: { userId, currentStreak: 0, longestStreak: 0 },
      });
      const next = nextStreak(streak, now);
      if (!next.updated) return null;
      await tx.dailyStreak.update({
        where: { userId },
        data: { currentStreak: next.currentStreak, longestStreak: next.longestStreak, lastActivityDate: now },
      });
      return next;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }),
  );
  if (!streakResult) return { xp: 0, coins: 0, duplicate: true, unlockedAchievements: [] };
  const coins = streakMilestoneReward(streakResult.currentStreak) ?? 0;
  const xp = 5 + (coins > 0 ? 100 : 0);
  return grantXpAndCoins(userId, xp, coins, "STREAK", `Daily activity — ${streakResult.currentStreak}-day streak`, { type: "daily-activity", id: dayKey });
}

export async function recordSettlementRewards(
  userId: string,
  result: "WIN" | "LOSS" | "PUSH" | "VOID",
  odds: number,
  predictionId: string,
): Promise<GrantResult> {
  if (result !== "WIN") return { xp: 0, coins: 0, unlockedAchievements: [] };
  const coins = Math.max(0, Math.round((odds - 1) * 25));
  return grantXpAndCoins(userId, 25, coins, "REWARD", `Correct prediction @ ${odds}`, { type: "prediction-settlement", id: predictionId });
}

export async function checkAchievements(userId: string): Promise<string[]> {
  const achievements = await prisma.achievement.findMany({ where: { active: true } });
  const stats = await gatherStats(userId);
  const newlyUnlocked: string[] = [];

  for (const achievement of achievements) {
    const criteria = (achievement.criteria ?? {}) as { type?: string; event?: string; threshold?: number };
    if (!criteriaMet(criteria, stats)) continue;
    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
    });
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId, achievementId: achievement.id } },
      update: {},
      create: { userId, achievementId: achievement.id },
    });
    await grantXpAndCoins(userId, achievement.xpReward, achievement.coinReward, "ACHIEVEMENT", `Achievement: ${achievement.title}`, { type: "achievement", id: achievement.id });
    await prisma.notification.upsert({
      where: { dedupeKey: `achievement:${userId}:${achievement.id}` },
      update: {},
      create: {
        userId,
        type: "ACHIEVEMENT_UNLOCKED",
        title: "Achievement unlocked!",
        body: achievement.title,
        link: "/achievements",
        dedupeKey: `achievement:${userId}:${achievement.id}`,
      },
    });
    if (!existing) newlyUnlocked.push(achievement.key);
  }
  return newlyUnlocked;
}

interface Stats {
  predictions: number;
  wins: number;
  followers: number;
  streakDays: number;
  coinsCollected: number;
  currentWinStreak: number;
}

function criteriaMet(criteria: { type?: string; event?: string; threshold?: number }, stats: Stats): boolean {
  const threshold = criteria.threshold ?? 1;
  if (criteria.type === "count" && criteria.event === "PREDICTION_CREATED") return stats.predictions >= threshold;
  if (criteria.type === "count" && criteria.event === "PREDICTION_WON") return stats.wins >= threshold;
  if (criteria.type === "count" && criteria.event === "FOLLOW_RECEIVED") return stats.followers >= threshold;
  if (criteria.type === "streak" && criteria.event === "PREDICTION_WON") return stats.currentWinStreak >= threshold;
  if (criteria.type === "streak_days") return stats.streakDays >= threshold;
  if (criteria.type === "coins") return stats.coinsCollected >= threshold;
  return false;
}

async function gatherStats(userId: string): Promise<Stats> {
  const [predictions, wins, followers, streak, wallet, settled] = await Promise.all([
    prisma.prediction.count({ where: { userId } }),
    prisma.prediction.count({ where: { userId, result: "WIN" } }),
    prisma.userFollow.count({ where: { followingId: userId } }),
    prisma.dailyStreak.findUnique({ where: { userId } }),
    prisma.walletTransaction.aggregate({ where: { wallet: { userId }, amount: { gt: 0 } }, _sum: { amount: true } }),
    prisma.prediction.findMany({ where: { userId, status: "SETTLED", result: { in: ["WIN", "LOSS"] } }, orderBy: { settledAt: "desc" }, take: 50 }),
  ]);
  let currentWinStreak = 0;
  for (const prediction of settled) {
    if (prediction.result !== "WIN") break;
    currentWinStreak++;
  }
  return {
    predictions,
    wins,
    followers,
    streakDays: streak?.currentStreak ?? 0,
    coinsCollected: wallet._sum.amount ?? 0,
    currentWinStreak,
  };
}
