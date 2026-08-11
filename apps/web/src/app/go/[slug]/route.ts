import { NextResponse } from "next/server";
import { recordAffiliateClick } from "@sbgg/affiliate";
import { getSessionUser } from "@/lib/session";
import { env } from "@sbgg/core";

/**
 * /go/[slug] — affiliate redirect. Records the click (with geo/utm/device),
 * then 302s to the partner destination. Geo-blocked offers get a notice page.
 */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(req.url);
  const user = await getSessionUser();

  const country = req.headers.get("cf-ipcountry")
    ?? req.headers.get("x-vercel-ip-country")
    ?? req.headers.get("x-country-code")
    ?? undefined;
  const regionCode = req.headers.get("cf-region-code") ?? req.headers.get("x-vercel-ip-country-region") ?? undefined;
  const result = await recordAffiliateClick({
    offerSlug: slug,
    visitor: { country, region: country && regionCode ? `${country}-${regionCode}` : undefined, age: null },
    userId: user?.id,
    sessionId: url.searchParams.get("s") ?? undefined,
    referrer: req.headers.get("referer") ?? undefined,
    utm: {
      source: url.searchParams.get("utm_source") ?? undefined,
      medium: url.searchParams.get("utm_medium") ?? undefined,
      campaign: url.searchParams.get("utm_campaign") ?? undefined,
    },
    device: /mobile|android|iphone/i.test(req.headers.get("user-agent") ?? "") ? "mobile" : "desktop",
  });

  if (!result) {
    return NextResponse.redirect(new URL("/marketplace", env().APP_URL), 302);
  }
  if (!result.allowed) {
    // geo-restricted: show notice instead of redirecting
    const notice = new URL("/offer-restricted", env().APP_URL);
    notice.searchParams.set("offer", slug);
    notice.searchParams.set("reason", result.reason ?? "restricted");
    return NextResponse.redirect(notice, 302);
  }
  return NextResponse.redirect(result.destinationUrl, 302);
}
