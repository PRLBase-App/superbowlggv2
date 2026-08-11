/**
 * Production-safe configuration seed.
 *
 * This file deliberately creates no users, games, players, predictions,
 * bookmaker odds, affiliate offers, testimonials, or marketplace inventory.
 * Those records must originate from authentication, configured providers, or
 * an authenticated administrator.
 */
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const levels = [
  { level: 1, title: "Rookie", minXp: 0 },
  { level: 2, title: "Prospect", minXp: 150 },
  { level: 3, title: "Starter", minXp: 400 },
  { level: 4, title: "Veteran", minXp: 900 },
  { level: 5, title: "All-Pro", minXp: 1_800 },
  { level: 6, title: "Elite", minXp: 3_500 },
  { level: 7, title: "Legend", minXp: 6_500 },
];

const achievements = [
  { key: "first-pick", title: "First Pick", description: "Publish your first prediction", xpReward: 50, coinReward: 25, criteria: { type: "count", event: "PREDICTION_CREATED", threshold: 1 } },
  { key: "hot-hand", title: "Hot Hand", description: "Win 3 predictions in a row", xpReward: 100, coinReward: 50, criteria: { type: "streak", event: "PREDICTION_WON", threshold: 3 } },
  { key: "on-fire", title: "On Fire", description: "Win 5 predictions in a row", xpReward: 200, coinReward: 100, criteria: { type: "streak", event: "PREDICTION_WON", threshold: 5 } },
  { key: "football-expert", title: "NFL Expert", description: "Win 50 predictions", xpReward: 1_000, coinReward: 500, criteria: { type: "count", event: "PREDICTION_WON", threshold: 50 } },
  { key: "community-favorite", title: "Community Favorite", description: "Reach 50 followers", xpReward: 250, coinReward: 125, criteria: { type: "count", event: "FOLLOW_RECEIVED", threshold: 50 } },
  { key: "veteran", title: "Veteran", description: "Publish 100 predictions", xpReward: 500, coinReward: 250, criteria: { type: "count", event: "PREDICTION_CREATED", threshold: 100 } },
  { key: "collector", title: "Coin Collector", description: "Earn 10,000 coins", xpReward: 200, coinReward: 250, criteria: { type: "coins", threshold: 10_000 } },
  { key: "streak-7", title: "Week Warrior", description: "Maintain a 7-day activity streak", xpReward: 100, coinReward: 100, criteria: { type: "streak_days", threshold: 7 } },
];

async function main() {
  await prisma.league.upsert({
    where: { slug: "NFL" },
    update: { name: "National Football League", shortName: "NFL", country: "US", active: true },
    create: { slug: "NFL", name: "National Football League", shortName: "NFL", country: "US", sortOrder: 0 },
  });

  for (const level of levels) {
    await prisma.level.upsert({ where: { level: level.level }, update: level, create: level });
  }

  for (const achievement of achievements) {
    const criteria = achievement.criteria as Prisma.InputJsonValue;
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: { ...achievement, criteria },
      create: { ...achievement, criteria },
    });
  }

  const categories = [
    ["sportsbook-offers", "Sportsbook Offers"],
    ["partner-deals", "Partner Deals"],
    ["promo-codes", "Promo Codes"],
    ["digital-rewards", "Digital Rewards"],
    ["merchandise-offers", "Merchandise Offers"],
  ] as const;
  for (const [sortOrder, [slug, name]] of categories.entries()) {
    await prisma.marketplaceCategory.upsert({ where: { slug }, update: { name, sortOrder }, create: { slug, name, sortOrder } });
  }

  const flags = [
    { key: "provider.sports", enabled: false, description: "Set true after a successful API-Sports synchronization" },
    { key: "provider.odds", enabled: false, description: "Set true after a successful The Odds API synchronization" },
    { key: "marketplace", enabled: false, description: "Enable after real offers and fulfillment are configured" },
    { key: "affiliate", enabled: false, description: "Enable after partner contracts and geo rules are configured" },
  ];
  for (const flag of flags) {
    await prisma.featureFlag.upsert({ where: { key: flag.key }, update: flag, create: flag });
  }

  await prisma.appSetting.upsert({
    where: { key: "data.provenance" },
    update: { value: "provider-only", group: "integrations" },
    create: { key: "data.provenance", value: "provider-only", group: "integrations" },
  });
}

main()
  .then(() => console.log("Production configuration seed complete."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
