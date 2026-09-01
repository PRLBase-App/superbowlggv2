import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import { publicHermesAction } from "@/lib/hermes-actions";
import {
  HermesRequestError,
  hermesErrorResponse,
  verifyHermesRequest,
} from "@/lib/hermes-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyHermesRequest(request, "actions:execute");
    const { id } = await params;
    if (!/^act_[0-9a-f]{24}$/.test(id)) {
      throw new HermesRequestError(404, "Action not found");
    }
    const record = await prisma.hermesProjectAction.findUnique({ where: { id } });
    if (!record) throw new HermesRequestError(404, "Action not found");
    return NextResponse.json(publicHermesAction(record));
  } catch (error) {
    return hermesErrorResponse(error);
  }
}
