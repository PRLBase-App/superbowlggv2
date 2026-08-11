import { env } from "@sbgg/core";
import type { OddsProvider } from "./types";
import { TheOddsApiProvider } from "./providers/theoddsapi";

let instance: OddsProvider | null = null;

export class OddsProviderConfigurationError extends Error {
  constructor() {
    super("Odds are unavailable because THE_ODDS_API_KEY is not configured");
    this.name = "OddsProviderConfigurationError";
  }
}

export function getOddsProvider(): OddsProvider {
  if (instance) return instance;
  const configuration = env();
  if (!configuration.THE_ODDS_API_KEY) throw new OddsProviderConfigurationError();
  instance = new TheOddsApiProvider(configuration.THE_ODDS_API_KEY, configuration.THE_ODDS_API_BASE_URL);
  return instance;
}

export * from "./types";
export { TheOddsApiProvider } from "./providers/theoddsapi";
