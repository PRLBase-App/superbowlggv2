import { prisma, type GameStatus, type LeagueSlug, type PredictionMarket, type Prisma, type SeasonType } from "@sbgg/db";
import { trendingScore } from "@sbgg/gamification";
import { currentNflSeasonYear } from "./season";

/** Server-side data access for pages. All queries hit the real DB. */

export async function getGames(opts: { week?: number; status?: GameStatus; league?: LeagueSlug; seasonType?: SeasonType; limit?: number } = {}) {
  const season = await getSeason(opts.league ?? "NFL");
  if (!season) return [];
  return prisma.game.findMany({
    where: {
      seasonId: season.id,
      ...(opts.week ? { week: opts.week } : {}),
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.seasonType ? { seasonType: opts.seasonType } : {}),
      ...(opts.league ? { league: { slug: opts.league } } : {}),
    },
    include: { homeTeam: true, awayTeam: true, season: true },
    orderBy: { scheduledAt: "asc" },
    take: opts.limit ?? 50,
  });
}

export async function getGame(gameId: string) {
  return prisma.game.findUnique({
    where: { id: gameId },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      season: true,
      markets: { include: { outcomes: true } },
      teamStats: true,
      playerStats: { include: { player: true } },
      predictions: {
        where: { isPublic: true },
        include: { user: { include: { profile: true } }, player: true },
        orderBy: { publishedAt: "desc" },
        take: 30,
      },
    },
  });
}

export async function getGameWithOdds(gameId: string) {
  return prisma.game.findUnique({
    where: { id: gameId },
    include: {
      homeTeam: true,
      awayTeam: true,
      league: true,
      season: true,
      markets: { include: { outcomes: true, bookmaker: true } },
      odds: { orderBy: { capturedAt: "desc" }, take: 20 },
    },
  });
}

export async function getTeams() {
  return prisma.team.findMany({ orderBy: [{ conference: "asc" }, { division: "asc" }, { name: "asc" }] });
}

export async function getTeam(slug: string) {
  const season = await getSeason();
  return prisma.team.findUnique({
    where: { slug },
    include: {
      homeGames: { where: season ? { seasonId: season.id } : { id: "__no_current_season__" }, include: { awayTeam: true, homeTeam: true }, orderBy: { scheduledAt: "desc" }, take: 20 },
      awayGames: { where: season ? { seasonId: season.id } : { id: "__no_current_season__" }, include: { homeTeam: true, awayTeam: true }, orderBy: { scheduledAt: "desc" }, take: 20 },
      players: { take: 20 },
      standings: { include: { season: true } },
    },
  });
}

export async function getPlayer(slug: string) {
  return prisma.player.findUnique({
    where: { slug },
    include: { team: true, gameStats: { include: { game: { include: { homeTeam: true, awayTeam: true } } }, orderBy: { game: { scheduledAt: "desc" } }, take: 10 }, injuries: true },
  });
}

export async function getStandings() {
  const season = await getSeason();
  if (!season) return [];
  return prisma.standing.findMany({
    where: { seasonId: season.id },
    include: { team: true },
    orderBy: [{ wins: "desc" }, { pointsFor: "desc" }],
  });
}

export async function getSeason(league: LeagueSlug = "NFL") {
  return prisma.season.findFirst({
    where: { league: { slug: league }, year: currentNflSeasonYear() },
    orderBy: { year: "desc" },
  });
}

export async function getInjuries() {
  const season = await getSeason();
  if (!season) return [];
  return prisma.injury.findMany({
    where: { reportedAt: { gte: season.startDate, lte: season.endDate } },
    include: { player: { include: { team: true } } },
    orderBy: { reportedAt: "desc" },
    take: 40,
  });
}

export async function getPredictionFeed(opts: { filter?: string; market?: PredictionMarket; gameId?: string; userId?: string; limit?: number } = {}) {
  const where: Prisma.PredictionWhereInput = { isPublic: true, game: { season: { year: currentNflSeasonYear() } } };
  if (opts.market) where.marketType = opts.market;
  if (opts.gameId) where.gameId = opts.gameId;
  if (opts.userId) where.userId = opts.userId;
  const preds = await prisma.prediction.findMany({
    where,
    include: {
      user: { include: { profile: true, _count: { select: { followers: true } } } },
      game: { include: { homeTeam: true, awayTeam: true } },
      player: true,
      settlement: true,
    },
    orderBy: opts.filter === "top" ? { likes: "desc" } : { publishedAt: "desc" },
    take: opts.limit ?? 40,
  });
  if (opts.filter === "trending") {
    return preds
      .map((p) => ({ ...p, _trending: trendingScore({ publishedAt: p.publishedAt, views: p.views, likes: p.likes, followers: p.user._count.followers }) }))
      .sort((a, b) => b._trending - a._trending);
  }
  return preds;
}

export async function getPrediction(id: string) {
  return prisma.prediction.findUnique({
    where: { id },
    include: {
      user: { include: { profile: true, _count: { select: { followers: true, following: true } } } },
      game: { include: { homeTeam: true, awayTeam: true } },
      player: true,
      settlement: true,
    },
  });
}

export async function getProfileByUsername(username: string) {
  return prisma.profile.findUnique({
    where: { username },
    include: {
      user: {
        include: {
          _count: { select: { followers: true, following: true, predictions: true } },
          predictions: { include: { game: { include: { homeTeam: true, awayTeam: true } }, settlement: true }, orderBy: { publishedAt: "desc" }, take: 20 },
          achievements: { include: { achievement: true } },
          xp: true,
          streak: true,
          wallet: true,
        },
      },
    },
  });
}

export async function getLeaderboard(period: "weekly" | "monthly" | "season" | "allTime" = "allTime", limit = 20) {
  const now = new Date();
  const currentSeason = period === "season"
    ? await prisma.season.findFirst({ where: { league: { slug: "NFL" }, year: currentNflSeasonYear() }, select: { startDate: true } })
    : null;
  const since = period === "weekly"
    ? new Date(now.getTime() - 7 * 86_400_000)
    : period === "monthly"
      ? new Date(now.getTime() - 30 * 86_400_000)
      : period === "season"
        ? currentSeason?.startDate ?? new Date(now.getFullYear(), 7, 1)
        : new Date(0);
  const minimumSamples = { weekly: 5, monthly: 15, season: 30, allTime: 15 } as const;

  const users = await prisma.user.findMany({
    where: {
      profile: { isNot: null },
      predictions: { some: { status: "SETTLED", settledAt: { gte: since }, result: { in: ["WIN", "LOSS"] } } },
    },
    include: {
      profile: true,
      predictions: {
        where: { status: "SETTLED", settledAt: { gte: since }, result: { in: ["WIN", "LOSS", "PUSH"] } },
        select: { result: true, oddsAtCreation: true },
      },
      wallet: true,
      xp: true,
    },
    take: 500,
  });

  const rows = users
    .map((u) => {
      const settled = u.predictions;
      const wins = settled.filter((p) => p.result === "WIN").length;
      const losses = settled.filter((p) => p.result === "LOSS").length;
      const pushes = settled.filter((p) => p.result === "PUSH").length;
      const units = settled.reduce((acc, p) => acc + (p.result === "WIN" ? p.oddsAtCreation - 1 : p.result === "LOSS" ? -1 : 0), 0);
      const accuracy = settled.length ? wins / settled.length : 0;
      const roi = settled.length ? units / settled.length : 0;
      const points = Math.round(wins * 100 + units * 10);
      return { user: u, settled: settled.length, wins, losses, pushes, units: +units.toFixed(2), accuracy, roi: +roi.toFixed(3), points, coins: u.wallet?.balance ?? 0 };
    })
    .filter((r) => r.settled >= minimumSamples[period])
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
  return rows;
}

export async function getMarketplaceOffers() {
  const now = new Date();
  return prisma.marketplaceOffer.findMany({
    where: {
      status: "ACTIVE",
      AND: [
        { OR: [{ startAt: null }, { startAt: { lte: now } }] },
        { OR: [{ endAt: null }, { endAt: { gte: now } }] },
        { OR: [{ inventory: null }, { inventory: { gt: 0 } }] },
        { OR: [{ promoCode: { not: null } }, { destinationUrl: { not: null } }] },
      ],
    },
    include: { category: true, redemptions: true },
    orderBy: { coinPrice: "desc" },
  });
}

export async function getAffiliateOffers() {
  const now = new Date();
  return prisma.affiliateOffer.findMany({
    where: {
      status: "ACTIVE",
      partner: { active: true },
      AND: [
        { OR: [{ startAt: null }, { startAt: { lte: now } }] },
        { OR: [{ endAt: null }, { endAt: { gte: now } }] },
      ],
    },
    include: { partner: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getNews(limit = 12, skip = 0) {
  return prisma.newsItem.findMany({
    include: { team: true },
    orderBy: { publishedAt: "desc" },
    take: Math.min(50, Math.max(1, limit)),
    skip: Math.max(0, skip),
  });
}

export async function getNewsCount() {
  return prisma.newsItem.count();
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
}

export async function getWallet(userId: string) {
  return prisma.wallet.findUnique({
    where: { userId },
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 30 } },
  });
}

export async function getUserAchievements(userId: string) {
  const [unlocked, all] = await Promise.all([
    prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
    prisma.achievement.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { unlocked, all };
}

export async function getReferral(userId: string) {
  return prisma.referral.findUnique({ where: { userId }, include: { events: true } });
}

export async function getAdminStats() {
  const [users, dau, wau, mau, predictions, games, clicks, conversions, impressions, redemptions, seoKeywords, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    prisma.analyticsEvent.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    prisma.prediction.count(),
    prisma.game.count({ where: { status: { in: ["SCHEDULED", "LIVE"] } } }),
    prisma.affiliateClick.count(),
    prisma.affiliateConversion.count(),
    prisma.adImpression.count(),
    prisma.marketplaceRedemption.count(),
    prisma.seoKeyword.count({ where: { source: "SEMRUSH" } }),
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { predictions: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);
  return { users, dau, wau, mau, predictions, games, clicks, conversions, impressions, redemptions, seoKeywords, recentUsers };
}
