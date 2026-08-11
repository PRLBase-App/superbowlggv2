import { createHash, createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyTelegramPayload, type TelegramLoginPayload } from "./telegram";

const token = "123456:test-bot-token-for-signature-verification";

function signedPayload(overrides: TelegramLoginPayload = {}): TelegramLoginPayload {
  const payload: TelegramLoginPayload = {
    id: 42,
    first_name: "Pat",
    username: "pat_nfl",
    auth_date: 1_700_000_000,
    ...overrides,
  };
  const dataCheckString = Object.entries(payload)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join("\n");
  const secret = createHash("sha256").update(token).digest();
  return { ...payload, hash: createHmac("sha256", secret).update(dataCheckString).digest("hex") };
}

describe("verifyTelegramPayload", () => {
  it("accepts a fresh payload signed by the configured bot", () => {
    expect(verifyTelegramPayload(signedPayload(), token, 1_700_000_100)).toMatchObject({ id: "42", username: "pat_nfl" });
  });

  it("rejects tampered and stale payloads", () => {
    expect(verifyTelegramPayload({ ...signedPayload(), first_name: "Mallory" }, token, 1_700_000_100)).toBeNull();
    expect(verifyTelegramPayload(signedPayload(), token, 1_700_001_000)).toBeNull();
  });
});
