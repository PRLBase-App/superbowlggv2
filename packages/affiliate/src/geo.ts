/**
 * Geo compliance for affiliate offers — pure logic, unit-testable.
 */

export interface GeoRule {
  allowedCountries?: string[]; // ISO-3166 alpha-2, e.g. ["US"]
  blockedCountries?: string[];
  allowedRegions?: string[]; // e.g. ["US-CA"]
  blockedRegions?: string[];
  minimumAge?: number;
  invalid?: boolean;
}

export interface VisitorContext {
  country?: string | null;
  region?: string | null; // e.g. "US-NY"
  age?: number | null;
}

export function isOfferAllowed(rule: GeoRule | null | undefined, visitor: VisitorContext): { allowed: boolean; reason?: string } {
  if (!rule) return { allowed: true };
  if (rule.invalid) return { allowed: false, reason: "Offer restrictions are invalid" };
  const country = visitor.country?.toUpperCase() ?? null;
  const region = visitor.region?.toUpperCase() ?? null;

  if (rule.allowedCountries?.length && !country) return { allowed: false, reason: "Country could not be verified" };
  if (rule.allowedRegions?.length && !region) return { allowed: false, reason: "Region could not be verified" };
  if (rule.minimumAge && visitor.age == null) return { allowed: false, reason: `Age ${rule.minimumAge}+ could not be verified` };

  if (rule.blockedCountries && country && rule.blockedCountries.includes(country)) {
    return { allowed: false, reason: `Restricted country: ${country}` };
  }
  if (rule.blockedRegions && region && rule.blockedRegions.includes(region)) {
    return { allowed: false, reason: `Restricted region: ${region}` };
  }
  if (rule.allowedCountries && country && !rule.allowedCountries.includes(country)) {
    return { allowed: false, reason: `Not available in ${country}` };
  }
  if (rule.allowedRegions && region && !rule.allowedRegions.includes(region)) {
    return { allowed: false, reason: `Not available in region ${region}` };
  }
  if (rule.minimumAge && visitor.age != null && visitor.age < rule.minimumAge) {
    return { allowed: false, reason: `Must be ${rule.minimumAge}+` };
  }
  return { allowed: true };
}

export function parseGeoRestrictions(json: string | null): GeoRule | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return { invalid: true };
    const value = parsed as Record<string, unknown>;
    const arrays = ["allowedCountries", "blockedCountries", "allowedRegions", "blockedRegions"] as const;
    for (const key of arrays) {
      if (value[key] !== undefined && (!Array.isArray(value[key]) || !(value[key] as unknown[]).every((entry) => typeof entry === "string"))) {
        return { invalid: true };
      }
    }
    if (value.minimumAge !== undefined && (typeof value.minimumAge !== "number" || !Number.isFinite(value.minimumAge))) return { invalid: true };
    return {
      allowedCountries: (value.allowedCountries as string[] | undefined)?.map((entry) => entry.toUpperCase()),
      blockedCountries: (value.blockedCountries as string[] | undefined)?.map((entry) => entry.toUpperCase()),
      allowedRegions: (value.allowedRegions as string[] | undefined)?.map((entry) => entry.toUpperCase()),
      blockedRegions: (value.blockedRegions as string[] | undefined)?.map((entry) => entry.toUpperCase()),
      minimumAge: value.minimumAge as number | undefined,
    };
  } catch {
    return { invalid: true };
  }
}
