import { NextResponse } from "next/server";
import { Prisma, prisma } from "@sbgg/db";
import { checkAchievements, grantXpAndCoins, recordDailyActivity } from "@sbgg/gamification";
import { xpDefaults } from "@sbgg/core";
import { getSession } from "@/lib/session";
import { isFreshOdds, normalizeOutcome, selectionForOutcome } from "@/lib/prediction-options";
import { predictionPublishSchema } from "@/lib/prediction-payload";
import { publicationDecision } from "@/lib/prediction-publication";

function apiError(error: string, code: string, status: number, details?: unknown) {
  return NextResponse.json({ error, code, ...(details ? { details } : {}) }, { status });
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
  if (!session?.user) return apiError("Sign in to publish this pick.", "AUTH_REQUIRED", 401);

  const parsed = predictionPublishSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return apiError("Check the prediction details and try again.", "INVALID_PREDICTION", 400, parsed.error.flatten().fieldErrors);
  }
  const input = parsed.data;

  const prior = await prisma.prediction.findUnique({ where: { clientRequestId: input.clientRequestId } });
  if (prior) {
    if (publicationDecision(prior.userId, session.user.id) === "CONFLICT") return apiError("This publish request cannot be reused.", "REQUEST_CONFLICT", 409);
    await rewardPublication(session.user.id, prior.id);
    return NextResponse.json({ ok: true, id: prior.id, duplicate: true });
  }

  if (input.source === "COMMUNITY") {
    const game = await prisma.game.findUnique({ where: { id: input.gameId } });
    if (!game) return apiError("Game not found.", "GAME_NOT_FOUND", 404);
    const now = new Date();
    if (game.status !== "SCHEDULED" || game.scheduledAt <= now) {
      return apiError("This game has started and picks are closed.", "GAME_STARTED", 409);
    }
    const player = await prisma.player.findUnique({ where: { id: input.playerId }, select: { id: true, teamId: true } });
    if (!player || !player.teamId || ![game.homeTeamId, game.awayTeamId].includes(player.teamId)) {
      return apiError("Choose a verified player from one of these teams.", "PLAYER_UNVERIFIED", 409);
    }
    const mapping = await prisma.providerEntityMapping.findFirst({
      where: { entityType: "PLAYER", entityId: player.id },
      select: { id: true },
    });
    if (!mapping) return apiError("Choose a verified player from one of these teams.", "PLAYER_UNVERIFIED", 409);

    let prediction;
    try {
      prediction = await prisma.prediction.create({
        data: {
          clientRequestId: input.clientRequestId,
          userId: session.user.id,
          gameId: game.id,
          playerId: player.id,
          source: "COMMUNITY",
          marketType: "PLAYER_PROP",
          marketKey: input.statKey,
          selection: input.selection,
          line: input.line,
          oddsAtCreation: null,
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
    return apiError("That outcome is no longer available. Choose a current option.", "OUTCOME_NOT_FOUND", 404);
  }
  const { game, bookmaker } = outcome.market;
  const now = new Date();
  if (game.status !== "SCHEDULED" || game.scheduledAt <= now) {
    return apiError("This game has started and picks are closed.", "GAME_STARTED", 409);
  }
  if (!outcome.market.active || !bookmaker?.active || !outcome.providerOutcomeKey) {
    return apiError("This market is no longer available from a verified provider.", "MARKET_UNAVAILABLE", 409);
  }

  const marketSelection = selectionForOutcome(
    outcome.market.key,
    outcome.name,
    game.homeTeam,
    game.awayTeam,
  );
  if (!marketSelection) return apiError("This outcome is not supported for predictions.", "INVALID_SELECTION", 422);

  const snapshot = await prisma.oddsSnapshot.findFirst({
    where: {
      gameId: game.id,
      bookmakerId: bookmaker.id,
      marketId: outcome.market.id,
      outcomeKey: outcome.providerOutcomeKey,
    },
    orderBy: { capturedAt: "desc" },
  });
  if (!snapshot) return apiError("Verified odds are not available yet.", "ODDS_UNAVAILABLE", 409);
  if (!isFreshOdds(snapshot.capturedAt, now)) {
    return apiError("These odds have expired. Refresh the picks and choose again.", "ODDS_STALE", 409);
  }

  let playerId: string | null = null;
  if (marketSelection.marketType === "PLAYER_PROP") {
    if (!outcome.description) return apiError("The player for this market could not be verified.", "PLAYER_UNVERIFIED", 409);
    const players = await prisma.player.findMany({
      where: { teamId: { in: [game.homeTeamId, game.awayTeamId] } },
      select: { id: true, name: true },
    });
    const description = normalizeOutcome(outcome.description);
    playerId = players.find((player) => normalizeOutcome(player.name) === description)?.id ?? null;
    if (!playerId) return apiError("The player for this market could not be verified.", "PLAYER_UNVERIFIED", 409);
  }

  let prediction;
  try {
    prediction = await prisma.prediction.create({
      data: {
        clientRequestId: input.clientRequestId,
        userId: session.user.id,
        gameId: game.id,
        playerId,
        source: "PROVIDER",
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
