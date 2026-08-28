import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Offer restricted", description: "This offer isn't available in your region.", robots: { index: false, follow: false } };

export default async function OfferRestrictedPage({ searchParams }: { searchParams: Promise<{ offer?: string; reason?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-display text-2xl font-bold text-brand-text">This offer isn&apos;t available for you</h1>
      <p className="mt-2 text-sm text-brand-muted">
        {sp.reason ? decodeURIComponent(sp.reason) : "The offer is restricted in your region or you don't meet its requirements."}
      </p>
      <p className="mt-1 text-sm text-brand-muted">Community predictions are always available regardless of location.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Link href="/marketplace" className="btn-secondary">Back to Rewards Store</Link>
        <Link href="/games" className="btn-primary">Predict games</Link>
      </div>
    </div>
  );
}
