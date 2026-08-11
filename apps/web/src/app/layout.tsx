import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter, Oswald } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { SiteHeader } from "@/components/header";
import { SiteFooter } from "@/components/footer";
import { GoogleAnalyticsPageView } from "@/components/google-analytics-page-view";
import { getSessionUser } from "@/lib/session";
import { brand, env } from "@sbgg/core";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-display" });

const HUB_CANONICAL_PATHS = new Set([
  "/", "/games", "/predictions", "/marketplace", "/achievements", "/how-it-works",
  "/nfl", "/nfl/schedule", "/nfl/scores", "/nfl/standings", "/nfl/predictions", "/nfl/stats",
  "/nfl/news", "/nfl/teams", "/nfl/players", "/nfl/injuries", "/nfl/playoffs", "/nfl/power-rankings",
  "/super-bowl", "/super-bowl/predictions", "/super-bowl/odds", "/super-bowl/schedule",
  "/super-bowl/history", "/super-bowl/winners", "/super-bowl/mvp", "/super-bowl/records",
  "/super-bowl/locations", "/super-bowl/stadiums", "/affiliate-disclosure", "/responsible-gaming",
  "/privacy", "/terms",
]);

export const metadata: Metadata = {
  metadataBase: new URL(`https://${brand.domain}`),
  title: {
    default: "NFL Predictions, News, Stats & Super Bowl Odds",
    template: "%s",
  },
  description:
    "American football prediction platform. NFL picks, predictions, odds, standings, player stats, community leaderboards and Super Bowl analysis.",
  keywords: ["NFL predictions", "NFL picks", "Super Bowl", "NFL odds", "NFL schedule", "NFL scores", "American football predictions"],
  openGraph: {
    type: "website",
    siteName: "Superbowl.gg",
    title: "NFL Predictions, News, Stats & Super Bowl Odds",
    description: "Predict football. Build your record. Beat the crowd.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NFL Predictions, News, Stats & Super Bowl Odds",
    description: "Predict football. Build your record. Beat the crowd.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#131520",
  width: "device-width",
  initialScale: 1,
};

// Session-aware pages are runtime-rendered. Declaring this explicitly prevents
// Next's production build from probing PostgreSQL while assembling the image.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, requestHeaders] = await Promise.all([getSessionUser(), headers()]);
  const googleAnalyticsId = env().GOOGLE_ANALYTICS_ID;
  const pathname = requestHeaders.get("x-sbgg-pathname") ?? "";
  const canonical = HUB_CANONICAL_PATHS.has(pathname) ? `https://${brand.domain}${pathname}` : null;
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Superbowl",
    url: `https://${brand.domain}`,
    sameAs: ["https://x.com/superbowldotgg"],
  };
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <head>
        {canonical ? <link rel="canonical" href={canonical} /> : null}
        {googleAnalyticsId ? <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} /> : null}
        {googleAnalyticsId ? <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAnalyticsId}');` }} /> : null}
      </head>
      <body className="min-h-screen bg-brand-bg text-brand-text">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        {googleAnalyticsId ? <Suspense fallback={null}><GoogleAnalyticsPageView measurementId={googleAnalyticsId} /></Suspense> : null}
        <SiteHeader user={user} />
        <main className="mx-auto min-h-[60vh] max-w-[1440px] px-4 py-6 pb-24 sm:px-6 md:pb-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
