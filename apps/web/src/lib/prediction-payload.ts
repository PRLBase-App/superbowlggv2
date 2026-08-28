import { communityStatKeySchema, isValidCommunityLine } from "@sbgg/core";
import { z } from "zod";

const commonPublish = {
  clientRequestId: z.string().uuid(),
  gameId: z.string().min(1).max(64),
  confidence: z.enum(["LOW", "MEDIUM", "HIGH"]),
  analysis: z.string().trim().max(2_000).nullable().optional(),
  virtualUnits: z.coerce.number().min(0.5).max(10),
} as const;

export const providerPredictionPublishSchema = z.object({
  ...commonPublish,
  source: z.literal("PROVIDER").optional(),
  marketOutcomeId: z.string().min(1).max(64),
}).strict();

export const communityPredictionPublishSchema = z.object({
  ...commonPublish,
  source: z.literal("COMMUNITY"),
  playerId: z.string().min(1).max(64),
  statKey: communityStatKeySchema,
  selection: z.enum(["over", "under"]),
  line: z.number().finite(),
}).strict().superRefine((input, context) => {
  if (!isValidCommunityLine(input.statKey, input.line)) {
    context.addIssue({ code: "custom", path: ["line"], message: "Line must be an allowed half-step for this statistic" });
  }
});

export const predictionPublishSchema = z.union([communityPredictionPublishSchema, providerPredictionPublishSchema]);
