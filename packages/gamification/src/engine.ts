import { levels } from "@sbgg/core";

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  nextMinXp: number | null;
  progressPct: number; // 0..1 within current level
}

export function levelForXp(totalXp: number): LevelInfo {
  let current: (typeof levels)[number] = levels[0]!;
  let next: (typeof levels)[number] | null = null;
  for (const l of levels) {
    if (totalXp >= l.minXp) {
      current = l;
      next = null;
    } else {
      next = l;
      break;
    }
  }
  const span = next ? next.minXp - current.minXp : 1;
  const progressPct = next ? Math.min(1, (totalXp - current.minXp) / span) : 1;
  return {
    level: current.level,
    title: current.title,
    minXp: current.minXp,
    nextMinXp: next ? next.minXp : null,
    progressPct,
  };
}

/** Leaderboard point value of a settled prediction. */
export function predictionPoints(opts: {
  result: "WIN" | "LOSS" | "PUSH" | "VOID";
  odds: number | null;
  confidenceWeight?: number;
}): number {
  switch (opts.result) {
    case "WIN":
      return opts.odds == null
        ? Math.round(100 * (opts.confidenceWeight ?? 1))
        : Math.round((opts.odds - 1) * 100 * (opts.confidenceWeight ?? 1));
    case "PUSH":
      return 0;
    case "VOID":
      return 0;
    case "LOSS":
      return -50;
  }
}

/** Streak advance rule: consecutive days, timezone-aware date keys. */
export function nextStreak(prev: { currentStreak: number; longestStreak: number; lastActivityDate: Date | null }, now: Date): { currentStreak: number; longestStreak: number; updated: boolean } {
  const day = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).getTime();
  const today = day(now);
  if (!prev.lastActivityDate) {
    return { currentStreak: 1, longestStreak: Math.max(1, prev.longestStreak), updated: true };
  }
  const last = day(prev.lastActivityDate);
  const diffDays = Math.round((today - last) / 86400000);
  if (diffDays === 0) {
    // already active today — no change
    return { currentStreak: prev.currentStreak, longestStreak: prev.longestStreak, updated: false };
  }
  if (diffDays === 1) {
    const currentStreak = prev.currentStreak + 1;
    return { currentStreak, longestStreak: Math.max(prev.longestStreak, currentStreak), updated: true };
  }
  // gap — streak resets
  return { currentStreak: 1, longestStreak: prev.longestStreak, updated: true };
}

export function streakMilestoneReward(currentStreak: number): number | null {
  const milestones: Record<number, number> = { 3: 30, 7: 100, 14: 250, 30: 600, 100: 2500 };
  return milestones[currentStreak] ?? null;
}

/** Deterministic trending score for the feed (no randomness). */
export function trendingScore(opts: { publishedAt: Date; views: number; likes: number; followers: number; hoursWindow?: number }): number {
  const ageHours = Math.max((Date.now() - opts.publishedAt.getTime()) / 3_600_000, 0.05);
  const engagement = opts.views * 0.3 + opts.likes * 3 + opts.followers * 0.5;
  return Math.round((engagement / Math.pow(ageHours + 2, 1.2)) * 1000) / 1000;
}
