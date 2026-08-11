import { env } from "@sbgg/core";
import type { SportsProvider } from "./types";
import { ApiSportsProvider } from "./providers/api-sports";
import { NflverseProvider } from "./providers/nflverse";

let instance: SportsProvider | null = null;

export class SportsProviderConfigurationError extends Error {
  constructor(message = "NFL data provider is not configured") {
    super(message);
    this.name = "SportsProviderConfigurationError";
  }
}

/** Return the configured real provider. Generated-data fallbacks are forbidden. */
export function getSportsProvider(): SportsProvider {
  if (instance) return instance;
  const configuration = env();
  if (configuration.SPORTS_DATA_PROVIDER === "nflverse") {
    instance = new NflverseProvider();
    return instance;
  }
  if (!configuration.API_SPORTS_KEY) {
    throw new SportsProviderConfigurationError("API_SPORTS_KEY is required when SPORTS_DATA_PROVIDER=api-sports");
  }
  instance = new ApiSportsProvider(configuration.API_SPORTS_KEY, configuration.API_SPORTS_BASE_URL, configuration.API_SPORTS_SEASON);
  return instance;
}

export function providerName(): "nflverse" | "api-sports" | "unconfigured" {
  const configuration = env();
  if (configuration.SPORTS_DATA_PROVIDER === "nflverse") return "nflverse";
  return configuration.API_SPORTS_KEY ? "api-sports" : "unconfigured";
}

export * from "./types";
export { ApiSportsProvider } from "./providers/api-sports";
export { NflverseProvider } from "./providers/nflverse";
