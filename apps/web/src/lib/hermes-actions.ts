import { randomBytes } from "node:crypto";
import { HermesRequestError } from "@/lib/hermes-auth";

const IDEMPOTENCY_RE = /^[A-Za-z0-9._:-]{8,200}$/;
const FLAG_RE = /^[A-Za-z][A-Za-z0-9._-]{1,99}$/;

export interface ParsedHermesAction {
  action: "production.set_feature_flag";
  parameters: { key: string; enabled: boolean };
  idempotencyKey: string;
}

export function parseHermesAction(rawBody: string, requireIdempotency: boolean): ParsedHermesAction {
  let value: unknown;
  try {
    value = JSON.parse(rawBody || "{}");
  } catch {
    throw new HermesRequestError(400, "Request body must be valid JSON");
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HermesRequestError(400, "Request body must be a JSON object");
  }
  const body = value as Record<string, unknown>;
  if (body.action !== "production.set_feature_flag") {
    throw new HermesRequestError(422, "Unsupported superbowl.gg action");
  }
  if (!body.parameters || typeof body.parameters !== "object" || Array.isArray(body.parameters)) {
    throw new HermesRequestError(422, "Action parameters must be an object");
  }
  const parameters = body.parameters as Record<string, unknown>;
  if (
    Object.keys(parameters).some((key) => !["key", "enabled"].includes(key)) ||
    typeof parameters.key !== "string" ||
    !FLAG_RE.test(parameters.key) ||
    typeof parameters.enabled !== "boolean"
  ) {
    throw new HermesRequestError(422, "Feature flag parameters must be {key, enabled}");
  }
  const idempotencyKey = body.idempotency_key ?? "";
  if (
    requireIdempotency &&
    (typeof idempotencyKey !== "string" || !IDEMPOTENCY_RE.test(idempotencyKey))
  ) {
    throw new HermesRequestError(422, "A valid idempotency_key is required");
  }
  return {
    action: "production.set_feature_flag",
    parameters: { key: parameters.key, enabled: parameters.enabled },
    idempotencyKey: String(idempotencyKey),
  };
}

export function newHermesActionId(): string {
  return `act_${randomBytes(12).toString("hex")}`;
}

export function publicHermesAction(
  record: {
    id: string;
    action: string;
    status: string;
    result: unknown;
    updatedAt: Date;
  },
  replayed = false,
): Record<string, unknown> {
  return {
    id: record.id,
    action: record.action,
    status: record.status,
    executed_at: Math.floor(record.updatedAt.getTime() / 1000),
    result: record.result,
    replayed,
  };
}
