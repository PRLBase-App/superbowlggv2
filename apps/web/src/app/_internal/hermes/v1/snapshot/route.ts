import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { hermesErrorResponse, verifyHermesRequest } from "@/lib/hermes-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await verifyHermesRequest(request, "stats:read");
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [
      users,
      activeSessions,
      predictions,
      games,
      publishedArticles,
      featureFlags,
      adminEvents,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.session.findMany({
        where: { updatedAt: { gte: dayAgo } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.prediction.count(),
      prisma.game.count(),
      prisma.article.count({ where: { status: "PUBLISHED" } }),
      prisma.featureFlag.findMany({ orderBy: { key: "asc" } }),
      prisma.adminAuditLog.count({ where: { createdAt: { gte: dayAgo } } }),
    ]);

    return NextResponse.json(
      {
        health: "ok",
        service: "superbowl.gg",
        version: "2.0.0",
        captured_at: Math.floor(Date.now() / 1000),
        users: { total: users, active_last_24h: activeSessions.length },
        costs: { status: "unavailable", source: "not_connected" },
        predictions: { total: predictions, games_total: games },
        content: { published_articles: publishedArticles },
        seo: { status: "unavailable", source: "not_connected" },
        security_events: { status: "unavailable", source: "not_connected" },
        admin_events: { last_24h: adminEvents },
        feature_flags: Object.fromEntries(featureFlags.map((flag) => [flag.key, flag.enabled])),
        administration: {
          supported_actions: ["production.set_feature_flag"],
          mutations_require_control_plane_approval: true,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return hermesErrorResponse(error);
  }
}
