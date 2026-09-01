import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { parseHermesAction } from "@/lib/hermes-actions";
import { hermesErrorResponse, verifyHermesRequest } from "@/lib/hermes-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    await verifyHermesRequest(request, "actions:preview", rawBody);
    const { action, parameters } = parseHermesAction(rawBody, false);
    const current = await prisma.featureFlag.findUnique({ where: { key: parameters.key } });
    return NextResponse.json({
      action,
      before: current
        ? { key: current.key, enabled: current.enabled, exists: true }
        : { key: parameters.key, exists: false },
      after: parameters,
      risk: "production",
    });
  } catch (error) {
    return hermesErrorResponse(error);
  }
}
