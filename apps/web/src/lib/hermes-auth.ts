import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@sbgg/db";

const NONCE_RE = /^[A-Za-z0-9_-]{24,128}$/;
const SIGNATURE_RE = /^[0-9a-f]{64}$/;
const MAX_SKEW_MS = 60_000;

export class HermesRequestError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HermesRequestError";
    this.status = status;
  }
}

export async function verifyHermesRequest(
  request: Request,
  expectedScope: string,
  rawBody = "",
): Promise<void> {
  const secret = process.env.HERMES_PROJECT_SUPERBOWL_HMAC ?? "";
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new HermesRequestError(503, "Hermes project HMAC secret is not configured");
  }
  if (Buffer.byteLength(rawBody, "utf8") > 64 * 1024) {
    throw new HermesRequestError(413, "Hermes request body is too large");
  }

  const service = request.headers.get("x-hermes-service") ?? "";
  const timestamp = request.headers.get("x-hermes-timestamp") ?? "";
  const nonce = request.headers.get("x-hermes-nonce") ?? "";
  const scope = request.headers.get("x-hermes-scope") ?? "";
  const supplied = request.headers.get("x-hermes-signature") ?? "";
  if (service !== "control-plane" || scope !== expectedScope) {
    throw new HermesRequestError(403, "Hermes service or scope is not allowed");
  }
  if (!/^\d{10}$/.test(timestamp) || !NONCE_RE.test(nonce) || !SIGNATURE_RE.test(supplied)) {
    throw new HermesRequestError(401, "Malformed signed Hermes headers");
  }
  const signedAt = Number(timestamp) * 1000;
  if (!Number.isSafeInteger(signedAt) || Math.abs(Date.now() - signedAt) > MAX_SKEW_MS) {
    throw new HermesRequestError(401, "Stale signed Hermes request");
  }

  const path = new URL(request.url).pathname;
  const bodyHash = createHash("sha256").update(rawBody, "utf8").digest("hex");
  const canonical = [request.method.toUpperCase(), path, timestamp, nonce, scope, bodyHash].join("\n");
  const expected = createHmac("sha256", secret).update(canonical).digest();
  const actual = Buffer.from(supplied, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(expected, actual)) {
    throw new HermesRequestError(401, "Invalid Hermes signature");
  }

  // Store the nonce only after signature verification. The database unique
  // constraint enforces replay protection across server processes/replicas.
  try {
    await prisma.$transaction([
      prisma.hermesRequestNonce.deleteMany({
        where: { seenAt: { lt: new Date(Date.now() - MAX_SKEW_MS * 2) } },
      }),
      prisma.hermesRequestNonce.create({ data: { service, nonce } }),
    ]);
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      throw new HermesRequestError(409, "Replayed Hermes nonce");
    }
    throw new HermesRequestError(503, "Hermes replay store is unavailable");
  }
}

export function hermesErrorResponse(error: unknown): Response {
  if (error instanceof HermesRequestError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: "Internal Hermes endpoint failure" }, { status: 500 });
}
