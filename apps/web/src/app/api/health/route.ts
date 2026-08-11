import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { env } from "@sbgg/core";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const configuration = env();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      integrations: {
        sports: Boolean(configuration.API_SPORTS_KEY),
        odds: Boolean(configuration.THE_ODDS_API_KEY),
        email: Boolean(configuration.RESEND_API_KEY),
        semrush: Boolean(configuration.SEMRUSH_API_KEY && configuration.SEMRUSH_RESEARCH_ENABLED === "true"),
      },
      revision: process.env.RAILWAY_GIT_COMMIT_SHA ?? null,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "error", database: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
