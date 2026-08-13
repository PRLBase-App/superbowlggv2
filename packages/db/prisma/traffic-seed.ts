/**
 * Traffic seed — community accounts with real-looking activity.
 *
 * Creates demo users with profiles, wallets, XP, streaks, achievements,
 * followers and predictions (pending on upcoming preseason/regular-season
 * games, plus settled picks on the Hall of Fame game using the real final
 * score from the sports provider).
 *
 * Deliberately does NOT invent: game results, odds lines or scores. Settled
 * predictions only exist for games the provider has marked FINAL.
 *
 * Idempotent: users are matched by email and skipped when they already exist.
 *
 * Usage: pnpm db:seed:traffic
 * All demo accounts share the password: Superbowl2026!
 */
import { randomBytes, scrypt } from "node:crypto";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Superbowl2026!";

// Deterministic RNG so repeated runs produce identical output.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20260812);
const rand = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const pick = <T,>(items: T[]): T => items[Math.floor(rng() * items.length)];
const chance = (pct: number) => rng() < pct / 100;

/** Better Auth compatible scrypt hash: `${saltHex}:${keyHex}` (N=16384, r=16, p=1, dkLen=64). */
function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password.normalize("NFKC"), salt, 64, { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 }, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

interface DemoUser {
  email: string;
  username: string;
  displayName: string;
  bio: string;
  location: string;
  picks: number; // target number of predictions
}

const USERS: DemoUser[] = [
  { email: "gridiron.guru.2026@gmail.com", username: "gridiron_guru", displayName: "Marcus Webb", bio: "Film room every morning before coffee. Bears fan, spreads are my bread and butter.", location: "Chicago, IL", picks: 10 },
  { email: "fourth.down.frank@gmail.com", username: "fourth_down_frank", displayName: "Frank Delgado", bio: "Former HS offensive coordinator. If it's 4th and short, I have an opinion.", location: "Dallas, TX", picks: 8 },
  { email: "blitz.crazy.2026@gmail.com", username: "blitz_crazy", displayName: "Tyra Cole", bio: "Blitz rate truther. If your QB sees a clean pocket, you're not watching the right tape.", location: "Philadelphia, PA", picks: 9 },
  { email: "redzone.rebel@gmail.com", username: "redzone_rebel", displayName: "Devon Price", bio: "Live in the red zone. Totals only, never touch a moneyline before Week 1.", location: "Atlanta, GA", picks: 7 },
  { email: "cover.two.tom@gmail.com", username: "cover_two_tom", displayName: "Tom Okonkwo", bio: "Cover-2 disciple and Seahawks lifer. Preseason is for evaluating depth, not betting trends.", location: "Seattle, WA", picks: 6 },
  { email: "monday.morning.qb.26@gmail.com", username: "monday_morning_qb", displayName: "Avery Stone", bio: "I rewatch every game with the all-22. Slow, methodical, profitable.", location: "Denver, CO", picks: 9 },
  { email: "pigskin.prophet@gmail.com", username: "pigskin_prophet", displayName: "Rashid Johnson", bio: "Predicting football since the Barry Sanders era. Lions fan — the hard way.", location: "Detroit, MI", picks: 10 },
  { email: "third.and.long.2026@gmail.com", username: "third_and_long", displayName: "Lena Fischer", bio: "Data nerd. Building a model one season at a time. Vikings skeptic.", location: "Minneapolis, MN", picks: 7 },
  { email: "sack.master.99@gmail.com", username: "sack_master_99", displayName: "Chris Villanueva", bio: "Rush hour is my favorite hour. Pass-rush matchups decide everything.", location: "Green Bay, WI", picks: 5 },
  { email: "hail.mary.hero@gmail.com", username: "hail_mary_hero", displayName: "Sofia Reyes", bio: "Dolphins fan. I take the over on everything and live with the consequences.", location: "Miami, FL", picks: 8 },
  { email: "zone.read.zach@gmail.com", username: "zone_read_zach", displayName: "Zach O'Malley", bio: "Quarterback tape junkie. If the mesh point is late, the pick is early.", location: "Kansas City, MO", picks: 6 },
  { email: "route.runner.nia@gmail.com", username: "crisp_route_runner", displayName: "Nia Thompson", bio: "Route trees, stems and breaks. Wide receiver props are my specialty.", location: "Baltimore, MD", picks: 7 },
  { email: "two.minute.drill.26@gmail.com", username: "two_minute_drill", displayName: "Andre Baptiste", bio: "Two-minute offense is the best part of football. Saints fan through the good and the ugly.", location: "New Orleans, LA", picks: 8 },
  { email: "goal.line.grace@gmail.com", username: "goal_line_grace", displayName: "Grace Kim", bio: "Short-yardage situations. When the field shrinks, so does the margin for error.", location: "Los Angeles, CA", picks: 6 },
  { email: "special.teams.stan@gmail.com", username: "special_teams_stan", displayName: "Stan Kowalski", bio: "Field position wins games. Yes, I watch the punting stats. No, I will not apologize.", location: "Pittsburgh, PA", picks: 5 },
  { email: "overtime.oliver@gmail.com", username: "overtime_oliver", displayName: "Oliver Grant", bio: "Texans fan since the helmet launch. I pick with my head, not my heart (usually).", location: "Houston, TX", picks: 6 },
];

const ANALYSES = [
  "Camp reports say the first-team offense has been sharp; I like the home side to control this one.",
  "Preseason is about evaluating depth — the backup QB situation here gives the edge to the road team.",
  "The defensive front has been winning practice reps all week. That usually travels well.",
  "Expect a conservative game script with both staffs protecting starters. Keep it simple.",
  "This line feels a touch short given how the offense has looked in joint practices.",
  "The secondary is banged up early in camp, which could show up against a competent passing attack.",
  "Running back depth is the story of this game; the team with fresher legs late should cover.",
  "Special teams and field position decide most August games. I trust the more experienced kicker.",
  "New offensive coordinator, first extended look at the scheme — give me the over on big plays.",
  "The home crowd and a veteran backup under center make this a comfortable spot.",
  "Watching the tape, the pass rush generated consistent pressure. That flips close games.",
  "I rarely chase preseason totals, but both offenses have been moving the ball in camp.",
];

const AVATAR = (seed: string) => `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;

async function main() {
  const season = await prisma.season.findFirst({ where: { isCurrent: true }, orderBy: { year: "desc" } });
  if (!season) throw new Error("No current season found — run the provider sync first.");

  const games = await prisma.game.findMany({
    where: { seasonId: season.id },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { scheduledAt: "asc" },
  });
  if (games.length === 0) throw new Error("No games in the database — run the provider sync first.");

  const now = new Date();
  const hofGame = games.find((game) => game.seasonType === "PRE" && game.status === "FINAL");
  const scheduledGames = games.filter((game) => game.status === "SCHEDULED" && game.scheduledAt > now);

  const levels = await prisma.level.findMany({ orderBy: { level: "asc" } });
  const achievements = await prisma.achievement.findMany();
  const byKey = (key: string) => achievements.find((achievement) => achievement.key === key);

  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const referralCodes = new Set<string>();
  const uniqueReferralCode = (username: string) => {
    const base = `${username.slice(0, 12)}-${rand(100, 999)}`.toUpperCase();
    if (referralCodes.has(base)) return uniqueReferralCode(`${username}${rand(1, 9)}`);
    referralCodes.add(base);
    return base;
  };

  // Round-robin the game pool so every game receives several community picks.
  const pickPool = [...scheduledGames].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()).slice(0, 24);
  const hofPickers = new Set<string>();
  const stats = { users: 0, predictions: 0, settled: 0, follows: 0 };

  for (const demo of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: demo.email } });
    if (existing) {
      console.log(`[traffic-seed] skip existing ${demo.email}`);
      continue;
    }

    const createdAt = new Date(now.getTime() - rand(3, 24) * 86_400_000);
    const user = await prisma.user.create({
      data: {
        email: demo.email,
        emailVerified: true,
        name: demo.displayName,
        passwordHash,
        role: "USER",
        status: "ACTIVE",
        createdAt,
      },
    });

    // Better Auth's email/password provider reads the password from the
    // Account table (providerId "credential"), NOT from User.passwordHash.
    // Without this row sign-in reports "Invalid email or password" even though
    // the scrypt hash above is byte-for-byte compatible with Better Auth.
    await prisma.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: passwordHash,
      },
    });

    const referralCode = uniqueReferralCode(demo.username);
    await prisma.profile.create({
      data: { userId: user.id, username: demo.username, displayName: demo.displayName, bio: demo.bio, location: demo.location, avatarUrl: AVATAR(demo.username), referralCode, createdAt },
    });
    await prisma.referral.create({ data: { userId: user.id, code: referralCode, clicks: rand(0, 14), createdAt } });
    await prisma.notificationPreference.create({ data: { userId: user.id } });

    const streak = rand(1, 9);
    await prisma.dailyStreak.create({
      data: {
        userId: user.id,
        currentStreak: streak,
        longestStreak: streak + rand(0, 4),
        lastActivityDate: new Date(now.getTime() - rand(0, 2) * 86_400_000),
        updatedAt: createdAt,
      },
    });

    const wallet = await prisma.wallet.create({ data: { userId: user.id, balance: 0, createdAt } });
    let balance = 0;
    const pushTransaction = (type: "SIGNUP_BONUS" | "REWARD", amount: number, description: string, refType: string, refId: string, at: Date) => {
      balance += amount;
      return prisma.walletTransaction.create({
        data: { walletId: wallet.id, type, amount, balanceAfter: balance, description, refType, refId, createdAt: at },
      });
    };
    await pushTransaction("SIGNUP_BONUS", 1000, "Welcome bonus", "account", user.id, createdAt);

    const predictionCount = Math.min(demo.picks, pickPool.length);
    const myGames = pickPool.filter((_, index) => index % USERS.length === USERS.indexOf(demo));
    const assignedGames = [...myGames];
    // Top up round-robin for users who ended up with fewer games.
    for (let index = 0; assignedGames.length < predictionCount; index++) {
      const candidate = pickPool[index % pickPool.length];
      if (!assignedGames.some((game) => game.id === candidate.id)) assignedGames.push(candidate);
    }

    let totalXp = 50; // accountCreated
    const grantedAchievements: string[] = [];
    let wins = 0;

    for (const game of assignedGames.slice(0, predictionCount)) {
      const marketRoll = rng();
      const marketType = marketRoll < 0.66 ? "MONEYLINE" : marketRoll < 0.88 ? "SPREAD" : "TOTAL";
      const homeFav = rng() < 0.6;
      const isHome = chance(50);
      const team = isHome ? game.homeTeam : game.awayTeam;
      const publishedAt = new Date(Math.min(now.getTime() - rand(0, 6) * 86_400_000, game.scheduledAt.getTime() - 86_400_000));

      let marketKey: string;
      let selection: string;
      let line: number | null = null;
      let oddsAtCreation: number;
      if (marketType === "MONEYLINE") {
        marketKey = isHome ? "h2h_home" : "h2h_away";
        selection = isHome ? "home" : "away";
        oddsAtCreation = homeFav ? rand(14, 24) / 10 : rand(24, 42) / 10;
      } else if (marketType === "SPREAD") {
        marketKey = isHome ? "spread_home" : "spread_away";
        selection = isHome ? "home" : "away";
        line = (chance(50) ? -1 : 1) * (rand(3, 14) / 2); // NFL spreads move in half-points
        oddsAtCreation = rand(187, 195) / 100;
      } else {
        const over = chance(55);
        marketKey = over ? "total_over" : "total_under";
        selection = over ? "over" : "under";
        line = rand(33, 46);
        oddsAtCreation = rand(187, 195) / 100;
      }

      const confidence = chance(25) ? "HIGH" : chance(60) ? "MEDIUM" : "LOW";
      const prediction = await prisma.prediction.create({
        data: {
          userId: user.id,
          gameId: game.id,
          marketType,
          marketKey,
          selection,
          line,
          oddsAtCreation,
          confidence,
          analysis: pick(ANALYSES),
          virtualUnits: rand(1, 3),
          status: "PENDING",
          isPublic: true,
          publishedAt,
          createdAt: publishedAt,
          views: rand(4, 90),
          likes: rand(0, 14),
        },
      });
      await pushTransaction("REWARD", 10, "Prediction published", "PREDICTION", prediction.id, publishedAt);
      totalXp += 10;
      stats.predictions++;
    }

    // Settled picks on the Hall of Fame game using the real provider result (CAR 33, ARI 30).
    if (hofGame && !hofPickers.has(user.id) && chance(65)) {
      hofPickers.add(user.id);
      const carPick = chance(55); // Carolina (away) won the game
      const marketType = chance(80) ? "MONEYLINE" : "SPREAD";
      const selection = marketType === "MONEYLINE" ? (carPick ? "away" : "home") : (chance(50) ? "away" : "home");
      const marketKey = marketType === "MONEYLINE"
        ? (selection === "home" ? "h2h_home" : "h2h_away")
        : (selection === "home" ? "spread_home" : "spread_away");
      const line = marketType === "SPREAD" ? (selection === "home" ? 2.5 : -2.5) : null;
      // Moneyline: CAR (away) won. Spread: CAR -2.5 covered a 3-point win; ARI +2.5 lost.
      const won = marketType === "MONEYLINE" ? carPick : selection === "away";
      const settledAt = new Date(hofGame.scheduledAt.getTime() + 4 * 3600_000);
      const publishedAt = new Date(hofGame.scheduledAt.getTime() - rand(1, 5) * 86_400_000);

      const prediction = await prisma.prediction.create({
        data: {
          userId: user.id,
          gameId: hofGame.id,
          marketType,
          marketKey,
          selection,
          line,
          oddsAtCreation: marketType === "MONEYLINE" ? rand(16, 30) / 10 : 1.91,
          confidence: "MEDIUM",
          analysis: pick(ANALYSES),
          virtualUnits: 1,
          status: "SETTLED",
          result: won ? "WIN" : "LOSS",
          isPublic: true,
          publishedAt,
          lockedAt: hofGame.scheduledAt,
          settledAt,
          createdAt: publishedAt,
          views: rand(8, 120),
          likes: rand(1, 18),
        },
      });
      await prisma.predictionSettlement.create({
        data: {
          predictionId: prediction.id,
          result: won ? "WIN" : "LOSS",
          settlementReason: `Final: Carolina Panthers ${hofGame.awayScore} – ${hofGame.homeScore} Arizona Cardinals`,
          settlementSource: "provider",
          settlementVersion: 1,
          settledAt,
        },
      });
      await pushTransaction("REWARD", won ? 25 : 0, won ? "Prediction won" : "Prediction settled as loss", "SETTLEMENT", prediction.id, settledAt);
      await prisma.gamificationEvent.create({
        data: {
          userId: user.id,
          type: won ? "PREDICTION_WON" : "PREDICTION_LOST",
          xpAwarded: won ? 25 : 0,
          coinsAwarded: won ? 25 : 0,
          metadata: { gameId: hofGame.id, marketType } as Prisma.InputJsonValue,
          refType: "PREDICTION",
          refId: prediction.id,
          createdAt: settledAt,
        },
      });
      if (won) wins++;
      totalXp += won ? 25 : 0;
      stats.settled++;
    }

    const unlocked = new Set<string>(["first-pick"]);
    if (streak >= 7) unlocked.add("streak-7");
    if (wins >= 3) unlocked.add("hot-hand");
    for (const key of unlocked) {
      const achievement = byKey(key);
      if (!achievement) continue;
      await prisma.userAchievement.create({
        data: { userId: user.id, achievementId: achievement.id, unlockedAt: createdAt },
      });
      totalXp += achievement.xpReward;
      if (achievement.coinReward > 0) {
        await pushTransaction("ACHIEVEMENT", achievement.coinReward, achievement.title, "ACHIEVEMENT", achievement.id, createdAt);
      }
      grantedAchievements.push(key);
    }

    const levelInfo = [...levels].reverse().find((level) => totalXp >= level.minXp) ?? levels[0]!;
    await prisma.userXP.create({
      data: { userId: user.id, totalXp, currentLevel: levelInfo.level, levelTitle: levelInfo.title, updatedAt: createdAt },
    });
    await prisma.wallet.update({ where: { id: wallet.id }, data: { balance } });
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "ACHIEVEMENT_UNLOCKED",
        title: `Achievement unlocked: ${grantedAchievements.join(", ")}`,
        body: "Keep picking to earn more rewards.",
        link: "/achievements",
        createdAt: now,
      },
    });

    stats.users++;
    console.log(`[traffic-seed] ${demo.username} (${user.id}) — ${predictionCount} pending, ${wins > 0 ? "settled" : ""}${grantedAchievements.length ? `, achievements: ${grantedAchievements.join(",")}` : ""}`);
  }

  // Follow graph: every user follows 2–6 others; a handful of follow-backs.
  const seededUsers = await prisma.user.findMany({ where: { email: { in: USERS.map((demo) => demo.email) } }, include: { profile: true } });
  for (const follower of seededUsers) {
    const targets = seededUsers.filter((candidate) => candidate.id !== follower.id);
    const count = rand(2, Math.min(6, targets.length));
    const shuffled = [...targets].sort(() => rng() - 0.5).slice(0, count);
    for (const target of shuffled) {
      if (chance(15)) continue; // leave a few non-follows for realism
      const existing = await prisma.userFollow.findUnique({
        where: { followerId_followingId: { followerId: follower.id, followingId: target.id } },
      });
      if (existing) continue;
      await prisma.userFollow.create({
        data: { followerId: follower.id, followingId: target.id, notifyOnPrediction: chance(70), createdAt: new Date(now.getTime() - rand(0, 12) * 86_400_000) },
      });
      if (chance(25)) {
        await prisma.notification.create({
          data: {
            userId: target.id,
            type: "NEW_FOLLOWER",
            title: `${follower.profile?.displayName ?? follower.name} started following you`,
            body: `@${follower.profile?.username} is following your picks.`,
            link: `/users/${follower.profile?.username}`,
            createdAt: now,
          },
        });
      }
      stats.follows++;
    }
  }

  console.log(`[traffic-seed] done — users: ${stats.users}, predictions: ${stats.predictions}, settled: ${stats.settled}, follows: ${stats.follows}`);
  console.log(`[traffic-seed] demo password for all accounts: ${DEMO_PASSWORD}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
