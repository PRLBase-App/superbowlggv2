import { z } from "zod";

const emptyToUndefined = (value: unknown) => typeof value === "string" && value.trim() === "" ? undefined : value;
const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());

/**
 * Server-side environment configuration. Every value is validated at boot.
 * NEVER import NEXT_PUBLIC_* secrets here — they must never hold provider keys.
 */
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: optionalString,
  APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32),
  AUTH_BETTER_SECRET: z.string().min(32),
  EMAIL_FROM: z.string().min(3).default("Superbowl <noreply@superbowl.gg>"),
  RESEND_API_KEY: optionalString,
  SPORTS_DATA_PROVIDER: z.enum(["nflverse", "api-sports"]).default("nflverse"),
  API_SPORTS_KEY: optionalString,
  API_SPORTS_BASE_URL: z.string().url().default("https://v1.american-football.api-sports.io"),
  API_SPORTS_SEASON: z.preprocess(emptyToUndefined, z.coerce.number().int().min(2000).max(2100).optional()),
  THE_ODDS_API_KEY: optionalString,
  THE_ODDS_API_BASE_URL: z.string().url().default("https://api.the-odds-api.com/v4"),
  SEMRUSH_API_KEY: optionalString,
  SEMRUSH_MCP_URL: z.string().url().default("https://mcp.semrush.com/v2/mcp"),
  SEMRUSH_DATABASE: z.string().default("us"),
  SEMRUSH_COUNTRY: z.string().default("US"),
  SEMRUSH_RESEARCH_ENABLED: z.string().default("true"),
  SEMRUSH_MAX_UNITS_PER_RUN: z.coerce.number().int().min(1).max(1_000).default(100),
  SEMRUSH_CACHE_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  ADMIN_EMAIL: optionalEmail,
  STORAGE_ENDPOINT: optionalUrl,
  STORAGE_REGION: optionalString,
  STORAGE_BUCKET: optionalString,
  STORAGE_ACCESS_KEY_ID: optionalString,
  STORAGE_SECRET_ACCESS_KEY: optionalString,
  GEOIP_PROVIDER: z.enum(["none", "maxmind"]).default("none"),
  GEOIP_API_KEY: optionalString,
  AI_PROVIDER: z.enum(["none", "openai", "anthropic"]).default("none"),
  AI_API_KEY: optionalString,
}).superRefine((configuration, context) => {
  if (configuration.NODE_ENV === "production") {
    const appUrl = new URL(configuration.APP_URL);
    if (appUrl.protocol !== "https:" || appUrl.hostname === "localhost") {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["APP_URL"], message: "Production APP_URL must be a public HTTPS URL" });
    }
  }
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function loadEnv(env: NodeJS.ProcessEnv = process.env): ServerEnv {
  const parsed = serverEnvSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${issues}`);
  }
  return parsed.data;
}

let cached: ServerEnv | undefined;
export function env(): ServerEnv {
  if (!cached) cached = loadEnv();
  return cached;
}

export const publicEnv = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ?? "Superbowl",
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
