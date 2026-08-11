import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";

export async function GET(_req: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = await prisma.game.findUnique({ where: { id: gameId }, select: { status: true, quarter: true, clock: true, homeScore: true, awayScore: true } });
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(game);
}
