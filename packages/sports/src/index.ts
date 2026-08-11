import { env } from "@sbgg/core";
import type { SportsProvider } from "./types";
import { ApiSportsProvider } from "./providers/api-sports";

let instance: SportsProvider | null = null;

export class SportsProviderConfigurationError extends Error {
  constructor() {
    super("NFL data is unavailable because API_SPORTS_KEY is not configured");
    this.name = "SportsProviderConfigurationError";
  }
}

/** Return the configured real provider. Generated-data fallbacks are forbidden. */
export function getSportsProvider(): SportsProvider {
  if (instance) return instance;
  const configuration = env();
  if (!configuration.API_SPORTS_KEY) throw new SportsProviderConfigurationError();
  instance = new ApiSportsProvider(configuration.API_SPORTS_KEY, configuration.API_SPORTS_BASE_URL, configuration.API_SPORTS_SEASON);
  return instance;
}

export function providerName(): "api-sports" | "unconfigured" {
  return env().API_SPORTS_KEY ? "api-sports" : "unconfigured";
}

export * from "./types";
export { ApiSportsProvider } from "./providers/api-sports";
