import type { Metadata } from "next";

export const metadata: Metadata = { title: "Affiliate Disclosure", description: "How affiliate links work on Superbowl.gg." };

export default function AffiliateDisclosurePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-brand-text">Affiliate Disclosure</h1>
      <div className="space-y-4 text-sm leading-relaxed text-brand-muted">
        <p>
          Superbowl.gg is an independent community prediction platform. We may earn compensation from partner sites when you click
          affiliate links and complete qualifying actions on their websites. This never affects the price you pay.
        </p>
        <p>
          Sponsored offers and marketplace listings are clearly marked. Superbowl.gg itself does not accept sports wagers, does not
          process payments for betting, and our wallet is virtual currency only.
        </p>
        <p>
          Community predictions on Superbowl.gg are entertainment and analysis — they are not betting advice and do not guarantee outcomes.
          When you leave our site via an affiliate link, you are subject to that partner&apos;s terms, geo availability and age requirements.
        </p>
      </div>
    </div>
  );
}
