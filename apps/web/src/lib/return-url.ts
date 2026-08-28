const INTERNAL_ORIGIN = "https://superbowl.gg";

/**
 * Accept same-origin relative application paths only. This helper is shared by
 * every authentication completion path so no provider callback can become an
 * open redirect.
 */
export function safeReturnTo(value: string | null | undefined, fallback = "/predict"): string {
  if (!value || value.length > 2_048 || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || decoded.includes("\\")) return fallback;
    const url = new URL(value, INTERNAL_ORIGIN);
    if (url.origin !== INTERNAL_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function pickReturnTo(gameId: string, outcomeId: string): string {
  const params = new URLSearchParams({ game: gameId, outcome: outcomeId });
  return `/predict?${params.toString()}`;
}
