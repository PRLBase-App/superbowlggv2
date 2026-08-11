import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma, prisma, type PredictionMarket } from "@sbgg/db";
import { checkAchievements, grantXpAndCoins, recordDailyActivity } from "@sbgg/gamification";
import { xpDefaults } from "@sbgg/core";
import { getSession } from "@/lib/session";

const publishSchema = z.object({
  clientRequestId: z.string().uuid(),
  gameId: z.string().min(1).max(64),
  marketOutcomeId: z.string().min(1).max(64),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  analysis: z.string().trim().max(2_000).nullable().optional(),
  virtualUnits: z.coerce.number().min(0.5).max(10),
}).strict();

const MAX_ODDS_AGE_MS = 12 * 60 * 60 * 1_000;
const SUPPORTED_PROP_MARKETS = [
  "player_pass_yds",
  "player_pass_tds",
  "player_pass_interceptions",
  "player_rush_yds",
  "player_receptions",
  "player_reception_yds",
  "player_anytime_td",
] as const;

function normalize(value: string): string {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]/g, "");
}

function selectionForOutcome(
  marketKey: string,
  outcomeName: string,
  homeTeam: { name: string; abbreviation: string },
  awayTeam: { name: string; abbreviation: string },
): { marketType: PredictionMarket; selection: string; marketKey: string } | null {
  const outcome = normalize(outcomeName);
  const homeNames = [normalize(homeTeam.name), normalize(homeTeam.abbreviation)];
  const awayNames = [normalize(awayTeam.name), normalize(awayTeam.abbreviation)];
  if (marketKey === "h2h" || marketKey === "spreads") {
    const selection = homeNames.includes(outcome) ? "home" : awayNames.includes(outcome) ? "away" : null;
    if (!selection) return null;
    return {
      marketType: marketKey === "h2h" ? "MONEYLINE" : "SPREAD",
      selection,
      marketKey: `${marketKey}_${selection}`,
    };
  }
  if (marketKey === "totals") {
    const selection = outcome === "over" ? "over" : outcome === "under" ? "under" : null;
    return selection ? { marketType: "TOTAL", selection, marketKey: `${marketKey}_${selection}` } : null;
  }
  if ((SUPPORTED_PROP_MARKETS as readonly string[]).includes(marketKey)) {
    const selection = outcome === "over" ? "over" : outcome === "under" ? "under" : marketKey === "player_anytime_td" && outcome === "yes" ? "over" : null;
    return selection ? { marketType: "PLAYER_PROP", selection, marketKey } : null;
  }
  return null;
}

async function rewardPublication(userId: string, predictionId: string): Promise<void> {
  await grantXpAndCoins(
    userId,
    xpDefaults.predictionCreated,
    10,
    "REWARD",
    "Prediction published",
    { type: "prediction-created", id: predictionId },
  );
  await recordDailyActivity(userId);
  await checkAchievements(userId);
}

/** Publish from a server-owned, immutable provider snapshot. Browser-supplied odds are never accepted. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = publishSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid prediction", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const input = parsed.data;

  const prior = await prisma.prediction.findUnique({ where: { clientRequestId: input.clientRequestId } });
  if (prior) {
    if (prior.userId !== session.user.id) return NextResponse.json({ error: "Request ID is already in use" }, { status: 409 });
    await rewardPublication(session.user.id, prior.id);
    return NextResponse.json({ ok: true, id: prior.id, duplicate: true });
  }

  const outcome = await prisma.marketOutcome.findUnique({
    where: { id: input.marketOutcomeId },
    include: {
      market: {
        include: {
          bookmaker: true,
          game: { include: { homeTeam: true, awayTeam: true } },
        },
      },
    },
  });
  if (!outcome || outcome.market.gameId !== input.gameId) {
    return NextResponse.json({ error: "Market outcome not found" }, { status: 404 });
  }
  const { game, bookmaker } = outcome.market;
  const now = new Date();
  if (game.status !== "SCHEDULED" || game.scheduledAt <= now) {
    return NextResponse.json({ error: "This game has already started" }, { status: 409 });
  }
  if (!bookmaker || !outcome.providerOutcomeKey) {
    return NextResponse.json({ error: "This market has no verifiable provider source" }, { status: 409 });
  }

  const marketSelection = selectionForOutcome(
    outcome.market.key,
    outcome.name,
    game.homeTeam,
    game.awayTeam,
  );
  if (!marketSelection) return NextResponse.json({ error: "Unsupported market outcome" }, { status: 422 });

  const snapshot = await prisma.oddsSnapshot.findFirst({
    where: {
      gameId: game.id,
      bookmakerId: bookmaker.id,
      marketId: outcome.market.id,
      outcomeKey: outcome.providerOutcomeKey,
    },
    orderBy: { capturedAt: "desc" },
  });
  if (!snapshot) return NextResponse.json({ error: "No provider odds snapshot is available" }, { status: 409 });
  if (snapshot.capturedAt.getTime() > now.getTime() + 5 * 60 * 1_000
    || now.getTime() - snapshot.capturedAt.getTime() > MAX_ODDS_AGE_MS) {
    return NextResponse.json({ error: "The latest provider odds are stale; try again after the next sync" }, { status: 409 });
  }

  let playerId: string | null = null;
  if (marketSelection.marketType === "PLAYER_PROP") {
    if (!outcome.description) return NextResponse.json({ error: "Player identity is missing from this market" }, { status: 409 });
    const players = await prisma.player.findMany({
      where: { teamId: { in: [game.homeTeamId, game.awayTeamId] } },
      select: { id: true, name: true },
    });
    const description = normalize(outcome.description);
    playerId = players.find((player) => normalize(player.name) === description)?.id ?? null;
    if (!playerId) return NextResponse.json({ error: "Player identity could not be verified" }, { status: 409 });
  }

  let prediction;
  try {
    prediction = await prisma.prediction.create({
      data: {
        clientRequestId: input.clientRequestId,
        userId: session.user.id,
        gameId: game.id,
        playerId,
        marketType: marketSelection.marketType,
        marketKey: marketSelection.marketKey,
        selection: marketSelection.selection,
        line: snapshot.line,
        oddsAtCreation: snapshot.price,
        marketOutcomeId: outcome.id,
        oddsSnapshotId: snapshot.id,
        bookmakerKey: bookmaker.key,
        oddsProvider: "the-odds-api",
        oddsCapturedAt: snapshot.capturedAt,
        sportsbookReference: bookmaker.name,
        confidence: input.confidence,
        analysis: input.analysis || null,
        virtualUnits: input.virtualUnits,
        status: "PENDING",
        publishedAt: now,
      },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") throw error;
    const concurrent = await prisma.prediction.findUnique({ where: { clientRequestId: input.clientRequestId } });
    if (!concurrent || concurrent.userId !== session.user.id) throw error;
    prediction = concurrent;
  }

  await rewardPublication(session.user.id, prediction.id);
  return NextResponse.json({ ok: true, id: prediction.id }, { status: 201 });
}
