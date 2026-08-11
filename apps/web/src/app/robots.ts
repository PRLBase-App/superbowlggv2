import type { MetadataRoute } from "next";
import { brand } from "@sbgg/core";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/auth/", "/wallet", "/settings", "/notifications", "/referrals", "/go/"],
      },
    ],
    sitemap: `https://${brand.domain}/sitemap.xml`,
  };
}
