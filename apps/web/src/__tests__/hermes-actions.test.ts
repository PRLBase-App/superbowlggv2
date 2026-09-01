import { describe, expect, it } from "vitest";
import { parseHermesAction } from "../lib/hermes-actions";

describe("Hermes project actions", () => {
  it("accepts only the explicitly supported production mutation", () => {
    const parsed = parseHermesAction(
      JSON.stringify({
        action: "production.set_feature_flag",
        idempotency_key: "request-0001",
        parameters: { key: "predictions.open", enabled: false },
      }),
      true,
    );
    expect(parsed.parameters).toEqual({ key: "predictions.open", enabled: false });
  });

  it("fails closed for unknown actions, coercions, and missing idempotency", () => {
    expect(() =>
      parseHermesAction(JSON.stringify({ action: "delete_everything", parameters: {} }), false),
    ).toThrow("Unsupported superbowl.gg action");
    expect(() =>
      parseHermesAction(
        JSON.stringify({
          action: "production.set_feature_flag",
          parameters: { key: "predictions.open", enabled: "false" },
        }),
        false,
      ),
    ).toThrow("Feature flag parameters");
    expect(() =>
      parseHermesAction(
        JSON.stringify({
          action: "production.set_feature_flag",
          parameters: { key: "predictions.open", enabled: false },
        }),
        true,
      ),
    ).toThrow("idempotency_key");
  });
});
