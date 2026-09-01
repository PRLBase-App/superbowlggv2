import { NextResponse } from "next/server";
import { prisma } from "@sbgg/db";
import {
  newHermesActionId,
  parseHermesAction,
  publicHermesAction,
} from "@/lib/hermes-actions";
import {
  HermesRequestError,
  hermesErrorResponse,
  verifyHermesRequest,
} from "@/lib/hermes-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    await verifyHermesRequest(request, "actions:execute", rawBody);
    const { action, parameters, idempotencyKey } = parseHermesAction(rawBody, true);

    const existing = await prisma.hermesProjectAction.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      const existingParameters = JSON.stringify(existing.parameters);
      const requestedParameters = JSON.stringify(parameters);
      if (existing.action !== action || existingParameters !== requestedParameters) {
        throw new HermesRequestError(409, "Idempotency key was already used for another request");
      }
      return NextResponse.json(publicHermesAction(existing, true));
    }

    const actionId = newHermesActionId();
    const result = await prisma.$transaction(async (tx) => {
      await tx.hermesProjectAction.create({
        data: {
          id: actionId,
          idempotencyKey,
          action,
          parameters,
          status: "executing",
        },
      });
      await tx.featureFlag.upsert({
        where: { key: parameters.key },
        update: { enabled: parameters.enabled },
        create: { key: parameters.key, enabled: parameters.enabled },
      });
      return tx.hermesProjectAction.update({
        where: { id: actionId },
        data: {
          status: "executed",
          result: { key: parameters.key, enabled: parameters.enabled, updated: true },
        },
      });
    });
    return NextResponse.json(publicHermesAction(result));
  } catch (error) {
    return hermesErrorResponse(error);
  }
}
