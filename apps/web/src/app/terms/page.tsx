import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service", description: "Superbowl.gg terms of service." };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-brand-muted">
      <h1 className="font-display text-3xl font-bold text-brand-text">Terms of Service</h1>
      <p><strong className="text-brand-text">Last updated:</strong> {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      <p>Superbowl.gg is a community platform for American football predictions, analytics and entertainment. It is not a sportsbook and does not accept real-money wagers.</p>
      <p>Coins are virtual currency with no cash value and cannot be withdrawn. Rewards Store offers are listed only by Superbowl.gg or verified partners; users cannot sell offers. Redemptions are fulfilled by third-party partners, and promo codes are passed through as provided.</p>
      <p>You are responsible for the accuracy of your account information. Prediction history is permanent and cannot be deleted except for legitimate administrative voids.</p>
      <p>You must not: abuse the platform, create multiple accounts to game referrals, post harmful content, or use the service where prohibited by local law.</p>
      <p>Superbowl.gg may suspend accounts that violate these terms. Questions: {process.env.EMAIL_FROM ?? "support@superbowl.gg"}.</p>
    </div>
  );
}
