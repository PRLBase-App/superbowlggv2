import { NextResponse } from "next/server";
import { getPredictionOptions } from "@/lib/prediction-data";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const options = await getPredictionOptions(gameId);
  if (!options) {
    return NextResponse.json({ error: "Game not found", code: "GAME_NOT_FOUND" }, {
      status: 404,
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
  return NextResponse.json(options, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
