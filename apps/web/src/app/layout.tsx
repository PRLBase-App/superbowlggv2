import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import { headers } from "next/headers";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { SiteHeader } from "@/components/header";
import { SiteFooter } from "@/components/footer";
import { getSessionUser } from "@/lib/session";
import { brand, env } from "@sbgg/core";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-display" });

const HUB_CANONICAL_PATHS = new Set([
  "/", "/games", "/predictions", "/marketplace", "/achievements", "/how-it-works", "/blog",
  "/nfl", "/nfl/schedule", "/nfl/scores", "/nfl/standings", "/nfl/predictions", "/nfl/stats",
  "/nfl/news", "/nfl/teams", "/nfl/players", "/nfl/injuries", "/nfl/playoffs", "/nfl/power-rankings",
  "/super-bowl", "/super-bowl/predictions", "/super-bowl/odds", "/super-bowl/schedule",
  "/super-bowl/history", "/super-bowl/winners", "/super-bowl/mvp", "/super-bowl/records",
  "/super-bowl/locations", "/super-bowl/stadiums", "/affiliate-disclosure", "/responsible-gaming",
  "/privacy", "/terms",
]);

export const metadata: Metadata = {
  metadataBase: new URL(`https://${brand.domain}`),
  applicationName: "Superbowl.gg",
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
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
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
      </head>
      <body className="min-h-screen bg-brand-bg text-brand-text">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <SiteHeader user={user} />
        <main className="mx-auto min-h-[60vh] max-w-[1440px] px-4 py-6 pb-24 sm:px-6 md:pb-6">{children}</main>
        <SiteFooter />
      </body>
      {googleAnalyticsId ? <GoogleAnalytics gaId={googleAnalyticsId} /> : null}
    </html>
  );
}
