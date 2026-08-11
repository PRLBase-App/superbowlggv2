import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy", description: "Superbowl.gg privacy policy." };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 text-sm leading-relaxed text-brand-muted">
      <h1 className="font-display text-3xl font-bold text-brand-text">Privacy Policy</h1>
      <p><strong className="text-brand-text">Last updated:</strong> {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
      <p>We collect only what Superbowl.gg needs to operate: account details (email, username), prediction history, coins and XP, and basic analytics (pages visited, device type, country).</p>
      <p>Google Analytics measures page views, traffic sources, device information and general usage through Google&apos;s web measurement technology. Google may set analytics cookies. Google and Telegram receive the data required when you deliberately choose their sign-in buttons; their own privacy terms also apply to that authentication step.</p>
      <p>We never sell personal data. Affiliate clicks record referrer, country and campaign so we can report conversions to partners — never your identity beyond what you choose to share publicly.</p>
      <p>Passwords are hashed and never stored in plaintext. Sessions are encrypted and expire automatically.</p>
      <p>You can request deletion of your account and data at any time by contacting {process.env.EMAIL_FROM ?? "support@superbowl.gg"}.</p>
    </div>
  );
}
